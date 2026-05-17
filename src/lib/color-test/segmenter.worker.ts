/// <reference lib="webworker" />
//
// Wall-segmentation worker for the paint colour-test.
//
// Runs an on-device semantic-segmentation model (SegFormer fine-tuned on
// ADE20K, which has a real "wall" class) off the main thread. The page posts
// a downscaled camera frame; this worker replies with a per-pixel wall mask.
// Because inference runs here, the camera preview on the main thread stays
// smooth no matter how slow a single inference is.

import { pipeline, RawImage, env } from "@huggingface/transformers";

// only fetch model weights from the Hugging Face hub, never the local origin
env.allowLocalModels = false;

const MODEL = "Xenova/segformer-b0-finetuned-ade-512-512";

type Segment = { label: string; score: number | null; mask: RawImage };
type Segmenter = (img: RawImage) => Promise<Segment[]>;

type OutMessage =
  | { type: "progress"; progress: number }
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "mask"; data: Uint8ClampedArray; width: number; height: number }
  | { type: "mask"; data: null };

type InMessage =
  | { type: "init" }
  | { type: "frame"; data: ArrayBuffer; width: number; height: number };

const ctx = self as unknown as {
  postMessage(message: OutMessage, transfer?: Transferable[]): void;
  addEventListener(
    type: "message",
    cb: (e: MessageEvent<InMessage>) => void,
  ): void;
};

let loadPromise: Promise<Segmenter> | null = null;

function load(): Promise<Segmenter> {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const common = {
      progress_callback: (p: { status: string; progress?: number }) => {
        if (p.status === "progress" && typeof p.progress === "number") {
          ctx.postMessage({ type: "progress", progress: p.progress / 100 });
        }
      },
    };
    // prefer the GPU (WebGPU); fall back to a quantised WASM build
    try {
      return (await pipeline("image-segmentation", MODEL, {
        ...common,
        device: "webgpu",
      })) as unknown as Segmenter;
    } catch {
      return (await pipeline("image-segmentation", MODEL, {
        ...common,
        device: "wasm",
        dtype: "q8",
      })) as unknown as Segmenter;
    }
  })();
  return loadPromise;
}

let busy = false;

ctx.addEventListener("message", async (e) => {
  const msg = e.data;

  if (msg.type === "init") {
    try {
      await load();
      ctx.postMessage({ type: "ready" });
    } catch (err) {
      ctx.postMessage({ type: "error", message: String(err) });
    }
    return;
  }

  if (msg.type === "frame") {
    if (busy) return; // drop frames while an inference is in flight
    busy = true;
    try {
      const segment = await load();
      const frame = new RawImage(
        new Uint8ClampedArray(msg.data),
        msg.width,
        msg.height,
        4,
      ).rgb();

      const segments = await segment(frame);
      const wall = segments.find((s) => s.label === "wall");

      if (wall) {
        const mask = wall.mask;
        ctx.postMessage(
          {
            type: "mask",
            data: mask.data as Uint8ClampedArray,
            width: mask.width,
            height: mask.height,
          },
          [(mask.data as Uint8ClampedArray).buffer],
        );
      } else {
        ctx.postMessage({ type: "mask", data: null });
      }
    } catch (err) {
      ctx.postMessage({ type: "error", message: String(err) });
    } finally {
      busy = false;
    }
  }
});

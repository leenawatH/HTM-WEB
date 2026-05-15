// Optional MediaPipe Selfie Segmentation — masks out people so they are
// not painted over. Loaded lazily; the colour test degrades gracefully to
// the colour-region heuristic alone if this fails to load.
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

let instance: ImageSegmenter | null = null;
let loading: Promise<ImageSegmenter | null> | null = null;

export async function loadPersonSegmenter(): Promise<ImageSegmenter | null> {
  if (instance) return instance;
  if (loading) return loading;

  loading = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
      instance = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "VIDEO",
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
      return instance;
    } catch (err) {
      console.warn("Person segmenter unavailable:", err);
      return null;
    }
  })();

  return loading;
}

// Returns a per-pixel mask (value > 128 = person) for the given frame,
// or null if segmentation is unavailable.
export function segmentPeople(
  segmenter: ImageSegmenter,
  frame: HTMLVideoElement | HTMLCanvasElement,
  timestamp: number,
): Uint8Array | null {
  try {
    const result = segmenter.segmentForVideo(frame, timestamp);
    const mask = result.categoryMask;
    if (!mask) return null;
    const raw = mask.getAsUint8Array();
    // copy before closing — MediaPipe recycles the buffer
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      out[i] = raw[i] > 0 ? 255 : 0;
    }
    mask.close();
    return out;
  } catch {
    return null;
  }
}

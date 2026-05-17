"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Aperture,
  Download,
  RotateCcw,
  Eye,
  Hand,
  Sparkles,
  SlidersHorizontal,
  Loader2,
  CameraOff,
  Eraser,
} from "lucide-react";
import { toast } from "sonner";
import type { ProductColor } from "@/lib/data";
import { hexToRgb, samplePatch, type RGB } from "@/lib/color-test/recolor";
import {
  createGLRecolor,
  type GLRecolor,
  type WallMode,
} from "@/lib/color-test/gl-recolor";
import { cn } from "@/lib/utils";

const MAX_W = 720;
const WORKER_W = 448; // frame width sent to the segmentation worker
const SEND_INTERVAL = 250; // ms — min gap between frames sent to the worker

type Status = "init" | "live" | "error";
// loading = downloading/initialising the AI model
// ready   = AI segmentation running
// failed  = AI unavailable, fall back to tap-to-sample chroma matching
type AiState = "loading" | "ready" | "failed";

type WorkerMsg =
  | { type: "progress"; progress: number }
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "mask"; data: Uint8ClampedArray; width: number; height: number }
  | { type: "mask"; data: null };

type Cfg = {
  mode: WallMode;
  refColor: RGB | null;
  paint: RGB;
  opacity: number;
  tolerance: number;
  showOriginal: boolean;
  frozen: boolean;
};

export function ColorTestStudio({
  product,
  colors,
}: {
  product: { name: string; slug: string };
  colors: ProductColor[];
}) {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("init");
  const [errorMsg, setErrorMsg] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const [aiState, setAiState] = useState<AiState>("loading");
  const [aiProgress, setAiProgress] = useState(0);
  const [maskReady, setMaskReady] = useState(false);

  const [selectedColor, setSelectedColor] = useState<ProductColor>(colors[0]);
  const [opacity, setOpacity] = useState(0.85);
  const [tolerance, setTolerance] = useState(0.4);
  const [refColor, setRefColor] = useState<RGB | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<GLRecolor | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerBusyRef = useRef(false);
  const lastSentRef = useRef(0);
  // offscreen 2D canvases — for tap sampling and for the worker frame grab
  const sampleRef = useRef<HTMLCanvasElement | null>(null);
  const workCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cfgRef = useRef<Cfg>({
    mode: "chroma",
    refColor: null,
    paint: hexToRgb(colors[0].hex),
    opacity: 0.85,
    tolerance: 0.4,
    showOriginal: false,
    frozen: false,
  });

  // keep the render loop's config in sync with React state
  useEffect(() => {
    cfgRef.current = {
      mode: aiState === "ready" ? "mask" : "chroma",
      refColor,
      paint: hexToRgb(selectedColor.hex),
      opacity,
      tolerance,
      showOriginal,
      frozen,
    };
  }, [aiState, refColor, selectedColor, opacity, tolerance, showOriginal, frozen]);

  // lock page scroll while the full-screen studio is mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // send a downscaled frame to the segmentation worker (throttled, and never
  // while a previous inference is still running)
  const sendFrame = useCallback((video: HTMLVideoElement) => {
    const worker = workerRef.current;
    if (!worker || workerBusyRef.current) return;
    const now = performance.now();
    if (now - lastSentRef.current < SEND_INTERVAL) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw) return;

    const w = WORKER_W;
    const h = Math.round((w * vh) / vw);
    const oc = workCanvasRef.current ?? document.createElement("canvas");
    workCanvasRef.current = oc;
    oc.width = w;
    oc.height = h;
    const octx = oc.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    octx.drawImage(video, 0, 0, w, h);
    const img = octx.getImageData(0, 0, w, h);

    workerBusyRef.current = true;
    lastSentRef.current = now;
    worker.postMessage(
      { type: "frame", data: img.data.buffer, width: w, height: h },
      [img.data.buffer],
    );
  }, []);

  // ---- camera render loop — one GPU draw call per frame ----------------
  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    const video = videoRef.current;
    const gl = glRef.current;
    if (!video || !gl || video.readyState < 2) return;

    const cfg = cfgRef.current;
    if (cfg.frozen) return; // keep the captured frame on screen

    gl.render(video, {
      active: !cfg.showOriginal,
      mode: cfg.mode,
      refColor: cfg.refColor,
      paint: cfg.paint,
      opacity: cfg.opacity,
      tolerance: cfg.tolerance,
    });
    if (cfg.mode === "mask") sendFrame(video);
  }, [sendFrame]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    glRef.current?.dispose();
    glRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    workerBusyRef.current = false;
  }, []);

  // ---- acquire the camera + start the AI worker -----------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // camera APIs require a secure context (HTTPS or localhost)
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg(
          "กล้องใช้งานได้เฉพาะการเชื่อมต่อที่ปลอดภัย (HTTPS) เท่านั้น",
        );
        setStatus("error");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        video.srcObject = stream;
        await video.play();

        // videoWidth is 0 until metadata loads — wait, or the canvas
        // would be sized 0×0 and nothing would render
        if (!video.videoWidth) {
          await new Promise<void>((resolve) => {
            video.addEventListener("loadedmetadata", () => resolve(), {
              once: true,
            });
          });
        }
        if (cancelled) return;

        const scale = Math.min(1, MAX_W / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const gl = createGLRecolor(canvas);
        if (!gl) {
          setErrorMsg("เบราว์เซอร์นี้ไม่รองรับการแสดงผลด้วย WebGL");
          setStatus("error");
          return;
        }
        glRef.current = gl;
        setStatus("live");
        rafRef.current = requestAnimationFrame(loop);

        // spin up the AI wall-segmentation worker
        const worker = new Worker(
          new URL(
            "../../lib/color-test/segmenter.worker.ts",
            import.meta.url,
          ),
          { type: "module" },
        );
        worker.onmessage = (ev: MessageEvent) => {
          const m = ev.data as WorkerMsg;
          if (m.type === "progress") {
            setAiProgress(m.progress);
          } else if (m.type === "ready") {
            setAiState("ready");
          } else if (m.type === "error") {
            setAiState("failed");
            toast.error(
              "โหลด AI ตรวจจับผนังไม่สำเร็จ — ใช้โหมดแตะเลือกผนังแทน",
            );
          } else if (m.type === "mask") {
            workerBusyRef.current = false;
            if (m.data) {
              glRef.current?.uploadMask(m.data, m.width, m.height);
              setMaskReady(true);
            }
          }
        };
        worker.onerror = () => {
          setAiState("failed");
          toast.error("โหลด AI ตรวจจับผนังไม่สำเร็จ — ใช้โหมดแตะเลือกผนังแทน");
        };
        workerRef.current = worker;
        worker.postMessage({ type: "init" });
      } catch (err) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const name = (err as Error)?.name;
        setErrorMsg(
          name === "NotAllowedError"
            ? "ไม่ได้รับอนุญาตให้ใช้กล้อง — กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์ แล้วลองอีกครั้ง"
            : name === "NotFoundError"
              ? "ไม่พบกล้องบนอุปกรณ์นี้"
              : "ไม่สามารถเข้าถึงกล้องได้ กรุณาลองใหม่อีกครั้ง",
        );
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [loop, stopCamera, retryKey]);

  // ---- tap to sample the wall colour (chroma fallback only) -----------
  function onCanvasTap(e: React.PointerEvent<HTMLCanvasElement>) {
    if (status !== "live" || aiState !== "failed" || cfgRef.current.frozen) {
      return;
    }
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const cw = canvas.width;
    const ch = canvas.height;
    if (!cw || !ch) return;

    // the canvas is shown with object-cover: content is scaled up by the
    // larger ratio and centre-cropped, so undo that to hit real pixels
    const rect = canvas.getBoundingClientRect();
    const scale = Math.max(rect.width / cw, rect.height / ch);
    const x = Math.round(
      (e.clientX - rect.left - (rect.width - cw * scale) / 2) / scale,
    );
    const y = Math.round(
      (e.clientY - rect.top - (rect.height - ch * scale) / 2) / scale,
    );
    if (x < 0 || y < 0 || x >= cw || y >= ch) return;

    // draw the current frame to an offscreen 2D canvas just for sampling
    const oc = sampleRef.current ?? document.createElement("canvas");
    sampleRef.current = oc;
    oc.width = cw;
    oc.height = ch;
    const octx = oc.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    octx.drawImage(video, 0, 0, cw, ch);
    setRefColor(samplePatch(octx.getImageData(0, 0, cw, ch), x, y));
  }

  // ---- capture / save / reset -----------------------------------------
  function capture() {
    setFrozen(true);
    toast.success('บันทึกภาพแล้ว — กด "บันทึกรูป" เพื่อดาวน์โหลด');
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `hortongmong-colortest-${product.slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function close() {
    stopCamera();
    router.push(`/product/${product.slug}`);
  }

  function retry() {
    setErrorMsg("");
    setRefColor(null);
    setFrozen(false);
    setAiState("loading");
    setAiProgress(0);
    setMaskReady(false);
    setStatus("init");
    setRetryKey((k) => k + 1);
  }

  // is a wall ready to be painted? (AI mask received, or a colour tapped)
  const wallSelected = aiState === "ready" ? maskReady : refColor != null;

  return (
    <div className="fixed inset-0 z-[60] select-none overflow-hidden bg-black">
      {/* offscreen source video — kept rendered (not display:none) so it
          reliably decodes frames to the canvas on mobile browsers */}
      <video
        ref={videoRef}
        className="pointer-events-none absolute left-0 top-0 size-px opacity-0"
        playsInline
        muted
      />

      <canvas
        ref={canvasRef}
        onPointerDown={onCanvasTap}
        className={cn(
          "size-full touch-none object-cover",
          aiState === "failed" && "[cursor:crosshair]",
        )}
      />

      {/* ---- initialising overlay ---- */}
      {status === "init" && (
        <div className="absolute inset-0 grid place-items-center bg-black text-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-white/80" />
            <p className="text-sm text-white/80">กำลังเปิดกล้อง…</p>
          </div>
        </div>
      )}

      {/* ---- error overlay ---- */}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-black px-8 text-center text-white">
          <div className="flex max-w-sm flex-col items-center gap-4">
            <span className="grid size-16 place-items-center rounded-full bg-white/10">
              <CameraOff className="size-8 text-white/80" />
            </span>
            <p className="text-sm leading-relaxed text-white/85">{errorMsg}</p>
            <div className="mt-1 flex flex-col gap-2">
              <button
                onClick={retry}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition active:scale-95"
              >
                ลองอีกครั้ง
              </button>
              <button
                onClick={close}
                className="rounded-full px-6 py-2 text-sm text-white/70 transition hover:text-white"
              >
                กลับไปหน้าสินค้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- top bar ---- */}
      {status === "live" && (
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-4 pb-12">
          <button
            onClick={close}
            aria-label="ปิด"
            className="grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition active:scale-90"
          >
            <X className="size-5" />
          </button>
          <div className="pt-0.5 text-right text-white drop-shadow">
            <p className="text-[11px] uppercase tracking-wide text-white/65">
              ทดลองสี
            </p>
            <p className="text-sm font-medium leading-tight">{product.name}</p>
          </div>
        </div>
      )}

      {/* ---- AI status / hint pill ---- */}
      {status === "live" && !frozen && (
        <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-center px-6">
          {aiState === "loading" && (
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
              <Loader2 className="size-4 animate-spin" />
              กำลังโหลด AI ตรวจจับผนัง… {Math.round(aiProgress * 100)}%
            </div>
          )}
          {aiState === "ready" && !maskReady && (
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
              <Sparkles className="size-4" />
              เล็งกล้องไปที่ผนัง — AI กำลังตรวจจับ
            </div>
          )}
          {aiState === "failed" && !refColor && (
            <div className="flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-sm text-white backdrop-blur-sm">
              <Hand className="size-4" />
              แตะที่ผนังในภาพเพื่อเริ่มทดลองสี
            </div>
          )}
        </div>
      )}

      {/* ---- bottom controls ---- */}
      {status === "live" && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/70 to-transparent px-3 pb-5 pt-16">
          {/* settings drawer */}
          {settingsOpen && (
            <div className="mx-auto mb-3 max-w-md space-y-4 rounded-2xl bg-black/75 p-4 text-white backdrop-blur-md">
              <Slider
                label="ความเข้มของสี"
                value={opacity}
                min={0.2}
                max={1}
                step={0.05}
                onChange={setOpacity}
              />
              {aiState === "failed" && (
                <Slider
                  label="ขอบเขตการตรวจจับผนัง"
                  value={tolerance}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={setTolerance}
                />
              )}
              {aiState === "failed" && refColor && (
                <button
                  onClick={() => setRefColor(null)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm transition active:scale-95"
                >
                  <Eraser className="size-4" />
                  เลือกจุดผนังใหม่
                </button>
              )}
              {aiState === "ready" && (
                <p className="flex items-center gap-2 text-xs text-white/60">
                  <Sparkles className="size-3.5" />
                  AI ตรวจจับผนังให้อัตโนมัติ
                </p>
              )}
            </div>
          )}

          {/* selected colour label */}
          <p className="mb-2 text-center text-sm text-white drop-shadow">
            <span className="text-white/65">สี</span>{" "}
            <span className="font-medium">{selectedColor.nameTh}</span>{" "}
            <span className="text-xs text-white/55">{selectedColor.code}</span>
          </p>

          {/* colour strip */}
          <div className="mx-auto flex max-w-2xl gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c)}
                aria-label={c.nameTh}
                title={`${c.nameTh} (${c.code})`}
                className={cn(
                  "size-11 shrink-0 rounded-full shadow-md transition",
                  c.id === selectedColor.id
                    ? "scale-110 ring-2 ring-white"
                    : "ring-1 ring-white/25",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* action row */}
          <div className="mx-auto mt-3 grid max-w-md grid-cols-3 items-center">
            <div className="flex justify-start">
              {!frozen ? (
                <ActionButton
                  label="ก่อน/หลัง"
                  disabled={!wallSelected}
                  onPointerDown={() => setShowOriginal(true)}
                  onPointerUp={() => setShowOriginal(false)}
                  onPointerLeave={() => setShowOriginal(false)}
                >
                  <Eye className="size-5" />
                </ActionButton>
              ) : (
                <ActionButton
                  label="ถ่ายใหม่"
                  onClick={() => setFrozen(false)}
                >
                  <RotateCcw className="size-5" />
                </ActionButton>
              )}
            </div>

            <div className="flex justify-center">
              {!frozen ? (
                <button
                  onClick={capture}
                  aria-label="ถ่ายภาพ"
                  className="grid size-[68px] place-items-center rounded-full ring-4 ring-white/90 transition active:scale-90"
                >
                  <span className="grid size-14 place-items-center rounded-full bg-white">
                    <Aperture className="size-6 text-black" />
                  </span>
                </button>
              ) : (
                <button
                  onClick={save}
                  aria-label="บันทึกรูป"
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition active:scale-95"
                >
                  <Download className="size-5" />
                  บันทึกรูป
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <ActionButton
                label="ปรับแต่ง"
                active={settingsOpen}
                onClick={() => setSettingsOpen((v) => !v)}
              >
                <SlidersHorizontal className="size-5" />
              </ActionButton>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-white/45">
            * ผลลัพธ์เป็นการประมาณการ — สีจริงอาจต่างตามแสงและพื้นผิว
          </p>
        </div>
      )}
    </div>
  );
}

// ---- small overlay control building blocks ---------------------------
function ActionButton({
  label,
  children,
  active,
  disabled,
  ...handlers
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
}) {
  return (
    <button
      {...handlers}
      disabled={disabled}
      aria-label={label}
      className="flex flex-col items-center gap-1 text-white transition active:scale-90 disabled:opacity-35"
    >
      <span
        className={cn(
          "grid size-12 place-items-center rounded-full backdrop-blur-sm transition-colors",
          active ? "bg-white text-black" : "bg-black/45",
        )}
      >
        {children}
      </span>
      <span className="text-[10px] text-white/70">{label}</span>
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-white/60">{Math.round(value * 100)}%</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-white"
      />
    </div>
  );
}

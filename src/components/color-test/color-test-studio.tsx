"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Aperture,
  Download,
  RefreshCw,
  Eye,
  UserRoundX,
  Hand,
} from "lucide-react";
import { toast } from "sonner";
import type { ImageSegmenter } from "@mediapipe/tasks-vision";
import type { ProductColor } from "@/lib/data";
import { hexToRgb, recolor, samplePatch, type RGB } from "@/lib/color-test/recolor";
import {
  loadPersonSegmenter,
  segmentPeople,
} from "@/lib/color-test/person-segmenter";
import { Button } from "@/components/ui/button";
import { ColorSwatches } from "@/components/color-test/color-swatches";
import { cn } from "@/lib/utils";

const MAX_W = 640;

type Mode = "menu" | "camera" | "upload";

type Cfg = {
  refColor: RGB | null;
  paint: RGB;
  opacity: number;
  tolerance: number;
  usePerson: boolean;
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
  const [mode, setMode] = useState<Mode>("menu");
  const [selectedColor, setSelectedColor] = useState<ProductColor>(colors[0]);
  const [opacity, setOpacity] = useState(0.85);
  const [tolerance, setTolerance] = useState(0.4);
  const [refColor, setRefColor] = useState<RGB | null>(null);
  const [usePerson, setUsePerson] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [segmenterReady, setSegmenterReady] = useState(false);
  const [ready, setReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const dstRef = useRef<ImageData | null>(null);
  const staticSrcRef = useRef<ImageData | null>(null);
  const segmenterRef = useRef<ImageSegmenter | null>(null);
  const cfgRef = useRef<Cfg>({
    refColor: null,
    paint: hexToRgb(colors[0].hex),
    opacity: 0.85,
    tolerance: 0.4,
    usePerson: false,
    showOriginal: false,
    frozen: false,
  });

  // keep the render loop's config in sync with React state
  useEffect(() => {
    cfgRef.current = {
      refColor,
      paint: hexToRgb(selectedColor.hex),
      opacity,
      tolerance,
      usePerson,
      showOriginal,
      frozen,
    };
  }, [refColor, selectedColor, opacity, tolerance, usePerson, showOriginal, frozen]);

  const ctx2d = useCallback(() => {
    return canvasRef.current?.getContext("2d", {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D | null;
  }, []);

  // ---- static (upload) re-render on control change --------------------
  const renderStatic = useCallback(() => {
    const ctx = ctx2d();
    const canvas = canvasRef.current;
    const src = staticSrcRef.current;
    if (!ctx || !canvas || !src) return;
    const cfg = cfgRef.current;
    if (cfg.showOriginal || !cfg.refColor) {
      ctx.putImageData(src, 0, 0);
      return;
    }
    if (
      !dstRef.current ||
      dstRef.current.width !== canvas.width ||
      dstRef.current.height !== canvas.height
    ) {
      dstRef.current = ctx.createImageData(canvas.width, canvas.height);
    }
    recolor(src, dstRef.current, {
      refColor: cfg.refColor,
      paint: cfg.paint,
      opacity: cfg.opacity,
      tolerance: cfg.tolerance,
    });
    ctx.putImageData(dstRef.current, 0, 0);
  }, [ctx2d]);

  useEffect(() => {
    if (mode === "upload") renderStatic();
  }, [mode, refColor, selectedColor, opacity, tolerance, showOriginal, renderStatic]);

  // ---- camera render loop ---------------------------------------------
  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = ctx2d();
    if (!video || !canvas || !ctx || video.readyState < 2) return;

    const cfg = cfgRef.current;
    if (cfg.frozen) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (cfg.showOriginal || !cfg.refColor) return; // raw frame shown

    const src = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let personMask: Uint8Array | null = null;
    if (cfg.usePerson && segmenterRef.current) {
      const m = segmentPeople(segmenterRef.current, canvas, performance.now());
      if (m && m.length === canvas.width * canvas.height) personMask = m;
    }

    if (
      !dstRef.current ||
      dstRef.current.width !== canvas.width ||
      dstRef.current.height !== canvas.height
    ) {
      dstRef.current = ctx.createImageData(canvas.width, canvas.height);
    }
    recolor(src, dstRef.current, {
      refColor: cfg.refColor,
      paint: cfg.paint,
      opacity: cfg.opacity,
      tolerance: cfg.tolerance,
      personMask,
    });
    ctx.putImageData(dstRef.current, 0, 0);
  }, [ctx2d]);

  // ---- start / stop camera --------------------------------------------
  // The <video>/<canvas> elements only exist once mode !== "menu", so we
  // switch into camera mode first and let the effect below acquire the
  // stream once those elements have actually mounted.
  const startCamera = useCallback(() => {
    // camera APIs require a secure context (HTTPS or localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        'กล้องใช้งานได้เฉพาะการเชื่อมต่อที่ปลอดภัย (HTTPS) — เปิดเว็บผ่าน https:// หรือเลือก "อัปโหลดรูปภาพ" แทน',
      );
      return;
    }
    setMode("camera");
  }, []);

  // acquire the camera stream once the camera view is mounted
  useEffect(() => {
    if (mode !== "camera") return;
    let cancelled = false;

    (async () => {
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

        // videoWidth is 0 until metadata loads — wait for it, otherwise the
        // canvas would be sized 0×0 and nothing renders
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

        setReady(true);
        rafRef.current = requestAnimationFrame(loop);

        // load person segmenter in the background
        loadPersonSegmenter().then((seg) => {
          if (seg && !cancelled) {
            segmenterRef.current = seg;
            setSegmenterReady(true);
          }
        });
      } catch (err) {
        // stop the stream so the camera indicator turns off on failure
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const name = (err as Error)?.name;
        if (name === "NotAllowedError") {
          toast.error("ไม่ได้รับอนุญาตให้ใช้กล้อง — กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์");
        } else if (name === "NotFoundError") {
          toast.error("ไม่พบกล้องบนอุปกรณ์นี้ — ลองอัปโหลดรูปแทน");
        } else {
          toast.error("ไม่สามารถเข้าถึงกล้องได้ — ลองอัปโหลดรูปแทน");
        }
        if (!cancelled) setMode("menu");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, loop]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  // ---- upload ----------------------------------------------------------
  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const ctx = ctx2d();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      const scale = Math.min(1, MAX_W / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      staticSrcRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setRefColor(null);
      setMode("upload");
      setReady(true);
    };
    img.src = URL.createObjectURL(file);
  }

  // ---- tap to sample the wall colour ----------------------------------
  function onCanvasTap(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = ctx2d();
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    const src =
      mode === "upload" && staticSrcRef.current
        ? staticSrcRef.current
        : ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRefColor(samplePatch(src, x, y));
  }

  // ---- capture / save / reset -----------------------------------------
  function capture() {
    setFrozen(true);
    toast.success("บันทึกภาพแล้ว — กด \"บันทึกรูป\" เพื่อดาวน์โหลด");
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `hortongmong-colortest-${product.slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function restart() {
    stopCamera();
    setMode("menu");
    setReady(false);
    setRefColor(null);
    setFrozen(false);
    staticSrcRef.current = null;
  }

  // ---- menu screen -----------------------------------------------------
  if (mode === "menu") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={startCamera}
          className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center transition-colors hover:border-brand"
        >
          <span className="grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
            <Camera className="size-7" />
          </span>
          <span className="font-heading font-semibold">ใช้กล้องถ่ายสด</span>
          <span className="text-sm text-muted-foreground">
            เปิดกล้องส่องไปที่ผนัง แล้วทดลองสีแบบเรียลไทม์
          </span>
        </button>
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center transition-colors hover:border-brand">
          <span className="grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
            <Upload className="size-7" />
          </span>
          <span className="font-heading font-semibold">อัปโหลดรูปภาพ</span>
          <span className="text-sm text-muted-foreground">
            เลือกรูปห้องของคุณจากเครื่อง
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      {/* canvas stage */}
      <div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-black">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas
            ref={canvasRef}
            onPointerDown={onCanvasTap}
            className="w-full cursor-crosshair touch-none"
          />
          {ready && !refColor && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white">
              <Hand className="size-4" />
              แตะที่ผนังในภาพเพื่อเริ่มทดลองสี
            </div>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          * ผลลัพธ์เป็นการประมาณการ — สีจริงอาจแตกต่างตามแสงและพื้นผิว
        </p>
      </div>

      {/* controls */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium">
            สี: {selectedColor.nameTh}{" "}
            <span className="text-muted-foreground">({selectedColor.code})</span>
          </p>
          <div className="mt-2">
            <ColorSwatches
              colors={colors}
              selectedId={selectedColor.id}
              onSelect={setSelectedColor}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div>
            <label className="flex justify-between text-sm">
              <span>ความเข้มของสี</span>
              <span className="text-muted-foreground">
                {Math.round(opacity * 100)}%
              </span>
            </label>
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-1 w-full accent-brand"
            />
          </div>
          <div>
            <label className="flex justify-between text-sm">
              <span>ขอบเขตการตรวจจับผนัง</span>
              <span className="text-muted-foreground">
                {Math.round(tolerance * 100)}%
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="mt-1 w-full accent-brand"
            />
          </div>
          {mode === "camera" && (
            <button
              onClick={() => setUsePerson((v) => !v)}
              disabled={!segmenterReady}
              className={cn(
                "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors disabled:opacity-50",
                usePerson
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border",
              )}
            >
              <span className="flex items-center gap-2">
                <UserRoundX className="size-4" />
                ไม่ทาสีทับคน
              </span>
              <span className="text-xs">
                {!segmenterReady
                  ? "กำลังโหลด..."
                  : usePerson
                    ? "เปิด"
                    : "ปิด"}
              </span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onPointerDown={() => setShowOriginal(true)}
            onPointerUp={() => setShowOriginal(false)}
            onPointerLeave={() => setShowOriginal(false)}
          >
            <Eye className="size-4" />
            ดูก่อน/หลัง
          </Button>
          {mode === "camera" && !frozen ? (
            <Button
              className="bg-brand hover:bg-brand-hover"
              onClick={capture}
            >
              <Aperture className="size-4" />
              ถ่ายภาพ
            </Button>
          ) : (
            <Button className="bg-brand hover:bg-brand-hover" onClick={save}>
              <Download className="size-4" />
              บันทึกรูป
            </Button>
          )}
        </div>

        {mode === "camera" && frozen && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setFrozen(false)}
          >
            <RefreshCw className="size-4" />
            ถ่ายใหม่
          </Button>
        )}

        <Button variant="ghost" className="w-full" onClick={restart}>
          เริ่มใหม่ / เปลี่ยนรูป
        </Button>
      </div>
    </div>
  );
}

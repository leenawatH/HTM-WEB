"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  gradient: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "🎨 ฟีเจอร์เด่น",
    title: "ทดลองสีบนผนังจริง ก่อนตัดสินใจซื้อ",
    subtitle: "เปิดกล้องมือถือ แล้วทาสีที่ผนังบ้านคุณได้ทันที เห็นผลก่อนซื้อจริง",
    ctaLabel: "ดูสินค้าสีทั้งหมด",
    ctaHref: "/category/paint",
    gradient: "from-[#16284F] to-[#2B4C8C]",
  },
  {
    eyebrow: "โปรโมชัน",
    title: "ส่งฟรีทั่วประเทศ เมื่อซื้อครบ ฿1,000",
    subtitle: "ลูกค้าใหม่รับส่วนลด 10% ทันที ใช้โค้ด WELCOME10 ที่หน้าชำระเงิน",
    ctaLabel: "ช้อปเลย",
    ctaHref: "/category/all",
    gradient: "from-[#C2410C] to-[#F97316]",
  },
  {
    eyebrow: "คุณภาพมั่นใจ",
    title: "รวมสีและเครื่องมือช่าง จาก 7 แบรนด์ชั้นนำ",
    subtitle: "TOA · Captain · JBP · QQQ · 3M · Nippon · Dulux ครบในที่เดียว",
    ctaLabel: "ดูแบรนด์ทั้งหมด",
    ctaHref: "/#brands",
    gradient: "from-[#155E5A] to-[#5E8C97]",
  },
];

const INTERVAL = 6000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[420px] sm:h-[460px]">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
              slide.gradient,
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <div className="absolute -right-20 top-10 size-72 rounded-full bg-white/5" />
            <div className="absolute -bottom-24 left-1/4 size-80 rounded-full bg-white/5" />
            <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center gap-5 px-6 text-white">
              <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
                {slide.eyebrow}
              </span>
              <h1 className="max-w-2xl font-heading text-3xl font-semibold leading-tight sm:text-5xl">
                {slide.title}
              </h1>
              <p className="max-w-xl text-white/80 sm:text-lg">
                {slide.subtitle}
              </p>
              <Button
                render={<Link href={slide.ctaHref} />}
                size="lg"
                className="w-fit bg-brand hover:bg-brand-hover"
              >
                {slide.ctaLabel}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* arrows */}
      <button
        onClick={() => go(index - 1)}
        aria-label="ก่อนหน้า"
        className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="ถัดไป"
        className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`สไลด์ ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-7 bg-brand" : "w-2 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </section>
  );
}

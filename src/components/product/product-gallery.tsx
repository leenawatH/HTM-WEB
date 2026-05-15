"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const pics = images.length > 0 ? images : [{ url: "/products/placeholder.svg", alt: name }];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* main image — hover to zoom */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <Image
          src={pics[active].url}
          alt={pics[active].alt ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-200"
          style={{
            transform: zoom ? "scale(1.9)" : "scale(1)",
            transformOrigin: origin,
          }}
        />
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white">
          เลื่อนเมาส์เพื่อซูม
        </span>
      </div>

      {/* thumbnails */}
      {pics.length > 1 && (
        <div className="flex gap-2.5">
          {pics.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`รูปที่ ${i + 1}`}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-md border bg-secondary transition-colors",
                i === active
                  ? "border-brand ring-1 ring-brand"
                  : "border-border hover:border-brand/50",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

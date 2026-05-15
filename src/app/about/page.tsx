import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Wrench,
  HeartHandshake,
  Camera,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
} from "lucide-react";
import { STORE } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "เรื่องราว พันธกิจ และค่านิยมของ Hor Tong Mong",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "สินค้าคุณภาพ",
    text: "คัดสรรสีและเครื่องมือจากแบรนด์ชั้นนำที่ได้มาตรฐาน ใช้งานได้จริง ทนทาน",
  },
  {
    icon: Wrench,
    title: "ความเชี่ยวชาญ",
    text: "ทีมงานมีประสบการณ์ด้านงานสีและงานช่าง พร้อมให้คำแนะนำที่ตรงกับงานของคุณ",
  },
  {
    icon: HeartHandshake,
    title: "บริการหลังการขาย",
    text: "ดูแลลูกค้าทุกขั้นตอน ตั้งแต่เลือกซื้อจนถึงหลังการใช้งาน เปลี่ยน/คืนได้ภายใน 7 วัน",
  },
  {
    icon: Camera,
    title: "ทดลองสีก่อนซื้อ",
    text: "เทคโนโลยีทดลองสีบนผนังจริงผ่านกล้อง ช่วยให้ตัดสินใจได้มั่นใจก่อนซื้อจริง",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-[1100px] px-4 py-16 text-center sm:py-20">
          <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
            เกี่ยวกับ {STORE.name}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/75">
            {STORE.tagline} — ที่ที่ช่างมืออาชีพและเจ้าของบ้านไว้วางใจ
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-4">
        {/* story */}
        <section className="py-14">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            เรื่องราวของเรา
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
            <p>
              {STORE.name} เริ่มต้นจากร้านขายสีและอุปกรณ์ช่างเล็กๆ
              ที่ตั้งใจคัดสรรสินค้าคุณภาพในราคาที่เป็นธรรม
              ด้วยความเชื่อที่ว่างานทาสีและงานช่างที่ดี เริ่มจากวัสดุที่ดี
              และคำแนะนำที่จริงใจ
            </p>
            <p>
              วันนี้เรารวบรวมสีและเครื่องมือจาก 7 แบรนด์ชั้นนำ
              ทั้ง TOA, Captain, JBP, QQQ, 3M, Nippon Paint และ Dulux
              ไว้ในที่เดียว พร้อมนำเทคโนโลยีเข้ามาช่วยให้ลูกค้า
              เลือกสีได้อย่างมั่นใจ ผ่านฟีเจอร์ทดลองสีบนผนังจริง
            </p>
          </div>
        </section>

        {/* mission */}
        <section className="rounded-xl bg-secondary p-8 text-center">
          <h2 className="font-heading text-xl font-semibold text-primary">
            พันธกิจของเรา
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-foreground/80">
            มุ่งมั่นเป็นร้านสีและเครื่องมือช่างที่ลูกค้าไว้วางใจที่สุด
            ด้วยสินค้าคุณภาพ บริการที่จริงใจ
            และนวัตกรรมที่ทำให้การเลือกซื้อง่ายและมั่นใจยิ่งขึ้น
          </p>
        </section>

        {/* why choose us */}
        <section className="py-14">
          <h2 className="text-center font-heading text-2xl font-semibold text-foreground">
            ทำไมต้องเลือกเรา
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-lg border border-border bg-card p-5"
              >
                <span className="grid size-11 place-items-center rounded-full bg-brand/10 text-brand">
                  <v.icon className="size-5" />
                </span>
                <h3 className="mt-3 font-heading font-semibold text-foreground">
                  {v.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* contact / location */}
        <section className="pb-16">
          <div className="grid gap-6 rounded-xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">
                ติดต่อเรา
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-foreground/80">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-brand" />
                  {STORE.address}
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0 text-brand" />
                  {STORE.phone}
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="size-5 shrink-0 text-brand" />
                  {STORE.email}
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="size-5 shrink-0 text-brand" />
                  {STORE.hours}
                </li>
              </ul>
              <Button
                render={<Link href="/category/all" />}
                className="mt-6 bg-brand hover:bg-brand-hover"
              >
                เริ่มเลือกซื้อสินค้า
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="grid min-h-48 place-items-center rounded-lg bg-secondary text-sm text-muted-foreground">
              <span className="flex flex-col items-center gap-2">
                <MapPin className="size-8 text-brand" />
                แผนที่ร้าน {STORE.name}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

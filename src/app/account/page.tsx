import type { Metadata } from "next";
import { auth } from "@/auth";
import { getUserProfile } from "@/lib/data";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "โปรไฟล์" };

const TIER: Record<string, { label: string; className: string }> = {
  BRONZE: { label: "ทองแดง", className: "bg-amber-700/15 text-amber-700" },
  SILVER: { label: "เงิน", className: "bg-slate-400/20 text-slate-600" },
  GOLD: { label: "ทอง", className: "bg-amber-400/20 text-amber-600" },
};

const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "long" });

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;
  const profile = await getUserProfile(session.user.id);
  if (!profile) return null;

  const tier = TIER[profile.loyaltyTier] ?? TIER.BRONZE;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">ข้อมูลส่วนตัว</h2>
            <p className="text-sm text-muted-foreground">
              อีเมล: {profile.email}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${tier.className}`}
          >
            สมาชิกระดับ{tier.label}
          </span>
        </div>
        <ProfileForm
          initialName={profile.name ?? ""}
          initialPhone={profile.phone ?? ""}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">คำสั่งซื้อทั้งหมด</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-brand">
            {profile.orderCount} ครั้ง
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">เป็นสมาชิกตั้งแต่</p>
          <p className="mt-1 font-heading text-lg font-semibold">
            {dateFmt.format(new Date(profile.createdAt))}
          </p>
        </div>
      </section>
    </div>
  );
}

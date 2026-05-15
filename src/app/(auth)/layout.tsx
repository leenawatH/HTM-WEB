import Link from "next/link";
import { PaintBucket } from "lucide-react";
import { STORE } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <PaintBucket className="size-5" />
          </span>
          <span className="font-heading text-xl font-semibold text-primary">
            {STORE.name}
          </span>
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

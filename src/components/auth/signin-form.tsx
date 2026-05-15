"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SigninForm({
  callbackUrl,
  googleEnabled,
}: {
  callbackUrl: string;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      toast.success("เข้าสู่ระบบสำเร็จ");
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">เข้าสู่ระบบ</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ยินดีต้อนรับกลับมา
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5">
            อีเมล
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand hover:underline"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand-hover"
          disabled={pending}
        >
          {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            หรือ
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl })}
          >
            เข้าสู่ระบบด้วย Google
          </Button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        หรือ{" "}
        <Link href="/" className="text-brand hover:underline">
          ช้อปปิ้งแบบไม่ต้องเข้าสู่ระบบ
        </Link>{" "}
        ก็ได้
      </p>

      <p className="mt-4 rounded-md bg-secondary px-3 py-2 text-center text-xs text-muted-foreground">
        ทดลองใช้: demo@hortongmong.co.th / demo1234
      </p>
    </div>
  );
}

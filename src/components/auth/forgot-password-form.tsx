"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await requestPasswordReset(email);
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto size-12 text-success" />
        <h1 className="mt-3 font-heading text-xl font-semibold">
          ตรวจสอบอีเมลของคุณ
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          หากมีบัญชีที่ใช้อีเมล <strong>{email}</strong> เราได้ส่งลิงก์
          สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว
        </p>
        <Button
          render={<Link href="/signin" />}
          className="mt-5 w-full bg-brand hover:bg-brand-hover"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">ลืมรหัสผ่าน</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้
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
        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand-hover"
          disabled={pending}
        >
          {pending ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/signin" className="font-medium text-brand hover:underline">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}

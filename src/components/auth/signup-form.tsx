"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    startTransition(async () => {
      const res = await registerUser({ name, email, password });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      // sign in immediately after registration
      await signIn("credentials", { email, password, redirect: false });
      toast.success("สมัครสมาชิกสำเร็จ — รับโค้ดส่วนลดต้อนรับแล้ว");
      router.push("/account");
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">สมัครสมาชิก</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        สมัครฟรี รับโค้ดส่วนลดต้อนรับทันที
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name" className="mb-1.5">
            ชื่อ-นามสกุล
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
          <Label htmlFor="password" className="mb-1.5">
            รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <Label htmlFor="confirm" className="mb-1.5">
            ยืนยันรหัสผ่าน
          </Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand-hover"
          disabled={pending}
        >
          {pending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
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
            onClick={() => signIn("google", { callbackUrl: "/account" })}
          >
            สมัครด้วย Google
          </Button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/signin" className="font-medium text-brand hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}

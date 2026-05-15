"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  initialName,
  initialPhone,
}: {
  initialName: string;
  initialPhone: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfile({ name, phone });
      if (res.ok) toast.success("บันทึกข้อมูลแล้ว");
      else toast.error(res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
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
        <Label htmlFor="phone" className="mb-1.5">
          เบอร์โทรศัพท์
        </Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08x-xxx-xxxx"
        />
      </div>
      <div className="sm:col-span-2">
        <Button
          type="submit"
          className="bg-brand hover:bg-brand-hover"
          disabled={pending}
        >
          {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </Button>
      </div>
    </form>
  );
}

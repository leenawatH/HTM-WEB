"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MapPin, Plus, Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type AddressInput,
} from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Address = AddressInput & { id: string; isDefault: boolean };

const EMPTY: AddressInput = {
  label: "",
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [pending, startTransition] = useTransition();

  function openAdd() {
    setForm(EMPTY);
    setEditingId(null);
    setAdding(true);
  }

  function openEdit(a: Address) {
    setForm({
      label: a.label,
      recipient: a.recipient,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      subdistrict: a.subdistrict ?? "",
      district: a.district,
      province: a.province,
      postalCode: a.postalCode,
    });
    setEditingId(a.id);
    setAdding(false);
  }

  function close() {
    setAdding(false);
    setEditingId(null);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = editingId
        ? await updateAddress(editingId, form)
        : await addAddress(form);
      if (res.ok) {
        toast.success("บันทึกที่อยู่แล้ว");
        close();
        router.refresh();
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteAddress(id);
      toast.success("ลบที่อยู่แล้ว");
      router.refresh();
    });
  }

  function makeDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
      router.refresh();
    });
  }

  const showForm = adding || editingId !== null;

  return (
    <div className="space-y-3">
      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-12 text-center">
          <MapPin className="size-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            ยังไม่มีที่อยู่จัดส่ง
          </p>
        </div>
      )}

      {addresses.map((a) => (
        <div
          key={a.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{a.label}</span>
              {a.isDefault && (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  ค่าเริ่มต้น
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {!a.isDefault && (
                <button
                  onClick={() => makeDefault(a.id)}
                  disabled={pending}
                  title="ตั้งเป็นค่าเริ่มต้น"
                  className="text-muted-foreground hover:text-brand"
                >
                  <Star className="size-4" />
                </button>
              )}
              <button
                onClick={() => openEdit(a)}
                title="แก้ไข"
                className="text-muted-foreground hover:text-brand"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => remove(a.id)}
                disabled={pending}
                title="ลบ"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm font-medium">
            {a.recipient} · {a.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {a.line1}
            {a.line2 ? ` ${a.line2}` : ""}{" "}
            {[a.subdistrict, a.district, a.province, a.postalCode]
              .filter(Boolean)
              .join(" ")}
          </p>
        </div>
      ))}

      {showForm ? (
        <form
          onSubmit={save}
          className="rounded-lg border border-border bg-card p-4"
        >
          <h3 className="font-heading text-base font-semibold">
            {editingId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <AddrField label="ชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)">
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="บ้าน"
              />
            </AddrField>
            <AddrField label="ชื่อผู้รับ" required>
              <Input
                value={form.recipient}
                onChange={(e) =>
                  setForm({ ...form, recipient: e.target.value })
                }
                required
              />
            </AddrField>
            <AddrField label="เบอร์โทรศัพท์" required>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </AddrField>
            <AddrField label="ที่อยู่" required className="sm:col-span-2">
              <Input
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                required
              />
            </AddrField>
            <AddrField label="ตำบล / แขวง">
              <Input
                value={form.subdistrict}
                onChange={(e) =>
                  setForm({ ...form, subdistrict: e.target.value })
                }
              />
            </AddrField>
            <AddrField label="อำเภอ / เขต" required>
              <Input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                required
              />
            </AddrField>
            <AddrField label="จังหวัด" required>
              <Input
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                required
              />
            </AddrField>
            <AddrField label="รหัสไปรษณีย์" required>
              <Input
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
                required
              />
            </AddrField>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              type="submit"
              className="bg-brand hover:bg-brand-hover"
              disabled={pending}
            >
              บันทึก
            </Button>
            <Button type="button" variant="ghost" onClick={close}>
              ยกเลิก
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={openAdd} className="w-full">
          <Plus className="size-4" />
          เพิ่มที่อยู่ใหม่
        </Button>
      )}
    </div>
  );
}

function AddrField({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 text-sm">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

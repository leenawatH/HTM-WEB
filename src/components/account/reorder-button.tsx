"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getReorderItems } from "@/actions/order";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

export function ReorderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [pending, startTransition] = useTransition();

  function reorder() {
    startTransition(async () => {
      const res = await getReorderItems(orderNumber);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      for (const line of res.lines) {
        addItem(line.item, line.quantity);
      }
      toast.success("เพิ่มสินค้าลงตะกร้าแล้ว");
      router.push("/cart");
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={reorder} disabled={pending}>
      <RotateCcw className="size-4" />
      สั่งซื้ออีกครั้ง
    </Button>
  );
}

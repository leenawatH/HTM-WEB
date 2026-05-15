import type { Metadata } from "next";
import { auth } from "@/auth";
import { getUserAddresses } from "@/lib/data";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = { title: "ที่อยู่จัดส่ง" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) return null;
  const addresses = await getUserAddresses(session.user.id);

  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-semibold">
        ที่อยู่จัดส่ง
      </h2>
      <AddressManager
        addresses={addresses.map((a) => ({
          ...a,
          line2: a.line2 ?? "",
          subdistrict: a.subdistrict ?? "",
        }))}
      />
    </div>
  );
}

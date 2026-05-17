import { Loader2 } from "lucide-react";

// Root loading fallback — shown instantly on navigation to any route that
// doesn't define its own loading.tsx (cart, checkout, account, home, …).
export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="size-8 animate-spin text-brand" />
    </div>
  );
}

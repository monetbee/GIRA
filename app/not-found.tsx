import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3f0] px-6">
      <div className="max-w-lg text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#666666]">Lost in the edit</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-[#111111]">404</h1>
        <p className="mt-4 text-lg text-[#4b5563]">This page isn’t in the rotation right now.</p>
        <Link href="/" className="mt-8 inline-block">
          <Button>Back to GIRA</Button>
        </Link>
      </div>
    </main>
  );
}

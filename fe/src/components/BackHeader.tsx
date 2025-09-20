"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

interface BackHeaderProps {
  title: string;
}

export default function BackHeader({ title }: BackHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 p-4 border-b">
      <button onClick={() => router.back()} className="hover:text-primary">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  );
}

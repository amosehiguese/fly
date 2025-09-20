"use client";

import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import React from "react";

const Nav = () => {
  const router = useRouter();
  return (
    <nav className="flex justify-between mt-4 w-full px-12">
      <Image
        src={"/logo.png"}
        width={100}
        height={100}
        alt="logo"
        className="mr-12"
      />
      <div className="flex items-center gap-x-6">
        <Button
          onClick={() => router.back()}
          className="font-bold rounded-full bg-white h-8 w-8 items-center justify-center"
        >
          <Undo color="black" />
        </Button>
      </div>
    </nav>
  );
};

export default Nav;

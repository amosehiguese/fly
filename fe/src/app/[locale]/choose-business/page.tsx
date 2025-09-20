import Image from "next/image";
import { Link } from "@/i18n/navigation";
import React from "react";

const Page = () => {
  return (
    <div className="flex justify-center  w-full h-screen items-center flex-1 bg-gradient-to-r from-black to-[#666666]">
      <div>
        <h2 className="font-bold text-[46px] mb-12 text-center text-[#C0C0C0]">
          Choose Business
        </h2>
        <div className="grid gap-8 md:gap-12 md:grid-cols-3 grid-row-3">
          <div className="flex flex-col">
            <Link
              href={"/choose-business"}
              className="border border-[#4A4A4A] rounded-[10px] p-8"
            >
              <Image
                width={1000}
                height={1000}
                alt="logo"
                className="w-36 "
                src={"/logo-grey.png"}
              />
            </Link>
            <p className="text-[#C0C0C0] text-[24px] mt-4 text-center">
              Coming soon
            </p>
          </div>
          <div className="flex flex-col">
            <Link
              href={"/admin/"}
              className="border border-[#4A4A4A] rounded-[10px] p-8"
            >
              <Image
                width={1000}
                height={1000}
                alt="logo"
                className="w-36 "
                src={"/logo.png"}
              />
            </Link>
            <p className="text-[#C0C0C0] text-[24px] mt-4 text-center"></p>
          </div>
          <div className="flex flex-col">
            <Link
              href={"choose-business"}
              className="border border-black rounded-[10px] p-8"
            >
              <Image
                width={1000}
                height={1000}
                alt="logo"
                className="w-36 "
                src={"/logo-black.png"}
              />
            </Link>
            <p className="text-[#C0C0C0] text-[24px] mt-4 text-center">
              Coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

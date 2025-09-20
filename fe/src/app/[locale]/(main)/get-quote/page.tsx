"use client";

import Footer from "@/components/homepage/Footer";
import Nav from "@/components/homepage/Nav";
import React from "react";
import GetQuote from "./component/form";

function Page() {
  return (
    <>
      <div className="flex flex-1 flex-col  items-center min-h-screen w-full overflow-x-hidden">
        <Nav />
        <GetQuote />
      </div>
      <Footer />
    </>
  );
}

export default Page;

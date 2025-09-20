import Marketplace from "@/components/supplier/Marketplace";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import React, { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Marketplace />
    </Suspense>
  );
};

export default Page;

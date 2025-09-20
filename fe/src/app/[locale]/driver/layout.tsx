"use client";

import { ReactNode } from "react";
import DriverNavigation from "@/components/driver/DriverNavigation";

interface DriverLayoutProps {
  children: ReactNode;
}

export default function DriverLayout({ children }: DriverLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <DriverNavigation />
      
      {/* Main content */}
      <main className="flex-1 lg:ml-64 mb-12 lg:mb-0">
        {children}
      </main>
    </div>
  );
}

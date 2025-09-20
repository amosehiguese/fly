"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { Home, Briefcase, DollarSign, MessageCircle } from "lucide-react";

const navItems = [
  { href: "/supplier", icon: Home, label: "Home" },
  { href: "/supplier/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/supplier/earnings", icon: DollarSign, label: "Earnings" },
  { href: "/supplier/support", icon: MessageCircle, label: "Support" },
];

export function SupplierNavbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/mover" className="text-xl font-bold text-red-500">
            Flyttman
          </Link>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? "bg-red-500 text-white"
                    : "text-gray-700 hover:bg-red-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

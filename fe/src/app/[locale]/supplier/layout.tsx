import MobileNav from "@/components/supplier/MobileNav";
import SideNav from "@/components/supplier/SideNav";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <MobileNav />

      {/* Side Navigation (Desktop) */}
      <SideNav />

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="container mx-auto p-4">{children}</div>
      </main>
    </div>
  );
}

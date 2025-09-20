import AdminSettingsNav from "@/components/AdminSettingsNav";

export default function Layout({
  children,
}: Readonly<{
  modal: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <div className="flex m-4 rounded-[10px] border border-[#C4C4C4] min-h-screen">
      <AdminSettingsNav />
      <div className="flex flex-col flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

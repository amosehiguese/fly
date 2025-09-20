import AdminHeaderBar from "@/components/AdminHeaderBar";
import AdminNav from "@/components/AdminNav";

export default function Layout({
  children,
}: Readonly<{
  modal: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <AdminNav />
      <div className="flex flex-col xl:w-[82vw] xl:ml-[18vw] md:w-[75vw] md:ml-[25vw] ml-0">
        <AdminHeaderBar />
        {children}
      </div>
      {/* <Footer /> */}
    </div>
  );
}

import { Nav } from "./Nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="border-b"></header>
      <main className="md:flex">
        <Nav className="" />
        <div className="md:ml-[25vw] md:w-[75vw]">{children}</div>
      </main>
    </div>
  );
}

import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <Header />
      {children}
    </>
  );
}
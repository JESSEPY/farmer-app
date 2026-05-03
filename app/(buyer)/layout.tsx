import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/nav";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation role="buyer" />
      <Header />
      {children}
    </>
  );
}
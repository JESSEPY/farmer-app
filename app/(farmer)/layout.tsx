import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/nav";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation role="farmer" />
      <Header />
      {children}
    </>
  );
}
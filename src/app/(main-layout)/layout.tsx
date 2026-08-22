import { Header } from "@/components/shared/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  );
}

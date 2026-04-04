import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}

import { ThemeToggle } from "@/components/ThemeToggle";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <div className="flex-1 flex flex-col">
      {children}
    </div>
    </>
  );
}

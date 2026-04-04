import { BottomNav } from "@/components/BottomNav";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-1 flex flex-col pb-16">
        {children}
      </div>
      <BottomNav />
    </>
  );
}

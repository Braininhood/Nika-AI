import { ListeningNav } from "@/components/listening/listening-nav";

export default function ListeningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-lg px-4 pt-6">
      <ListeningNav />
      <div className="mt-4">{children}</div>
    </div>
  );
}

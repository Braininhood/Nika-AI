import { ReadingNav } from "@/components/reading/reading-nav";

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-lg px-4 pt-6">
      <ReadingNav />
      <div className="mt-4">{children}</div>
    </div>
  );
}

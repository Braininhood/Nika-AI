import { WritingNav } from "@/components/writing/writing-nav";

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-lg px-4 pt-6">
      <WritingNav />
      <div className="mt-4">{children}</div>
    </div>
  );
}

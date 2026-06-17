export default function SpeakingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 pt-6">
      {children}
    </div>
  );
}

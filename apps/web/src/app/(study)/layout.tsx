"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { NikaMilestoneCelebration } from "@/components/nika/nika-milestone-celebration";
import { StudyActivityTracker } from "@/components/progress/study-activity-tracker";
import { BottomNav } from "@/components/nav/bottom-nav";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <OnboardingGuard requireDiagnostic>
        <div className="study-shell pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
          <StudyActivityTracker />
          {children}
        </div>
        <NikaMilestoneCelebration />
        <BottomNav />
      </OnboardingGuard>
    </AuthGuard>
  );
}

import { accentLabel } from "@/lib/content/accent-labels";
import type { ListeningAccent } from "@/content/listening/types";
import type { OetAccent } from "@/content/speaking/types";

interface ListeningAccentBannerProps {
  variant: "listening";
  accentNote?: string;
  localeContext?: string;
  patientAccent?: ListeningAccent;
  clinicianAccent?: ListeningAccent;
  primaryAccent?: ListeningAccent;
}

interface SpeakingAccentBannerProps {
  variant: "speaking";
  patientAccent?: OetAccent;
  accentContext?: string;
}

type AccentContextBannerProps = ListeningAccentBannerProps | SpeakingAccentBannerProps;

export function AccentContextBanner(props: AccentContextBannerProps) {
  if (props.variant === "listening") {
    const { accentNote, localeContext, patientAccent, clinicianAccent, primaryAccent } = props;
    if (!accentNote && !localeContext && !patientAccent && !clinicianAccent) return null;

    const chips: string[] = [];
    if (clinicianAccent) chips.push(`Clinician: ${accentLabel(clinicianAccent)}`);
    if (patientAccent) chips.push(`Patient: ${accentLabel(patientAccent)}`);
    if (!patientAccent && !clinicianAccent && primaryAccent) {
      chips.push(accentLabel(primaryAccent));
    }

    return (
      <div className="rounded-xl border border-brand-primary/25 bg-brand-primary/5 p-3 text-sm">
        <p className="font-medium text-ink">Accent practice</p>
        {chips.length > 0 && (
          <p className="mt-1 text-xs text-ink-soft">{chips.join(" · ")}</p>
        )}
        {localeContext && <p className="mt-1 text-xs text-ink-soft">{localeContext}</p>}
        {accentNote && <p className="mt-2 text-xs text-ink">{accentNote}</p>}
      </div>
    );
  }

  const { patientAccent, accentContext } = props;
  if (!patientAccent && !accentContext) return null;

  return (
    <div className="rounded-xl border border-brand-primary/25 bg-brand-primary/5 p-3 text-sm">
      <p className="font-medium text-ink">Accent practice</p>
      {patientAccent && (
        <p className="mt-1 text-xs text-ink-soft">
          Patient/carer: {accentLabel(patientAccent)}
        </p>
      )}
      {accentContext && <p className="mt-2 text-xs text-ink">{accentContext}</p>}
    </div>
  );
}

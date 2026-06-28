/** Notify sync layer to push local study data to cloud (debounced). */
export function notifyStudyDataChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("oet-schedule-study-sync"));
}

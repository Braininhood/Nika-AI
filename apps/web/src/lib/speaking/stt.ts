/** Browser speech-to-text for speaking self-review and AI analysis input. */

export interface SttResult {
  transcript: string;
  confidence?: number;
  supported: boolean;
  error?: string;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function sttSupported(): boolean {
  return getSpeechRecognition() !== null;
}

export function createLiveSttSession(
  onInterim: (text: string) => void,
  onFinal: (text: string) => void,
  lang = "en-AU",
): { start: () => void; stop: () => void } | null {
  const Ctor = getSpeechRecognition();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;
  recognition.maxAlternatives = 1;

  let finalText = "";

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i]!;
      const text = result[0]?.transcript ?? "";
      if (result.isFinal) {
        finalText += `${text} `;
        onFinal(finalText.trim());
      } else {
        interim += text;
      }
    }
    if (interim) onInterim(`${finalText}${interim}`.trim());
  };

  return {
    start: () => {
      finalText = "";
      recognition.start();
    },
    stop: () => recognition.stop(),
  };
}

/** Transcribe a recorded blob — uses live STT playback fallback when direct blob STT unavailable. */
export async function transcribeFromPlayback(
  audioUrl: string,
  maxSeconds = 300,
): Promise<SttResult> {
  const Ctor = getSpeechRecognition();
  if (!Ctor) {
    return {
      transcript: "",
      supported: false,
      error: "Speech recognition not supported in this browser. Use Chrome or Edge, or type notes manually.",
    };
  }

  return new Promise((resolve) => {
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-AU";

    let transcript = "";
    let settled = false;

    const finish = (result: SttResult) => {
      if (settled) return;
      settled = true;
      audio.pause();
      recognition.stop();
      resolve(result);
    };

    recognition.onresult = (event) => {
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i]![0]?.transcript ?? "";
      }
    };

    recognition.onerror = (event) => {
      finish({
        transcript: transcript.trim(),
        supported: true,
        error: event.error === "aborted" ? undefined : event.error,
      });
    };

    recognition.onend = () => {
      finish({ transcript: transcript.trim(), supported: true });
    };

    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setTimeout(() => recognition.stop(), 500);
    };

    recognition.start();
    void audio.play().catch(() => {
      finish({
        transcript: "",
        supported: true,
        error: "Could not play recording for transcription.",
      });
    });

    setTimeout(() => {
      finish({
        transcript: transcript.trim(),
        supported: true,
        error: transcript ? undefined : "Transcription timed out — add manual notes.",
      });
    }, maxSeconds * 1000 + 2000);
  });
}

declare module 'speak-tts' {
  interface SpeechOptions {
    text: string;
    queue?: boolean;
    listeners?: {
      onstart?: () => void;
      onend?: () => void;
      onresume?: () => void;
      onboundary?: (event: any) => void;
      onerror?: (error: any) => void;
    };
  }

  interface SpeechInitOptions {
    volume?: number;
    lang?: string;
    rate?: number;
    pitch?: number;
    voice?: string;
    splitSentences?: boolean;
  }

  class Speech {
    constructor();
    hasBrowserSupport(): boolean;
    init(options?: SpeechInitOptions): Promise<void>;
    speak(options: SpeechOptions): Promise<void>;
    cancel(): void;
    pause(): void;
    resume(): void;
    setLanguage(lang: string): Promise<void>;
    setRate(rate: number): void;
    setPitch(pitch: number): void;
    setVolume(volume: number): void;
    getVoices(): Promise<SpeechSynthesisVoice[]>;
    getSupport(): {
      speechSynthesis: boolean;
      speechSynthesisUtterance: boolean;
    };
    lang: string;
  }

  export default Speech;
}


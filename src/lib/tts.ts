/**
 * Text-to-Speech 유틸리티 (iOS Safari 호환)
 *
 * Web Speech API를 사용하여 텍스트를 음성으로 변환합니다.
 * iOS Safari에서의 제한사항을 고려하여 구현되었습니다.
 *
 * iOS Safari 주요 제한사항:
 * 1. 사용자 상호작용(클릭) 이벤트 내에서만 음성 재생 가능
 * 2. 긴 텍스트는 자동으로 중단될 수 있음
 * 3. 앱이 백그라운드로 가면 중단됨
 */

// TTS 상태 관리
interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentUtteranceIndex: number;
  utterances: SpeechSynthesisUtterance[];
  selectedVoice: SpeechSynthesisVoice | null;
  voicesLoaded: boolean;
  iOSInitialized: boolean;
}

const state: TTSState = {
  isPlaying: false,
  isPaused: false,
  currentUtteranceIndex: 0,
  utterances: [],
  selectedVoice: null,
  voicesLoaded: false,
  iOSInitialized: false,
};

/**
 * iOS 기기인지 확인
 */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Safari 브라우저인지 확인
 */
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  );
}

/**
 * 음성 목록이 로드될 때까지 대기 (타임아웃 포함)
 */
function getVoices(timeout: number = 3000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      state.voicesLoaded = true;
      resolve(voices);
      return;
    }

    // voiceschanged 이벤트를 기다림
    const handleVoicesChanged = () => {
      state.voicesLoaded = true;
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged, {
      once: true,
    });

    // 타임아웃 설정 (Chrome에서 이벤트가 발생하지 않을 수 있음)
    setTimeout(() => {
      const currentVoices = window.speechSynthesis.getVoices();
      if (currentVoices.length > 0) {
        state.voicesLoaded = true;
      }
      resolve(currentVoices);
    }, timeout);
  });
}

/**
 * 영어 음성 중 가장 자연스러운 음성 찾기
 * 우선순위: Neural/Premium > Google > Microsoft > Apple > 기본
 */
function findBestEnglishVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const isIOSDevice = isIOS();

  // iOS에서 선호하는 음성 목록 (Samantha가 가장 자연스러움)
  if (isIOSDevice) {
    const iosPreferred = [
      // Siri 음성 (가장 자연스러움)
      voices.find((v) => v.name.includes('Samantha') && v.lang.startsWith('en')),
      voices.find((v) => v.name.includes('Karen') && v.lang.startsWith('en')),
      voices.find((v) => v.name.includes('Moira') && v.lang.startsWith('en')),
      voices.find((v) => v.name.includes('Tessa') && v.lang.startsWith('en')),
      // 기타 영어 음성
      voices.find((v) => v.lang === 'en-US'),
      voices.find((v) => v.lang.startsWith('en')),
    ].filter(Boolean) as SpeechSynthesisVoice[];

    return iosPreferred[0] || null;
  }

  // 다른 플랫폼에서의 우선순위
  const preferredVoices = [
    // Google 고품질 음성 (Chrome에서 가장 자연스러움)
    voices.find(
      (v) =>
        v.name.includes('Google') &&
        v.name.includes('US English') &&
        v.lang.startsWith('en')
    ),
    voices.find(
      (v) => v.name.includes('Google US English') && v.lang.startsWith('en')
    ),
    // Microsoft Neural 음성
    voices.find(
      (v) =>
        v.name.includes('Microsoft') &&
        (v.name.includes('Aria') || v.name.includes('Jenny')) &&
        v.lang === 'en-US'
    ),
    voices.find(
      (v) =>
        v.name.includes('Microsoft') &&
        v.name.includes('Online') &&
        v.lang === 'en-US'
    ),
    // Apple 음성 (macOS)
    voices.find((v) => v.name.includes('Samantha') && v.lang.startsWith('en')),
    voices.find((v) => v.name.includes('Alex') && v.lang.startsWith('en')),
    // 일반 US 영어
    voices.find((v) => v.lang === 'en-US' && !v.name.includes('GB')),
    voices.find((v) => v.lang.startsWith('en-US')),
    voices.find((v) => v.lang.startsWith('en')),
  ].filter(Boolean) as SpeechSynthesisVoice[];

  return preferredVoices[0] || null;
}

/**
 * 텍스트를 적절한 길이로 분할 (iOS Safari 제한 고려)
 * iOS에서는 긴 텍스트가 중간에 끊길 수 있으므로 문장 단위로 분할
 */
function splitTextIntoChunks(text: string): string[] {
  // 빈 텍스트 처리
  if (!text.trim()) return [];

  // 먼저 줄바꿈으로 분할
  const lines = text.split(/\n+/).filter((line) => line.trim());

  const chunks: string[] = [];
  const maxChunkLength = isIOS() ? 150 : 200; // iOS는 더 짧게

  for (const line of lines) {
    // 문장 부호로 분할 (마침표, 물음표, 느낌표)
    const sentences = line
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim());

    for (const sentence of sentences) {
      if (sentence.length <= maxChunkLength) {
        chunks.push(sentence.trim());
      } else {
        // 긴 문장은 쉼표나 세미콜론으로 추가 분할
        const subParts = sentence
          .split(/(?<=[,;:])\s+/)
          .filter((p) => p.trim());
        for (const part of subParts) {
          if (part.length <= maxChunkLength) {
            chunks.push(part.trim());
          } else {
            // 여전히 긴 경우 강제 분할
            for (let i = 0; i < part.length; i += maxChunkLength) {
              const subChunk = part.slice(i, i + maxChunkLength).trim();
              if (subChunk) chunks.push(subChunk);
            }
          }
        }
      }
    }
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * 발화 객체 생성
 */
function createUtterance(
  text: string,
  voice: SpeechSynthesisVoice | null
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';

  // 자연스러운 음성을 위한 설정
  // iOS Safari에서는 기본값에 가깝게 설정하는 것이 더 안정적
  if (isIOS()) {
    utterance.rate = 0.9; // iOS에서는 약간만 느리게
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
  } else {
    utterance.rate = 0.85; // 다른 플랫폼에서는 조금 더 느리게
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
  }

  if (voice) {
    utterance.voice = voice;
  }

  return utterance;
}

/**
 * iOS Safari용 초기화 (사용자 상호작용 시 호출 필요)
 * iOS에서는 첫 번째 음성 재생이 사용자 제스처 내에서 시작되어야 함
 */
export async function initializeTTS(): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // 이미 초기화됨
  if (state.iOSInitialized && state.voicesLoaded) {
    return true;
  }

  try {
    // 음성 목록 로드
    const voices = await getVoices();
    if (voices.length === 0) {
      console.warn('TTS: 사용 가능한 음성이 없습니다.');
      return false;
    }

    // 최적의 영어 음성 선택
    state.selectedVoice = findBestEnglishVoice(voices);

    // iOS Safari 워크어라운드: 빈 발화로 권한 획득
    if (isIOS() || isSafari()) {
      const silentUtterance = new SpeechSynthesisUtterance('');
      silentUtterance.volume = 0;
      window.speechSynthesis.speak(silentUtterance);
      state.iOSInitialized = true;
    }

    return true;
  } catch (error) {
    console.error('TTS 초기화 실패:', error);
    return false;
  }
}

/**
 * 텍스트를 음성으로 변환
 * @param text - 음성으로 변환할 텍스트
 * @returns Promise<void>
 */
export async function speakText(text: string): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    throw new Error('이 브라우저는 음성 재생을 지원하지 않습니다.');
  }

  // 기존 재생 중지
  cancelSpeech();

  // 음성 목록이 로드되지 않은 경우 로드
  if (!state.voicesLoaded) {
    const voices = await getVoices();
    if (voices.length > 0) {
      state.selectedVoice = findBestEnglishVoice(voices);
    }
  }

  // 텍스트를 청크로 분할
  const chunks = splitTextIntoChunks(text);
  if (chunks.length === 0) {
    return;
  }

  // 발화 객체 생성
  state.utterances = chunks.map((chunk) =>
    createUtterance(chunk, state.selectedVoice)
  );
  state.currentUtteranceIndex = 0;
  state.isPlaying = true;
  state.isPaused = false;

  // 순차적으로 재생
  return new Promise((resolve, reject) => {
    const speakNext = () => {
      if (state.currentUtteranceIndex >= state.utterances.length) {
        state.isPlaying = false;
        resolve();
        return;
      }

      if (!state.isPlaying) {
        resolve();
        return;
      }

      const utterance = state.utterances[state.currentUtteranceIndex];

      utterance.onend = () => {
        state.currentUtteranceIndex++;
        // iOS Safari에서는 약간의 딜레이를 주어 안정성 확보
        if (isIOS()) {
          setTimeout(speakNext, 100);
        } else {
          speakNext();
        }
      };

      utterance.onerror = (event) => {
        // 'interrupted' 에러는 사용자가 중지한 경우이므로 무시
        if (event.error === 'interrupted' || event.error === 'canceled') {
          state.isPlaying = false;
          resolve();
          return;
        }
        console.error('TTS 에러:', event.error);
        state.isPlaying = false;
        reject(new Error(`음성 재생 오류: ${event.error}`));
      };

      // iOS Safari 워크어라운드: cancel 후 바로 speak하면 문제가 생길 수 있음
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('speak 호출 실패:', error);
        reject(error);
      }
    };

    speakNext();
  });
}

/**
 * 음성 재생 중지
 */
export function cancelSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  state.isPlaying = false;
  state.isPaused = false;
  state.currentUtteranceIndex = 0;
  state.utterances = [];

  window.speechSynthesis.cancel();
}

/**
 * 음성 재생 일시 정지
 * 주의: iOS Safari에서는 지원되지 않을 수 있음
 */
export function pauseSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // iOS에서는 pause가 제대로 동작하지 않음
  if (isIOS()) {
    console.warn('iOS에서는 일시 정지가 지원되지 않습니다.');
    return;
  }

  if (state.isPlaying && !state.isPaused) {
    window.speechSynthesis.pause();
    state.isPaused = true;
  }
}

/**
 * 음성 재생 재개
 * 주의: iOS Safari에서는 지원되지 않을 수 있음
 */
export function resumeSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // iOS에서는 resume이 제대로 동작하지 않음
  if (isIOS()) {
    console.warn('iOS에서는 재개가 지원되지 않습니다.');
    return;
  }

  if (state.isPaused) {
    window.speechSynthesis.resume();
    state.isPaused = false;
  }
}

/**
 * 현재 재생 중인지 확인
 */
export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  return state.isPlaying || window.speechSynthesis.speaking;
}

/**
 * TTS 지원 여부 확인
 */
export function isTTSSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'speechSynthesis' in window;
}

/**
 * 사용 가능한 영어 음성 목록 반환
 */
export async function getAvailableEnglishVoices(): Promise<
  SpeechSynthesisVoice[]
> {
  const voices = await getVoices();
  return voices.filter((v) => v.lang.startsWith('en'));
}

/**
 * 특정 음성으로 설정
 */
export function setVoice(voice: SpeechSynthesisVoice): void {
  state.selectedVoice = voice;
}

/**
 * 현재 선택된 음성 반환
 */
export function getCurrentVoice(): SpeechSynthesisVoice | null {
  return state.selectedVoice;
}

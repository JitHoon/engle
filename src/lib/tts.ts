/**
 * Text-to-Speech 유틸리티
 *
 * Web Speech API를 직접 사용하여 텍스트를 음성으로 변환합니다.
 * 여성 음성을 자동으로 선택합니다.
 */

/**
 * iOS 기기인지 확인
 */
function isIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * 음성 목록이 로드될 때까지 대기
 */
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // voiceschanged 이벤트를 기다림
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

/**
 * 여성 음성 찾기 (미국 영어 우선, 자연스러운 음성 우선)
 */
function findFemaleVoice(
  voices: SpeechSynthesisVoice[],
  lang: string = 'en-US'
): SpeechSynthesisVoice | null {
  if (isIOS()) {
    // iOS: 자연스러운 Apple 여성 음성 우선 (Samantha가 가장 자연스러움)
    const preferredVoices = [
      voices.find((v) => v.name.includes('Samantha') && v.lang === 'en-US'),
      voices.find((v) => v.name.includes('Samantha') && v.lang.startsWith('en-US')),
      voices.find((v) => v.name.includes('Karen') && v.lang === 'en-US'),
      voices.find((v) => v.name.includes('Victoria') && v.lang === 'en-US'),
      voices.find((v) => v.name.includes('Female') && v.lang === 'en-US'),
      voices.find((v) => v.lang === 'en-US' && !v.name.includes('GB') && !v.name.includes('British')),
    ].filter(Boolean) as SpeechSynthesisVoice[];

    return preferredVoices[0] || null;
  }

  // 다른 플랫폼: Neural/Premium 등 자연스러운 음성 우선
  const preferredVoices = [
    // Neural voices (가장 자연스러움)
    voices.find((v) => v.name.includes('Neural') && v.name.includes('Female') && v.lang === 'en-US'),
    voices.find((v) => v.name.includes('Neural') && v.lang === 'en-US' && !v.name.includes('GB')),
    // Premium voices
    voices.find((v) => v.name.includes('Premium') && v.name.includes('Female') && v.lang === 'en-US'),
    // Google US English Female (자연스러운 음성)
    voices.find((v) => v.name.includes('Google') && v.name.includes('US English Female') && v.lang.startsWith('en')),
    voices.find((v) => v.name.includes('Google') && v.name.includes('Female') && v.lang === 'en-US'),
    // Microsoft 자연스러운 여성 음성
    voices.find((v) => v.name.includes('Microsoft') && (v.name.includes('Aria') || v.name.includes('Jenny')) && v.lang === 'en-US'),
    voices.find((v) => v.name.includes('Microsoft') && v.name.includes('Female') && v.lang === 'en-US'),
    // Apple 자연스러운 음성
    voices.find((v) => v.name.includes('Samantha') && v.lang === 'en-US'),
    voices.find((v) => v.name.includes('Karen') && v.lang === 'en-US'),
    // 일반적인 US Female
    voices.find((v) => v.name.includes('US') && v.name.includes('Female') && v.lang.startsWith('en')),
    voices.find((v) => v.name.includes('Female') && v.lang === 'en-US'),
    voices.find((v) => v.name.includes('Zira') && v.lang === 'en-US'),
    // 마지막 폴백
    voices.find((v) => v.lang === 'en-US' && !v.name.includes('GB') && !v.name.includes('British')),
  ].filter(Boolean) as SpeechSynthesisVoice[];

  return preferredVoices[0] || null;
}

/**
 * 텍스트를 발화 객체로 변환 (긴 문장 처리)
 */
function createUtterances(
  text: string,
  lang: string = 'en-US',
  voice: SpeechSynthesisVoice | null
): SpeechSynthesisUtterance[] {
  // 줄바꿈 기준으로 문장 나누기
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.lang = lang;

    // 더 자연스러운 음성을 위한 설정
    utterance.rate = 0.85; // 약간 느리게 (0.85가 더 자연스러움)
    utterance.pitch = 1.05; // 약간 높은 피치 (더 생동감 있게)
    utterance.volume = 1.0;

    if (voice) {
      utterance.voice = voice;
    }

    return utterance;
  });
}

/**
 * 텍스트를 음성으로 변환
 * @param text - 음성으로 변환할 텍스트
 * @param lang - 언어 코드 (기본값: 'en-US')
 * @returns Promise<void>
 */
export async function speakText(
  text: string,
  lang: string = 'en-US'
): Promise<void> {
  if (!('speechSynthesis' in window)) {
    throw new Error('이 브라우저는 음성 재생을 지원하지 않습니다.');
  }

  // 기존 재생 중지
  window.speechSynthesis.cancel();

  // 음성 목록 로드 대기
  const voices = await getVoices();

  // 여성 음성 찾기
  const femaleVoice = findFemaleVoice(voices, lang);

  // 텍스트를 발화 객체로 변환
  const utterances = createUtterances(text, lang, femaleVoice);

  if (utterances.length === 0) {
    return;
  }

  // 순차적으로 재생
  return new Promise((resolve, reject) => {
    let currentIndex = 0;
    let hasError = false;

    const speakNext = () => {
      if (currentIndex >= utterances.length) {
        resolve();
        return;
      }

      const utterance = utterances[currentIndex];
      currentIndex++;

      utterance.onend = () => {
        if (!hasError) {
          speakNext();
        }
      };

      utterance.onerror = (error) => {
        hasError = true;
        console.error('음성 재생 오류:', error);
        reject(new Error('음성 재생에 실패했습니다.'));
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  });
}

/**
 * 음성 재생 중지
 */
export function cancelSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * 음성 재생 일시 정지
 * 주의: 안드로이드에서는 지원되지 않을 수 있음
 */
export function pauseSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

/**
 * 음성 재생 재개
 * 주의: 안드로이드에서는 지원되지 않을 수 있음
 */
export function resumeSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

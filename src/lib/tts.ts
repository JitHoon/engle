/**
 * Text-to-Speech 유틸리티
 *
 * Google Translate TTS API를 사용하여 자연스러운 영어 음성을 제공합니다.
 * iOS에서는 Web Speech API를 사용합니다 (CORS 제한으로 인해).
 * 무료로 사용 가능하며, Web Speech API보다 더 자연스러운 음질을 제공합니다.
 */

/**
 * iOS 기기인지 확인
 */
function isIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * Google Translate TTS를 사용하여 텍스트를 음성으로 변환
 * @param text - 음성으로 변환할 텍스트
 * @param lang - 언어 코드 (기본값: 'en-US')
 * @returns Promise<void>
 */
export async function speakWithGoogleTTS(
  text: string,
  lang: string = 'en-US'
): Promise<void> {
  try {
    // 텍스트를 URL 인코딩
    const encodedText = encodeURIComponent(text);

    // Google Translate TTS API URL
    // tl: target language (en-US -> en)
    const langCode = lang.split('-')[0]; // 'en-US' -> 'en'
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodedText}`;

    // 오디오 재생
    const audio = new Audio(ttsUrl);
    audio.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = (error) => {
        console.error('TTS 오류:', error);
        reject(new Error('음성 재생에 실패했습니다.'));
      };
      audio.play().catch((error) => {
        console.error('오디오 재생 오류:', error);
        reject(new Error('음성 재생에 실패했습니다.'));
      });
    });
  } catch (error) {
    console.error('TTS 처리 오류:', error);
    throw new Error('음성 재생에 실패했습니다.');
  }
}

/**
 * Web Speech API를 사용하여 텍스트를 음성으로 변환 (폴백)
 * @param text - 음성으로 변환할 텍스트
 * @param lang - 언어 코드 (기본값: 'en-US')
 */
export function speakWithWebSpeechAPI(text: string, lang: string = 'en-US'): void {
  if (!('speechSynthesis' in window)) {
    throw new Error('이 브라우저는 음성 재생을 지원하지 않습니다.');
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // 약간 느리게 (더 자연스럽게)
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // 더 나은 voice 선택 로직
  const voices = window.speechSynthesis.getVoices();

  // iOS에서는 Apple voices 우선, 그 외에는 Google/Microsoft voices 우선
  const preferredVoices = isIOS()
    ? [
        // Apple voices (iOS Safari)
        voices.find((v) => v.name.includes('Samantha') && v.lang.startsWith('en')),
        voices.find((v) => v.name.includes('Alex') && v.lang.startsWith('en')),
        voices.find((v) => v.name.includes('Karen') && v.lang.startsWith('en')),
        voices.find((v) => v.name.includes('Daniel') && v.lang.startsWith('en')),
        voices.find((v) => v.lang.startsWith('en-US')),
        voices.find((v) => v.lang.startsWith('en')),
      ]
    : [
        // Google voices (Chrome)
        voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')),
        // Microsoft voices (Edge)
        voices.find((v) => v.name.includes('Microsoft') && v.lang.startsWith('en')),
        // Apple voices (Safari)
        voices.find((v) => v.name.includes('Samantha') && v.lang.startsWith('en')),
        voices.find((v) => v.name.includes('Alex') && v.lang.startsWith('en')),
        // 일반적인 US voices
        voices.find((v) => v.lang.startsWith('en-US') && v.name.includes('US')),
        voices.find((v) => v.lang.startsWith('en-US')),
        // 영어 voices
        voices.find((v) => v.lang.startsWith('en')),
      ];

  const filteredVoices = preferredVoices.filter(Boolean);

  if (filteredVoices.length > 0) {
    utterance.voice = filteredVoices[0] as SpeechSynthesisVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * 텍스트를 음성으로 변환
 * iOS에서는 Web Speech API를 직접 사용 (CORS 제한으로 인해)
 * 그 외 기기에서는 Google TTS 우선, 실패 시 Web Speech API 폴백
 * @param text - 음성으로 변환할 텍스트
 * @param lang - 언어 코드 (기본값: 'en-US')
 * @param useGoogleTTS - Google TTS 사용 여부 (기본값: true, iOS에서는 무시됨)
 */
export async function speakText(
  text: string,
  lang: string = 'en-US',
  useGoogleTTS: boolean = true
): Promise<void> {
  // iOS에서는 Web Speech API를 직접 사용 (CORS 제한으로 Google TTS가 작동하지 않음)
  if (isIOS()) {
    speakWithWebSpeechAPI(text, lang);
    return;
  }

  // iOS가 아닌 경우에만 Google TTS 시도
  if (useGoogleTTS) {
    try {
      await speakWithGoogleTTS(text, lang);
      return;
    } catch (error) {
      console.warn('Google TTS 실패, Web Speech API로 폴백:', error);
      // 폴백: Web Speech API 사용
      speakWithWebSpeechAPI(text, lang);
    }
  } else {
    speakWithWebSpeechAPI(text, lang);
  }
}


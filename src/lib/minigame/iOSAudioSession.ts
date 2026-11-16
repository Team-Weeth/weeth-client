/** iOS 17+ Safari의 Audio Session API. 아직 TypeScript DOM 타입에 없다. */
interface AudioSessionNavigator extends Navigator {
  audioSession?: { type: string };
}

/**
 * iOS Safari는 Web Audio를 무음 스위치를 따르는 ambient 세션으로 재생한다. 사용자가 직접 소리를 켠 경우에만
 * 미디어 재생(playback) 세션으로 바꿔, 유튜브처럼 무음 모드에서도 들리게 한다.
 * Audio Session API가 없는 iOS 16 이하는 무음 `<audio>`를 반복 재생하는 동안 세션이 playback으로 유지된다.
 * iOS가 아닌 환경에서는 아무것도 하지 않는다.
 */
export class IOSAudioSession {
  private silence: { element: HTMLAudioElement; url: string } | null = null;

  /** 사용자 입력 안에서(첫 await 전에) 불러야 세션 전환이 허용된다. */
  unlock() {
    const session = (navigator as AudioSessionNavigator).audioSession;
    if (session) {
      session.type = 'playback';
      return;
    }
    if (!isIOS()) return;
    if (!this.silence) {
      const url = URL.createObjectURL(silentWav());
      const element = new Audio(url);
      element.loop = true;
      element.setAttribute('playsinline', '');
      this.silence = { element, url };
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
    void this.silence.element.play().catch(() => {
      /* 세션을 못 바꾸면 무음 스위치를 따르는 기존 동작으로 남는다. */
    });
  }

  /** 다른 앱에 다녀와 멈춘 무음 재생을 다시 튼다. 터치·키 입력 때 부른다. */
  resume() {
    if (this.silence?.element.paused)
      void this.silence.element.play().catch(() => {
        /* 다음 입력에서 다시 시도한다. */
      });
  }

  close() {
    if (!this.silence) return;
    this.silence.element.pause();
    URL.revokeObjectURL(this.silence.url);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.silence = null;
  }

  private onVisibilityChange = () => {
    // 다른 앱으로 가 있는 동안 무음 재생으로 세션을 붙잡지 않는다. 돌아와 터치하면 resume()이 다시 튼다.
    if (document.hidden) this.silence?.element.pause();
  };
}

/** iPadOS는 데스크톱 Safari처럼 MacIntel로 보고하므로 터치 지원 여부로 구분한다. */
function isIOS() {
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** 0.5초짜리 8bit 무음 WAV. 8bit PCM은 128이 0이다. */
function silentWav(seconds = 0.5, sampleRate = 8000) {
  const samples = Math.floor(seconds * sampleRate);
  const view = new DataView(new ArrayBuffer(44 + samples));
  const write = (offset: number, text: string) =>
    [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  write(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  write(36, 'data');
  view.setUint32(40, samples, true);
  new Uint8Array(view.buffer, 44).fill(128);
  return new Blob([view.buffer], { type: 'audio/wav' });
}

/**
 * 왁뿌볼 소리. 실제 왁뿌볼 녹음의 깨지는 순간(onset)을 찾아 작은 균열은 한 조각,
 * 큰 깨짐은 여러 조각을 수십 ms 간격으로 겹쳐 "빠자작"으로 재생한다.
 * 누르는 동안에는 주무르는(knead) 녹음을 이전 소리를 끊어 가며 이어 재생한다.
 * 어떤 녹음을 쓸지는 public/audio/wax/banks.json이 정한다. 출처: public/audio/wax/CREDITS.md
 */
const BASE = '/audio/wax/';

interface BankManifest {
  /** 이름 → 녹음 파일(여러 테이크면 배열) */
  banks: Record<string, string | string[]>;
  variants: { bank: string; knead?: string; rate: number }[];
  whack: string[];
  ambience: { classroom: string; hallway: string };
  chalk: string;
}

interface Grain {
  offset: number;
  peak: number;
}

interface BankGrain extends Grain {
  buffer: AudioBuffer;
}

/** 같은 재질의 여러 테이크에서 찾은 조각을 음량 오름차순으로 모은다. */
interface Bank {
  grains: BankGrain[];
}

type Ambience = 'classroom' | 'hallway' | 'none';

/** iOS 17+ Safari의 Audio Session API. 아직 TypeScript DOM 타입에 없다. */
interface AudioSessionNavigator extends Navigator {
  audioSession?: { type: string };
}

export class WaxAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private manifest: BankManifest | null = null;
  private banks = new Map<string, Bank>();
  private whacks: AudioBuffer[] = [];
  private loops = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();
  private loading: Promise<void> | null = null;
  private voices = new Set<AudioBufferSourceNode>();
  private kneading: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
  private muteState = false;
  private silence: { element: HTMLAudioElement; url: string } | null = null;

  get muted() {
    return this.muteState;
  }

  set muted(value: boolean) {
    this.muteState = value;
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(value ? 0 : 1, this.context.currentTime, 0.05);
  }

  get ready() {
    return this.banks.size > 0;
  }

  /** 브라우저 정책상 사용자 입력 안에서 호출해야 한다. */
  async enable() {
    // 오디오 세션 전환도 사용자 입력 안에서만 통하므로 await 전에 한다.
    this.unlockPlayback();
    this.context ??= new AudioContext({ latencyHint: 'interactive' });
    const context = this.context;
    await context.resume();
    if (!this.master) {
      this.master = context.createGain();
      this.master.gain.value = this.muteState ? 0 : 1;
      this.master.connect(context.destination);
    }
    if (this.banks.size) return;
    this.loading ??= this.load(context).catch((error) => {
      this.loading = null;
      throw error;
    });
    await this.loading;
  }

  /**
   * iOS Safari는 Web Audio를 무음 스위치를 따르는 ambient 세션으로 재생한다. 사용자가 직접 소리를 켠 경우에만
   * 미디어 재생(playback) 세션으로 바꿔, 유튜브처럼 무음 모드에서도 들리게 한다.
   * Audio Session API가 없는 iOS 16 이하는 무음 `<audio>`를 반복 재생하는 동안 세션이 playback으로 유지된다.
   */
  private unlockPlayback() {
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

  private onVisibilityChange = () => {
    // 다른 앱으로 가 있는 동안 무음 재생으로 세션을 붙잡지 않는다. 돌아와 터치하면 resume()이 다시 튼다.
    if (document.hidden) this.silence?.element.pause();
  };

  /**
   * 앱 전환·알림·전화로 멈춘(suspended, iOS는 interrupted) 재생을 다시 살린다.
   * 브라우저가 사용자 입력 안에서만 허용하므로 터치·키 입력 때 부른다.
   */
  resume() {
    const context = this.context;
    if (!context) return;
    if (context.state !== 'running' && context.state !== 'closed')
      void context.resume().catch(() => {
        /* 다음 입력에서 다시 시도한다. */
      });
    if (this.silence?.element.paused)
      void this.silence.element.play().catch(() => {
        /* 다음 입력에서 다시 시도한다. */
      });
  }

  private async load(context: AudioContext) {
    const manifestResponse = await fetch(`${BASE}banks.json`);
    if (!manifestResponse.ok) throw new Error('소리 목록을 불러오지 못했어요.');
    const manifest = (await manifestResponse.json()) as BankManifest;
    const decode = async (file: string) => {
      const response = await fetch(`${BASE}${file}`);
      if (!response.ok) throw new Error('소리 파일을 불러오지 못했어요. 다시 시도해주세요.');
      return context.decodeAudioData(await response.arrayBuffer());
    };
    const entries = await Promise.all(
      Object.entries(manifest.banks).map(async ([name, files]) => {
        const buffers = await Promise.all((Array.isArray(files) ? files : [files]).map(decode));
        const grains = buffers
          .flatMap((buffer) => findGrains(buffer).map((grain) => ({ ...grain, buffer })))
          .sort((a, b) => a.peak - b.peak);
        return [name, { grains }] as const;
      }),
    );
    const whacks = await Promise.all(manifest.whack.map(decode));
    if (this.context !== context) return;
    this.manifest = manifest;
    this.banks = new Map(entries);
    this.whacks = whacks;
    // 배경음은 늦게 받아도 게임 진행에 지장이 없다.
    void Promise.all(
      [
        ['classroom', manifest.ambience.classroom],
        ['hallway', manifest.ambience.hallway],
        ['chalk', manifest.chalk],
      ].map(async ([key, file]) => {
        try {
          this.startLoop(key, await decode(file));
        } catch {
          /* 배경음 실패는 무시한다. */
        }
      }),
    );
  }

  private voice(variant: number, kind: 'crack' | 'knead' = 'crack') {
    const entry = this.manifest?.variants[variant % (this.manifest?.variants.length || 1)];
    const name = kind === 'knead' ? (entry?.knead ?? entry?.bank) : entry?.bank;
    const bank = name ? this.banks.get(name) : undefined;
    return entry && bank?.grains.length ? { bank, rate: entry.rate } : null;
  }

  private canPlay() {
    return (
      this.context?.state === 'running' && this.master && !this.muteState && this.voices.size < 24
    );
  }

  private grain(grain: BankGrain, rate: number, gain: number, at: number, length: number) {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;
    const source = context.createBufferSource();
    source.buffer = grain.buffer;
    source.playbackRate.value = rate * (0.94 + Math.random() * 0.12);
    const envelope = context.createGain();
    // 녹음마다 음량이 달라 조각의 최대값으로 정규화한다.
    const level = Math.min(2.5, gain * (0.5 / Math.max(0.05, grain.peak)));
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(level, at + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + length);
    source.connect(envelope).connect(master);
    this.voices.add(source);
    source.onended = () => {
      this.voices.delete(source);
      source.disconnect();
      envelope.disconnect();
    };
    const offset = Math.max(0, grain.offset - 0.004);
    source.start(at, offset, Math.min(grain.buffer.duration - offset, length * rate + 0.02));
    source.stop(at + length + 0.03);
  }

  private pick(grains: BankGrain[], from: number, to: number) {
    const slice = grains.slice(Math.floor(grains.length * from), Math.ceil(grains.length * to));
    const pool = slice.length ? slice : grains;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * 누르는 동안 주무르는 소리. 녹음의 한 구간(약 0.9초)을 재생하고, 다시 부르면 이전 구간을 짧게
   * 줄여 끊은 뒤 새 구간을 시작해 소리가 겹쳐 뭉개지지 않게 한다.
   */
  knead(variant: number) {
    const voice = this.voice(variant, 'knead');
    const context = this.context;
    const master = this.master;
    if (!voice || !this.canPlay() || !context || !master) return;
    this.stopKnead();
    const grain = this.pick(voice.bank.grains, 0.2, 0.9);
    const source = context.createBufferSource();
    source.buffer = grain.buffer;
    source.playbackRate.value = voice.rate * (0.9 + Math.random() * 0.2);
    const gain = context.createGain();
    const at = context.currentTime;
    const level = Math.min(2.5, 0.3 * (0.5 / Math.max(0.05, grain.peak)));
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.02);
    gain.gain.setTargetAtTime(0.0001, at + 0.7, 0.12);
    source.connect(gain).connect(master);
    const offset = Math.max(0, grain.offset - 0.05);
    source.start(at, offset, Math.min(grain.buffer.duration - offset, 1.2));
    source.onended = () => {
      if (this.kneading?.source === source) this.kneading = null;
      source.disconnect();
      gain.disconnect();
    };
    this.kneading = { source, gain };
  }

  /** 손을 떼면 주무르는 소리를 빠르게 줄인다. */
  stopKnead() {
    const current = this.kneading;
    const context = this.context;
    if (!current || !context) return;
    current.gain.gain.cancelScheduledValues(context.currentTime);
    current.gain.gain.setTargetAtTime(0.0001, context.currentTime, 0.03);
    try {
      current.source.stop(context.currentTime + 0.15);
    } catch {
      /* 이미 끝난 재생은 무시한다. */
    }
    this.kneading = null;
  }

  /** 빠직: 조각 하나. */
  smallCrack(variant: number) {
    const voice = this.voice(variant);
    if (!voice || !this.canPlay() || !this.context) return;
    const at = this.context.currentTime;
    this.grain(this.pick(voice.bank.grains, 0.3, 0.8), voice.rate, 0.32, at, 0.14);
    if (Math.random() < 0.5)
      this.grain(this.pick(voice.bank.grains, 0, 0.5), voice.rate * 1.1, 0.14, at + 0.035, 0.08);
  }

  /** 빠자작: 큰 조각 뒤로 잔금 조각이 짧게 이어진다. */
  bigCrack(variant: number) {
    const voice = this.voice(variant);
    if (!voice || !this.canPlay() || !this.context) return;
    let at = this.context.currentTime;
    this.grain(this.pick(voice.bank.grains, 0.7, 1), voice.rate * 0.95, 0.75, at, 0.32);
    const tail = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < tail; i++) {
      at += 0.025 + Math.random() * 0.045;
      this.grain(
        this.pick(voice.bank.grains, 0.2, 0.9),
        voice.rate * (1 + i * 0.04),
        0.45 - i * 0.06,
        at,
        0.12,
      );
    }
  }

  /** 회초리 '딱!'. 멀리 있을수록 작게 들린다. */
  whack(distance = 0) {
    const context = this.context;
    const master = this.master;
    if (!context || !master || !this.canPlay() || !this.whacks.length) return;
    const source = context.createBufferSource();
    source.buffer = this.whacks[Math.floor(Math.random() * this.whacks.length)];
    source.playbackRate.value = 0.95 + Math.random() * 0.1;
    const gain = context.createGain();
    gain.gain.value = 0.9 / (1 + distance / 4);
    source.connect(gain).connect(master);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }

  private startLoop(key: string, buffer: AudioBuffer) {
    const context = this.context;
    const master = this.master;
    if (!context || !master || this.loops.has(key)) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = context.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(master);
    source.start(0, Math.random() * buffer.duration);
    this.loops.set(key, { source, gain });
  }

  /** 현재 공간에 맞춰 배경음을 교차 전환한다. chalk는 교수님이 판서 중일 때만 들린다. */
  setScene(ambience: Ambience, chalk: boolean) {
    const context = this.context;
    if (!context) return;
    const levels: Record<string, number> = {
      classroom: ambience === 'classroom' ? 0.16 : 0,
      hallway: ambience === 'hallway' ? 0.14 : 0,
      chalk: chalk ? 0.22 : 0,
    };
    for (const [key, loop] of this.loops)
      loop.gain.gain.setTargetAtTime(levels[key] ?? 0, context.currentTime, 0.4);
  }

  close() {
    this.stopKnead();
    for (const source of [...this.voices, ...[...this.loops.values()].map((loop) => loop.source)]) {
      try {
        source.stop();
      } catch {
        /* 이미 끝난 재생은 무시한다. */
      }
    }
    this.voices.clear();
    this.loops.clear();
    if (this.silence) {
      this.silence.element.pause();
      URL.revokeObjectURL(this.silence.url);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.silence = null;
    }
    void this.context?.close();
    this.context = null;
    this.master = null;
    this.banks.clear();
    this.whacks = [];
    this.manifest = null;
    this.loading = null;
  }
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

/** 5ms 에너지 포락선에서 급격히 커지는 지점을 깨지는 순간으로 본다. 결과는 음량 오름차순. */
export function findGrains(buffer: AudioBuffer): Grain[] {
  const samples = buffer.getChannelData(0);
  const hop = Math.max(1, Math.floor(buffer.sampleRate * 0.005));
  const envelope: number[] = [];
  for (let start = 0; start + hop <= samples.length; start += hop) {
    let energy = 0;
    for (let i = start; i < start + hop; i++) energy += samples[i] * samples[i];
    envelope.push(Math.sqrt(energy / hop));
  }
  const grains: Grain[] = [];
  let last = -Infinity;
  for (let k = 3; k < envelope.length; k++) {
    const before = (envelope[k - 3] + envelope[k - 2] + envelope[k - 1]) / 3 + 1e-5;
    if (envelope[k] > before * 3.5 && envelope[k] > 0.015 && k - last > 12) {
      let peak = 0;
      for (let j = k; j < Math.min(envelope.length, k + 16); j++)
        peak = Math.max(peak, envelope[j]);
      grains.push({ offset: (k * hop) / buffer.sampleRate, peak });
      last = k;
    }
  }
  if (!grains.length) {
    let peak = 0;
    for (const value of envelope) peak = Math.max(peak, value);
    grains.push({ offset: 0, peak: peak || 0.1 });
  }
  return grains.sort((a, b) => a.peak - b.peak);
}

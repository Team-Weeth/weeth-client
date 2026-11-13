import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { WAX_SCENE } from '@/constants/wax';

const FONT = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", sans-serif';

function canvas(width: number, height: number) {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  const context = element.getContext('2d');
  if (!context) throw new Error('2D canvas를 사용할 수 없어요.');
  return { element, context };
}

function texture(element: HTMLCanvasElement, repeat?: [number, number]) {
  const result = new CanvasTexture(element);
  result.colorSpace = SRGBColorSpace;
  result.anisotropy = 4;
  if (repeat) {
    result.wrapS = RepeatWrapping;
    result.wrapT = RepeatWrapping;
    result.repeat.set(...repeat);
  }
  return result;
}

/** 교실 나무 마루. 판자마다 명도를 조금씩 바꾼다. */
export function woodFloorTexture(
  repeat: [number, number],
  base: string = WAX_SCENE.roomFloor,
  line: string = WAX_SCENE.roomFloorLine,
) {
  const { element, context } = canvas(512, 512);
  const rows = 8;
  for (let row = 0; row < rows; row++) {
    let x = row % 2 ? -128 : 0;
    while (x < 512) {
      const length = 160 + ((row * 37 + x) % 3) * 48;
      const shade = 0.9 + (((row * 13 + x * 7) % 10) / 10) * 0.18;
      context.fillStyle = base;
      context.filter = `brightness(${shade})`;
      context.fillRect(x, row * 64, length, 64);
      context.filter = 'none';
      context.strokeStyle = line;
      context.lineWidth = 3;
      context.strokeRect(x + 1.5, row * 64 + 1.5, length - 3, 61);
      context.globalAlpha = 0.12;
      for (let grain = 0; grain < 4; grain++) {
        context.beginPath();
        context.moveTo(x + 8, row * 64 + 12 + grain * 12);
        context.bezierCurveTo(
          x + length * 0.3,
          row * 64 + 8 + grain * 13,
          x + length * 0.6,
          row * 64 + 18 + grain * 11,
          x + length - 8,
          row * 64 + 12 + grain * 12,
        );
        context.stroke();
      }
      context.globalAlpha = 1;
      x += length;
    }
  }
  return texture(element, repeat);
}

/** 복도 바닥 체크무늬 타일(로블록스 학교 복도 느낌). */
export function tileFloorTexture(
  repeat: [number, number],
  light = '#f4efe3',
  dark = '#a9dccf',
  line = '#d9d2c3',
) {
  const { element, context } = canvas(256, 256);
  for (let y = 0; y < 2; y++)
    for (let x = 0; x < 2; x++) {
      context.fillStyle = (x + y) % 2 ? dark : light;
      context.fillRect(x * 128, y * 128, 128, 128);
    }
  context.strokeStyle = line;
  context.lineWidth = 3;
  for (let i = 0; i <= 2; i++) {
    context.beginPath();
    context.moveTo(i * 128, 0);
    context.lineTo(i * 128, 256);
    context.moveTo(0, i * 128);
    context.lineTo(256, i * 128);
    context.stroke();
  }
  return texture(element, repeat);
}

/** 복도 한가운데 바닥 엠블럼. */
export function emblemTexture() {
  const { element, context } = canvas(512, 512);
  context.fillStyle = '#12805c';
  context.beginPath();
  context.arc(256, 256, 248, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#ffd166';
  context.lineWidth = 18;
  context.beginPath();
  context.arc(256, 256, 212, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `900 104px ${FONT}`;
  context.fillText('WEETH', 256, 226);
  context.font = `800 50px ${FONT}`;
  context.fillStyle = '#ffd166';
  context.fillText('UNIVERSITY', 256, 318);
  return texture(element);
}

/** 자판기 앞면. */
export function vendingTexture(color: string) {
  const { element, context } = canvas(256, 512);
  context.fillStyle = color;
  context.fillRect(0, 0, 256, 512);
  context.fillStyle = '#e8f6ff';
  context.fillRect(18, 22, 160, 330);
  const drinks = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff'];
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 4; col++) {
      context.fillStyle = drinks[(row + col) % drinks.length];
      context.fillRect(28 + col * 38, 34 + row * 62, 26, 46);
    }
  context.fillStyle = '#263238';
  context.fillRect(192, 60, 46, 90);
  context.fillRect(30, 390, 140, 60);
  context.fillStyle = '#ffffff';
  context.font = `800 30px ${FONT}`;
  context.fillText('DRINK', 40, 488);
  return texture(element);
}

/** 분필로 쓴 칠판. */
export function chalkboardTexture(title: string, lines: string[]) {
  const { element, context } = canvas(1024, 384);
  context.fillStyle = WAX_SCENE.board;
  context.fillRect(0, 0, 1024, 384);
  // 지운 자국
  context.globalAlpha = 0.08;
  context.fillStyle = '#ffffff';
  for (let i = 0; i < 6; i++) {
    context.beginPath();
    context.ellipse(150 + i * 150, 120 + (i % 3) * 70, 120, 34, 0.2, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  context.fillStyle = WAX_SCENE.chalk;
  context.strokeStyle = WAX_SCENE.chalk;
  context.font = `700 64px ${FONT}`;
  context.fillText(title, 60, 96);
  context.font = `500 36px ${FONT}`;
  lines.forEach((line, i) => context.fillText(line, 72, 168 + i * 52));
  // 왁뿌볼 단면 낙서
  context.lineWidth = 5;
  context.beginPath();
  context.arc(840, 210, 90, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(840, 210, 60, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(790, 150);
  context.lineTo(820, 200);
  context.lineTo(800, 240);
  context.moveTo(880, 140);
  context.lineTo(860, 190);
  context.stroke();
  context.font = `600 30px ${FONT}`;
  context.fillText('← 왁스층', 900, 120);
  return texture(element);
}

/** 문 위 호실 표지판. */
export function signTexture(title: string, subtitle: string) {
  const { element, context } = canvas(512, 192);
  context.fillStyle = '#ffffff';
  context.beginPath();
  context.roundRect(4, 4, 504, 184, 24);
  context.fill();
  context.strokeStyle = WAX_SCENE.baseboard;
  context.lineWidth = 8;
  context.stroke();
  context.fillStyle = '#1f2a37';
  context.textAlign = 'center';
  context.font = `800 84px ${FONT}`;
  context.fillText(title, 256, 104);
  context.font = `600 38px ${FONT}`;
  context.fillStyle = '#4b5866';
  context.fillText(subtitle, 256, 160);
  return texture(element);
}

/** 복도 게시판 포스터. */
export function posterTexture(title: string, body: string, color: string) {
  const { element, context } = canvas(256, 352);
  context.fillStyle = '#fffdf7';
  context.fillRect(0, 0, 256, 352);
  context.fillStyle = color;
  context.fillRect(0, 0, 256, 96);
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.font = `800 40px ${FONT}`;
  context.fillText(title, 128, 64);
  context.fillStyle = '#1f2a37';
  context.font = `600 26px ${FONT}`;
  body.split('\n').forEach((line, i) => context.fillText(line, 128, 150 + i * 38));
  context.beginPath();
  context.fillStyle = color;
  context.arc(128, 300, 30, 0, Math.PI * 2);
  context.fill();
  return texture(element);
}

/** 머리 위 이름표. 산사의 "나 · 이름" 말풍선 형식. */
export function nameTagTexture(name: string, own: boolean) {
  const { element, context } = canvas(512, 128);
  context.font = `700 44px ${FONT}`;
  const label = own ? `나 · ${name}` : name;
  const width = Math.min(500, context.measureText(label).width + 64);
  const left = (512 - width) / 2;
  context.fillStyle = own ? 'rgba(18, 90, 72, 0.92)' : 'rgba(255, 255, 255, 0.92)';
  context.beginPath();
  context.roundRect(left, 20, width, 84, 42);
  context.fill();
  context.fillStyle = own ? '#ffffff' : '#1f2a37';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 256, 64);
  return { texture: texture(element), aspect: 512 / 128 };
}

/** 말풍선("딱!", "!", "흠…"). */
export function bubbleTexture(text: string, color: string) {
  const { element, context } = canvas(256, 256);
  context.fillStyle = '#ffffff';
  context.strokeStyle = color;
  context.lineWidth = 12;
  context.beginPath();
  context.roundRect(20, 20, 216, 170, 48);
  context.moveTo(110, 188);
  context.lineTo(128, 236);
  context.lineTo(150, 188);
  context.fill();
  context.stroke();
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  // 이모지는 글꼴 목록 끝의 컬러 이모지 글꼴로 그린다. 두 글자 한글(ㅋㅋ)도 말풍선 안에 들어오게 줄인다.
  let size = text.length > 2 ? 64 : 110;
  const font = () =>
    `900 ${size}px ${FONT}, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"`;
  context.font = font();
  while (size > 40 && context.measureText(text).width > 180) {
    size -= 6;
    context.font = font();
  }
  context.fillText(text, 128, 108);
  return texture(element);
}

/** 대학 강의실 화이트보드. 마커로 쓴 강의 내용. */
export function whiteboardTexture(title: string, lines: string[]) {
  const { element, context } = canvas(1024, 320);
  context.fillStyle = '#fbfcfd';
  context.fillRect(0, 0, 1024, 320);
  context.globalAlpha = 0.06;
  context.fillStyle = '#90a4ae';
  for (let i = 0; i < 5; i++) context.fillRect(80 + i * 190, 30 + (i % 2) * 120, 160, 40);
  context.globalAlpha = 1;
  context.fillStyle = '#1e4fa8';
  context.font = `800 56px ${FONT}`;
  context.fillText(title, 56, 86);
  context.strokeStyle = '#d6453d';
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(56, 104);
  context.lineTo(56 + Math.min(880, context.measureText(title).width), 108);
  context.stroke();
  context.fillStyle = '#263238';
  context.font = `600 34px ${FONT}`;
  lines.forEach((line, i) => context.fillText(line, 72, 166 + i * 50));
  return texture(element);
}

/** 천장 텍스 타일. */
export function ceilingTexture(repeat: [number, number]) {
  const { element, context } = canvas(256, 256);
  context.fillStyle = '#f7f7f4';
  context.fillRect(0, 0, 256, 256);
  context.strokeStyle = '#dedcd5';
  context.lineWidth = 6;
  context.strokeRect(0, 0, 256, 256);
  context.fillStyle = '#ecebe6';
  for (let i = 0; i < 60; i++) context.fillRect((i * 53) % 256, (i * 97) % 256, 3, 3);
  return texture(element, repeat);
}

/** 복도 위쪽 건물 사인. */
export function buildingSignTexture() {
  const { element, context } = canvas(1024, 160);
  context.clearRect(0, 0, 1024, 160);
  context.fillStyle = '#3b3f46';
  context.textBaseline = 'middle';
  context.font = `800 76px ${FONT}`;
  context.fillText('공학관', 24, 84);
  context.font = `700 40px ${FONT}`;
  context.fillStyle = '#12805c';
  context.fillText('WEETH UNIVERSITY  ·  1F', 290, 88);
  return texture(element);
}

/** 층별 안내 키오스크 화면. */
export function directoryTexture() {
  const { element, context } = canvas(256, 384);
  context.fillStyle = '#102a43';
  context.fillRect(0, 0, 256, 384);
  context.fillStyle = '#ffffff';
  context.font = `800 30px ${FONT}`;
  context.fillText('층별 안내', 24, 52);
  context.font = `600 22px ${FONT}`;
  ['1F  강의실 101–103', '2F  학과 사무실', '3F  세미나실', 'B1  학생 식당'].forEach((line, i) => {
    context.fillStyle = i === 0 ? '#7ee2b8' : '#d9e2ec';
    context.fillText(line, 24, 112 + i * 52);
  });
  return texture(element);
}

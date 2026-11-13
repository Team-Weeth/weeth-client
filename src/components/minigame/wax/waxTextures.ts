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
  // Weeth 메인 컬러(#04C7A9) 카펫에 흰 테두리·글자
  context.fillStyle = '#04c7a9';
  context.beginPath();
  context.arc(256, 256, 248, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#ffffff';
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

/** 디자인 토큰의 현재 값. 캔버스에는 CSS 변수를 쓸 수 없어 그릴 때 읽는다(미니게임은 라이트 테마 고정). */
function token(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * 머리 위 이름표. 시안(23px 높이 알약)을 5배로 그린다. 내 캐릭터는 이름 앞에 '나' 배지를 붙인다.
 * height는 캔버스 높이 대비 알약 높이 비율로, 장면에서 알약 크기를 맞출 때 쓴다.
 */
export function nameTagTexture(name: string, own: boolean) {
  const k = 5;
  const border = 1 * k;
  const padX = 6 * k;
  // 시안 피드백: 오른쪽만 2px 더 띄운다.
  const padRight = padX + 2 * k;
  const gap = 4 * k;
  const badge = 13 * k;
  const pillHeight = 23 * k;
  const nameFont = `500 ${8 * k}px ${FONT}`;
  const measure = canvas(1, 1).context;
  measure.font = nameFont;
  const nameWidth = measure.measureText(name).width;
  const pillWidth = border * 2 + padX + padRight + nameWidth + (own ? badge + gap : 0);
  const { element, context } = canvas(Math.ceil(pillWidth) + 8, pillHeight + 8);
  const left = 4;
  const top = 4;
  context.fillStyle = token('--container-neutral-alternative', '#e9eef2');
  context.beginPath();
  context.roundRect(left, top, pillWidth, pillHeight, pillHeight / 2);
  context.fill();
  context.fillStyle = token('--container-neutral', '#ffffff');
  context.beginPath();
  context.roundRect(
    left + border,
    top + border,
    pillWidth - border * 2,
    pillHeight - border * 2,
    pillHeight / 2,
  );
  context.fill();
  context.textBaseline = 'middle';
  let x = left + border + padX;
  const middle = top + pillHeight / 2;
  if (own) {
    context.fillStyle = token('--container-primary', '#00c8aa');
    context.beginPath();
    context.arc(x + badge / 2, middle, badge / 2, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = token('--text-inverse', '#ffffff');
    context.font = `700 ${6 * k}px ${FONT}`;
    context.textAlign = 'center';
    context.fillText('나', x + badge / 2, middle + 0.5);
    x += badge + gap;
  }
  context.fillStyle = token('--text-strong', '#000000');
  context.font = nameFont;
  context.textAlign = 'left';
  context.fillText(name, x, middle + 0.5);
  return {
    texture: texture(element),
    aspect: element.width / element.height,
    height: pillHeight / element.height,
  };
}

/** reactions.png(2172×724)에서 칸별로 잘라 쓸 원본 픽셀 범위. Figma 반응 아이콘의 자르기 비율을 옮긴 값이다. */
const REACTION_SOURCE = [
  { x: 0, y: 94.9, size: 551.6, lift: 0 },
  { x: 551.6, y: 94.9, size: 551.6, lift: 0 },
  { x: 1086, y: 94.9, size: 551.6, lift: 1 },
  { x: 1637.6, y: 86.2, size: 534.4, lift: 2 },
];

/** 시안의 감정 말풍선(검은 별, 꼬리 포함) 경로. 55.245×55.388 */
const REACTION_BUBBLE_PATH =
  'M26.9625 0L34.8591 7.89666H46.022V19.0595L53.925 26.9593L45.3128 35.5715L49.0236 55.3885L55.2453 48.8678L35.5779 45.3064L26.9625 53.9186L19.0658 46.022H7.90302V34.8591L0 26.9593L7.89666 19.0627V7.89984H19.0595L26.9625 0Z';

let reactionImage: HTMLImageElement | null = null;

/**
 * 머리 위 감정 말풍선. 56px 시안을 256px 캔버스에 그린다: 46도 돌린 검은 별 위에 반응 아이콘(30px)을 얹는다.
 * 아이콘 이미지는 비동기로 받으므로 다 받으면 다시 그린다.
 */
export function reactionBubbleTexture(sprite: number) {
  const size = 256;
  const k = size / 56;
  const { element, context } = canvas(size, size);
  const result = texture(element);
  const draw = (image?: HTMLImageElement) => {
    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(28 * k, 28.2 * k);
    context.rotate((46 * Math.PI) / 180);
    context.scale(k, k);
    context.translate(-55.245 / 2, -55.388 / 2);
    context.fillStyle = '#000000';
    context.fill(new Path2D(REACTION_BUBBLE_PATH));
    context.restore();
    const source = REACTION_SOURCE[sprite];
    if (image && source) {
      context.drawImage(
        image,
        source.x,
        source.y,
        source.size,
        source.size,
        13 * k,
        (13 - source.lift) * k,
        30 * k,
        30 * k,
      );
    }
    result.needsUpdate = true;
  };
  draw();
  const image = (reactionImage ??= Object.assign(new Image(), {
    src: '/images/wax/reactions.png',
  }));
  if (image.complete && image.naturalWidth) draw(image);
  else image.addEventListener('load', () => draw(image), { once: true });
  return result;
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

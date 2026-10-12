import { cn } from '@/lib/cn';

interface LoadingProps {
  className?: string;
  /** 생략하면 상위의 text 색(기본 text-icon-normal)을 따른다 */
  colorHex?: string;
}

/**
 * 로딩 스피너.
 *
 * 원본은 Lottie(loading.json)였으나, 300KB에 달하는 lottie-web 청크를 지연 로드하다
 * 실패하는 문제가 있어 동일한 모양을 SVG + CSS로 옮겼다.
 * viewBox와 도형 수치를 원본과 똑같이 유지해 기존 레이아웃에서 같은 크기로 그려진다.
 */
function Loading({ className, colorHex }: LoadingProps) {
  return (
    <svg
      viewBox="0 0 300 150"
      role="status"
      aria-label="로딩 중"
      className={cn('text-icon-normal size-20', className)}
    >
      <g className="loading-spinner-rotate">
        <circle
          className="loading-spinner-dash"
          cx="150"
          cy="75"
          r="28"
          fill="none"
          stroke={colorHex ?? 'currentColor'}
          strokeWidth="10"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export { Loading, type LoadingProps };

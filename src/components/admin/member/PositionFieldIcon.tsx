/** 기존 ic_admin_position.svg의 도형을 유지하고 테마 색상만 적용한다. */
function PositionFieldIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className="text-icon-normal shrink-0"
      aria-hidden
    >
      <path
        d="M7.56094 14C3.38438 14 0 18.3844 0 22.5609C0 23.3578 0.646875 24 1.43906 24H22.5609C23.3578 24 24 23.3531 24 22.5609C24 18.3844 20.6156 14 16.4391 14H7.56094Z"
        fill="currentColor"
      />
      <g className="fill-brand-primary">
        <rect x="10" y="19" width="4" height="4" rx="0.6" />
        <path d="M15.3359 14.0039L16.4924 14.0053L12.8357 19.562L12.0006 19.0118L15.3359 14.0039Z" />
        <path d="M8.85966 14.0031L7.64066 14.0063L11.303 19.561L12.1381 19.0108L8.85966 14.0031Z" />
      </g>
      <circle cx="11.6719" cy="6.19531" r="6" fill="currentColor" />
    </svg>
  );
}

export { PositionFieldIcon };

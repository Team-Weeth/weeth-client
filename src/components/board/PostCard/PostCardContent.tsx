interface PostCardContentProps {
  title: string;
  content: string;
  isNew?: boolean;
  showReadMore?: boolean;
  onReadMore?: () => void;
}

function PostCardContent({
  title,
  content,
  isNew,
  showReadMore = false,
  onReadMore,
}: PostCardContentProps) {
  return (
    <div className="flex flex-col gap-200 self-stretch">
      <div className="flex items-center gap-200">
        <h3 className="typo-sub2 text-text-strong">{title}</h3>
        {isNew && (
          <span className="typo-caption1 text-state-new" aria-label="새 글">
            N
          </span>
        )}
      </div>
      <p
        className={`typo-body2 text-text-normal whitespace-pre-line${showReadMore ? 'line-clamp-8' : ''}`}
      >
        {content}
      </p>
      {showReadMore && (
        <button
          type="button"
          className="typo-body2 text-text-alternative cursor-pointer text-left"
          onClick={onReadMore}
        >
          이어서 보기
        </button>
      )}
    </div>
  );
}

export { PostCardContent, type PostCardContentProps };

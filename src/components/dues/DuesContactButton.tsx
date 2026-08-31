'use client';

const HELP_MAIL_ADDRESS = 'help@weeth.kr';

function DuesContactButton() {
  const handleContactClick = () => {
    window.location.href = `mailto:${HELP_MAIL_ADDRESS}`;
  };

  return (
    <button
      type="button"
      onClick={handleContactClick}
      className="typo-button2 text-text-alternative hover:text-text-normal cursor-pointer rounded-sm px-0 py-200"
    >
      문의하기
    </button>
  );
}

export { DuesContactButton };

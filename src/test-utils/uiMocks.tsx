import React from 'react';

const Avatar = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

const AvatarImage = ({ alt }: { alt?: string }) => <img alt={alt ?? ''} />;

const AvatarFallback = () => <div />;

const Icon = () => null;

const Button = ({
  children,
  onClick,
  disabled,
  type,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type={type ?? 'button'} onClick={onClick} disabled={disabled} {...props}>
    {children}
  </button>
);

const Textarea = ({
  value,
  onChange,
  placeholder,
  disabled,
  maxLength,
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    maxLength={maxLength}
  />
);

const AlertDialog = ({
  open,
  title,
  description,
  children,
}: {
  open?: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) =>
  open ? (
    <div role="alertdialog">
      {title && <p>{title}</p>}
      {description && <p>{description}</p>}
      {children}
    </div>
  ) : null;

const AlertDialogAction = ({
  children,
  onClick,
  disabled,
}: {
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}) => (
  <button type="button" onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

const AlertDialogCancel = ({
  children,
  disabled,
}: {
  children?: React.ReactNode;
  disabled?: boolean;
}) => (
  <button type="button" disabled={disabled}>
    {children}
  </button>
);

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Icon,
  Button,
  Textarea,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
};

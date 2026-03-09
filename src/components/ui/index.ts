// shadcn/ui가 설치되는 곳
// 어떤 페이지에서든 재사용 가능한 기본 빌딩 블록
//  비즈니스 로직이 없고, 스타일과 인터랙션만 담당

export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';

export {
  Dialog,
  DialogBody,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';
export type { DialogHeaderProps, DialogFooterProps } from './dialog';

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

export type { AlertDialogProps } from './alert-dialog';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card';

export { Divider } from './Divider';
export type { DividerProps } from './Divider';

export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

export {
  Avatar,
  avatarVariants,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  type AvatarProps,
} from './avatar';

export { Chip, chipVariants, ChipList, type ChipProps } from './chips';

export { Tag, type TagProps } from './tag';

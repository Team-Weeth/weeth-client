'use client';

import {
  Button,
  TextField,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui';
import { useThemeStore } from '@/stores/theme-store';

function Row({ label, className }: { label: string; className: string }) {
  return <div className={`typo-body2 px-3 py-1 ${className}`}>{label}</div>;
}

export default function LandingPage() {
  const { isDark, toggle } = useThemeStore();

  return (
    <div className="bg-background min-h-screen p-400">
      버셀 확인용
      <Button variant="primary" size="lg" onClick={toggle}>
        {isDark ? '☀️ 라이트모드' : '🌙 다크모드'}
      </Button>
      <Button variant="secondary" size="md" onClick={toggle}>
        {isDark ? '☀️ 라이트모드' : '🌙 다크모드'}
      </Button>
      <Button variant="tertiary" size="sm" onClick={toggle}>
        {isDark ? '☀️ 라이트모드' : '🌙 다크모드'}
      </Button>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">TYPOGRAPHY</p>
      <div className="typo-h1 text-text-strong">H1 Weeth</div>
      <div className="typo-h2 text-text-strong">H2 Weeth</div>
      <div className="typo-h3 text-text-strong">H3 Weeth</div>
      <div className="typo-sub1 text-text-normal">Sub1 Weeth</div>
      <div className="typo-sub2 text-text-normal">Sub2 Weeth</div>
      <div className="typo-body1 text-text-normal">Body1 Weeth</div>
      <div className="typo-body2 text-text-normal">Body2 Weeth</div>
      <div className="typo-caption1 text-text-alternative">Caption1 Weeth</div>
      <div className="typo-caption2 text-text-alternative">Caption2 Weeth</div>
      <div className="typo-button1 text-text-normal">Button1 Weeth</div>
      <div className="typo-button2 text-text-normal">Button2 Weeth</div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">TEXT</p>
      <div className="flex flex-col gap-1">
        <Row label="text-normal" className="text-text-normal" />
        <Row label="text-strong" className="text-text-strong" />
        <Row label="text-alternative" className="text-text-alternative" />
        <Row label="text-disabled" className="text-text-disabled" />
        <Row label="text-inverse" className="bg-text-normal text-text-inverse" />
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">BACKGROUND</p>
      <div className="flex flex-col gap-1">
        <Row label="background" className="border-line bg-background text-text-normal border" />
        <Row label="line" className="bg-line text-text-inverse" />
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">CONTAINER</p>
      <div className="flex flex-col gap-1">
        <Row label="container-neutral" className="bg-container-neutral text-text-normal" />
        <Row
          label="container-neutral-interaction"
          className="bg-container-neutral-interaction text-text-normal"
        />
        <Row
          label="container-neutral-alternative"
          className="bg-container-neutral-alternative text-text-normal"
        />
        <Row label="container-primary" className="bg-container-primary text-text-inverse" />
        <Row
          label="container-primary-interaction"
          className="bg-container-primary-interaction text-text-inverse"
        />
        <Row
          label="container-primary-alternative"
          className="bg-container-primary-alternative text-text-normal"
        />
        <Row label="container-secondary" className="bg-container-secondary text-text-inverse" />
        <Row
          label="container-secondary-interaction"
          className="bg-container-secondary-interaction text-text-inverse"
        />
        <Row
          label="container-secondary-alternative"
          className="bg-container-secondary-alternative text-text-normal"
        />
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">BUTTON</p>
      <div className="flex flex-col gap-1">
        <Row label="button-neutral" className="bg-button-neutral text-text-normal" />
        <Row
          label="button-neutral-interaction"
          className="bg-button-neutral-interaction text-text-normal"
        />
        <Row label="button-primary" className="bg-button-primary text-text-inverse" />
        <Row
          label="button-primary-interaction"
          className="bg-button-primary-interaction text-text-inverse"
        />
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">ICON</p>
      <div className="flex flex-col gap-1">
        <Row label="icon-normal" className="text-icon-normal" />
        <Row label="icon-strong" className="text-icon-strong" />
        <Row label="icon-alternative" className="text-icon-alternative" />
        <Row label="icon-disabled" className="text-icon-disabled" />
        <Row label="icon-inverse" className="bg-icon-normal text-icon-inverse" />
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">BRAND</p>
      <div className="flex flex-col gap-1">
        <Row label="brand-primary" className="text-brand-primary" />
        <Row label="brand-secondary" className="text-brand-secondary" />
        <Row label="brand-purple" className="text-brand-purple" />
        <Row label="brand-pink" className="text-brand-pink" />
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">STATE</p>
      <div className="flex flex-col gap-1">
        <Row label="state-success" className="text-state-success" />
        <Row label="state-caution" className="text-state-caution" />
        <Row label="state-error" className="text-state-error" />
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">DIALOG</p>
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              Dialog 열기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>프로필 수정</DialogTitle>
              <DialogDescription>프로필 정보를 수정할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <TextField placeholder="이름을 입력하세요" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">취소</Button>
              </DialogClose>
              <Button variant="primary">저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">ALERT DIALOG</p>
      <div className="flex flex-wrap gap-2">
        <AlertDialog status="default">
          <AlertDialogTrigger asChild>
            <Button variant="secondary" size="sm">
              Default Alert (확인)
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>변경 사항을 적용하시겠어요?</AlertDialogTitle>
              <AlertDialogDescription>
                선택한 내용이 저장됩니다.
                <br />
                진행하시려면 &apos;확인&apos;을 눌러주세요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>확인</AlertDialogAction>
              <AlertDialogCancel>취소</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog status="danger">
          <AlertDialogTrigger asChild>
            <Button variant="secondary" size="sm">
              Danger Alert (삭제)
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>이 게시글을 삭제하시겠어요?</AlertDialogTitle>
              <AlertDialogDescription>
                삭제된 게시글을 복구할 수 없습니다.
                <br />
                신중히 확인 후 진행해 주세요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>삭제</AlertDialogAction>
              <AlertDialogCancel>취소</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">BREADCRUMB</p>
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/">게시판</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>공지사항</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/">설정</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>프로필</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <p className="typo-caption1 text-text-disabled mt-6 mb-2">TEXT FIELD</p>
      <div className="flex flex-col gap-3">
        <div>
          <p className="typo-caption2 text-text-alternative mb-1">Default</p>
          <TextField placeholder="기본 텍스트 필드" />
        </div>
        <div>
          <p className="typo-caption2 text-text-alternative mb-1">Clearable</p>
          <TextField clearable placeholder="내용을 입력하면 X 버튼이 나타납니다" />
        </div>
        <div>
          <p className="typo-caption2 text-text-alternative mb-1">Multiline (scrollable)</p>
          <TextField multiline rows={3} placeholder="여러 줄 입력이 가능하고 내부 스크롤됩니다" />
        </div>
        <div>
          <p className="typo-caption2 text-text-alternative mb-1">Disabled</p>
          <TextField disabled placeholder="비활성화 상태" />
        </div>
      </div>
    </div>
  );
}

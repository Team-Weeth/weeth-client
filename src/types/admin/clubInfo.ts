import type { UploadResult } from '@/components/admin/club-info';

export type ImageState =
  | { status: 'unchanged' }
  | { status: 'uploaded'; upload: UploadResult }
  | { status: 'deleted' };

export const MAX_IMAGE_FILES = 5;
export const MAX_NON_IMAGE_FILES = 5;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf', 'webp'] as const;
export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

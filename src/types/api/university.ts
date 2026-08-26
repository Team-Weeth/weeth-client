import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

/** 학교 정보 */
export type School = S<'com.weeth.domain.university.application.dto.response.SchoolResponse'>;

/** 학과 정보 */
export type Major = S<'com.weeth.domain.university.application.dto.response.MajorResponse'>;

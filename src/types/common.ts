export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type MutationCallbacks<TError = Error> = {
  onSuccess?: () => void;
  onError?: (error: TError) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export interface SliceSort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

export interface SlicePageable {
  offset: number;
  sort: SliceSort;
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
}

export interface Slice<T> {
  size: number;
  content: T[];
  number: number;
  sort: SliceSort;
  pageable: SlicePageable;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  numberOfElements: number;
  hasNext: boolean;
  totalElements?: number;
  totalPages?: number;
}

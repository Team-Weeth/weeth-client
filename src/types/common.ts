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

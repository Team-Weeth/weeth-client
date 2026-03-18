export type MutationCallbacks<TError = Error> = {
  onSuccess?: () => void;
  onError?: (error: TError) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

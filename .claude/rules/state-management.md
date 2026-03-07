# State Management

## Tool Selection by State Type

| State Type | Tool |
|------------|------|
| Server data (read) | `@tanstack/react-query` |
| Server data (write / mutate) | Server Actions (`lib/actions/`) |
| Global client UI state | Zustand (`stores/`) |
| Local component state | `useState` / `useReducer` |

## Zustand Pattern

### Base Structure (combine + devtools required)

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

// 1. Separate initialState
const initialState = {
  value: '',
  count: 0,
};

export type ExampleState = typeof initialState;

// 2. Separate state and actions with combine, wrap with devtools
export const useExampleStore = create(
  devtools(
    combine(initialState, (set, get) => ({
      // 3. devtools label required for each action (third argument)
      setValue: (value: string) => set({ value }, false, 'setValue'),
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
      reset: () => set(initialState, false, 'reset'),

      // Can compose current state with get()
      getPayload: () => {
        const state = get();
        return { value: state.value, count: state.count };
      },
    })),
    { name: 'ExampleStore' }, // Name shown in Redux DevTools
  ),
);
```

### Rules
- Always separate the `initialState` object → reuse in the `reset` action
- Always write the third argument of `set` (action name label)
- Always write the `name` option in `devtools` (`{Name}Store` format)
- File name: `use{Name}Store.ts` (e.g. `usePostStore.ts`)

## React Query Pattern

```ts
// lib/apis/post.ts
export const postApi = {
  getList: async (): Promise<Post[]> => {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },
};

// Usage in components
import { useQuery } from '@tanstack/react-query';
import { postApi } from '@/lib/apis/post';

function PostList() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: postApi.getList,
  });
}
```

## Server Actions Pattern

```ts
// lib/actions/post.ts
'use server';

export async function createPost(formData: FormData) {
  // Runs only on the server
}
```

- `'use server'` directive required at the top of Server Actions files
- All Server Actions must be located under `lib/actions/`
- API call functions (client-side) must be located under `lib/apis/`

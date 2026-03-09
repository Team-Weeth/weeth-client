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

### Selector Hooks (required)

Do not use the store hook directly in components. Always create selector hooks that extract only the needed slice.

```ts
// stores/useExampleStore.ts — export selector hooks alongside the store
export const useValue = () => useExampleStore((store) => store.value);
export const useCount = () => useExampleStore((store) => store.count);

// Actions are stable references — group them into one hook
export const useExampleActions = () =>
  useExampleStore((store) => ({
    setValue: store.setValue,
    increment: store.increment,
    reset: store.reset,
  }));
```

```tsx
// In components — use selector hooks, not the raw store
const count = useCount();
const { increment } = useExampleActions();
```

This ensures components only re-render when the specific slice they subscribe to changes.

### Rules
- Always separate the `initialState` object → reuse in the `reset` action
- Always write the third argument of `set` (action name label)
- Always write the `name` option in `devtools` (`{Name}Store` format)
- File name: `use{Name}Store.ts` (e.g. `usePostStore.ts`)
- Always export selector hooks from the store file; do not use the raw store hook in components

## React Query Pattern

### staleTime / gcTime

Default is `5 * 60 * 1000` (5 minutes). Adjust based on how frequently the data changes:

| Data characteristic | staleTime | gcTime |
|--------------------|-----------|--------|
| Real-time (attendance, etc.) | `0` | `5 * 60 * 1000` |
| Moderate update frequency (board list) | `5 * 60 * 1000` | `10 * 60 * 1000` |
| Rarely changes (user profile, constants) | `30 * 60 * 1000` | `60 * 60 * 1000` |

**When unsure, ask the user before setting these values.** 
Do not silently apply an arbitrary value.

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

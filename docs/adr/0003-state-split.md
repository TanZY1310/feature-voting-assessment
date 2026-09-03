# State split: query cache, URL, and local UI state

Server state is held by TanStack Query hooks in `src/hooks/`; browse filters and sort live in the URL query string (read and written via a `useBrowseParams` hook); transient UI state (dialogs, forms, toggles) is `useState` in the owning component. The role switcher mutates the mock's session and triggers a full cache invalidation — the same path a real sign-in would use.

We rejected a global store (Redux/Zustand) and context-based data loading because the data is server-shaped, read-mostly, and benefits from TanStack Query's caching, invalidation, and optimistic-update machinery; URL state keeps browse shareable and back-button friendly; local state avoids hoisting UI concerns that no sibling needs.
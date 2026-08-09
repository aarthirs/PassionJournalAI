import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchHistoryPage,
  fetchPinned,
  updateJournal,
  deleteJournal,
} from "../../services/journalService";

// Query keys are arrays so related caches can be invalidated as a group.
// Changing `search`/`filter` changes the key, so React Query automatically
// tracks a separate cached list per search term.
export const historyKeys = {
  all: ["journals"],
  list: (search, filter) => ["journals", "list", { search, filter }],
  pinned: ["journals", "pinned"],
};

export const useHistory = ({ search = "", filter } = {}) => {
  const qc = useQueryClient();

  // Infinite scroll: each page's nextCursor becomes the next request's cursor.
  const list = useInfiniteQuery({
    queryKey: historyKeys.list(search, filter),
    queryFn: ({ pageParam }) =>
      fetchHistoryPage({ cursor: pageParam, q: search, filter, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const pinned = useQuery({
    queryKey: historyKeys.pinned,
    queryFn: fetchPinned,
    enabled: !search && !filter, // pinned section only shows in the default view
  });

  // Flatten pages into one array for rendering.
  const items = (list.data?.pages ?? []).flatMap((p) => p.items);

  // Refetch every journal-related query after a mutation. Simple and always
  // correct; we let the server stay the source of truth.
  const invalidate = () => qc.invalidateQueries({ queryKey: historyKeys.all });

  // --- Optimistic update: change the UI immediately, roll back on failure. ---
  const update = useMutation({
    mutationFn: ({ id, fields }) => updateJournal(id, fields),
    onMutate: async ({ id, fields }) => {
      const key = historyKeys.list(search, filter);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData(key, (old) =>
        !old
          ? old
          : {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map((it) => (it.id === id ? { ...it, ...fields } : it)),
              })),
            }
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(ctx.key, ctx.previous),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id) => deleteJournal(id),
    onMutate: async (id) => {
      const key = historyKeys.list(search, filter);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData(key, (old) =>
        !old
          ? old
          : {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.filter((it) => it.id !== id),
              })),
            }
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(ctx.key, ctx.previous),
    onSettled: invalidate,
  });

  return {
    items,
    pinnedItems: pinned.data ?? [],
    isLoading: list.isLoading,
    isError: list.isError,
    hasNextPage: list.hasNextPage,
    isFetchingNextPage: list.isFetchingNextPage,
    fetchNextPage: list.fetchNextPage,
    rename: (id, title) => update.mutate({ id, fields: { title } }),
    togglePin: (e) => update.mutate({ id: e.id, fields: { pinned: !e.pinned } }),
    toggleFavorite: (e) => update.mutate({ id: e.id, fields: { favorite: !e.favorite } }),
    toggleArchive: (e) => update.mutate({ id: e.id, fields: { archived: !e.archived } }),
    remove: (id) => remove.mutate(id),
  };
};

export default useHistory;

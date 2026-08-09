import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, patchSettings } from "../services/settingsService";

/**
 * Settings with optimistic updates: toggles must feel instant, and a failed
 * save rolls back so the UI never claims something was saved when it wasn't.
 */
export const useSettings = () => {
  const qc = useQueryClient();
  const key = ["settings"];

  const query = useQuery({ queryKey: key, queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });

  const mutation = useMutation({
    mutationFn: patchSettings,
    onMutate: async (partial) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      // Deep-merge the patch so nested groups aren't clobbered.
      qc.setQueryData(key, (old) => {
        if (!old) return old;
        const next = { ...old };
        for (const [group, value] of Object.entries(partial)) {
          next[group] = value && typeof value === "object" && !Array.isArray(value)
            ? { ...old[group], ...value }
            : value;
        }
        return next;
      });

      return { previous };
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(key, ctx.previous),
    onSuccess: (fresh) => qc.setQueryData(key, fresh),
    // AI preferences change how replies are generated, so drop derived caches.
    onSettled: () => qc.invalidateQueries({ queryKey: ["journals", "patterns"] }),
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    update: mutation.mutate,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
};

export default useSettings;

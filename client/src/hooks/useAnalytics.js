import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "../services/analyticsService";

// Keyed by range so switching 6M/1Y/All swaps between cached datasets instantly.
export const useAnalytics = (range = "1y") =>
  useQuery({
    queryKey: ["journals", "analytics", range],
    queryFn: () => fetchAnalytics(range),
    staleTime: 2 * 60 * 1000,
  });

export default useAnalytics;

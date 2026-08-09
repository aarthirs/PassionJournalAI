import { useQuery } from "@tanstack/react-query";
import { fetchPatterns } from "../services/insightsService";

// Shares the ["journals"] key family so a new message refreshes patterns too.
export const usePatterns = () =>
  useQuery({
    queryKey: ["journals", "patterns"],
    queryFn: fetchPatterns,
    staleTime: 60 * 1000,
  });

export default usePatterns;

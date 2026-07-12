import useJournal from "../../hooks/useJournal";
import { Loader2 } from "lucide-react";
const AnalyzeButton = () => {
    const {
    loading,
    journalText,
    analyzeEntry
    }=useJournal();

  return (
    <button
      onClick={analyzeEntry}
      disabled={
        loading ||
        !journalText.trim()
        }
      className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {
            loading ?

            <div className="flex items-center justify-center gap-2">

            <Loader2
            className="animate-spin"
            size={20}
            />

           <>
    <span className="animate-spin">
        ⏳
    </span>

    <span>
        Analyzing...
    </span>
</>

            </div>

            :

            "Analyze with AI"

        }
    </button>
  );
};

export default AnalyzeButton;
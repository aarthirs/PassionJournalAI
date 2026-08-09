import Card from "../common/Card";
import AnalyzeButton from "./AnalyzeButton";
import useJournal from "../../hooks/useJournal";
import Error from "../common/Error";
const JournalInput =()=>{
    const {journalText,setJournalText,error,loading}=useJournal();
    return(
      <div>
       Today's Journal {/* Heading  */}
       <textarea rows={6} className="

        w-full

        mt-4

        rounded-xl

        border

        border-white/10

        bg-[#111827]

        p-4

        outline-none

        resize-none

        focus:border-orange-400

        "  
        placeholder="What inspired you today? Tell your Passion journal about your learning, hobbies, work, or anything you're passionate about..."
        value={journalText}

        onChange={(e) =>
        setJournalText(e.target.value)
        }
        disabled={loading} />
        <div className="mt-2 text-right text-xs text-gray-500">
            {journalText.length}/1000 characters 
        </div>
        <Error message={error} />
       <AnalyzeButton/>
      </div>
    )
}

export default JournalInput;


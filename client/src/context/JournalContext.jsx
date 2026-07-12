import { createContext, useState } from "react";

import useLocalStorage from "../hooks/useLocalStorage";

import { createJournalEntry } from "../services/journalService";
import { analyzeJournal } from "../services/aiService";
export const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
  const [journalText, setJournalText] = useState("");
    const initialAnalysis = {
  passion: "",
  mood: "",
  score: 0,
  reflection: "",
  goal: "",
};
 const [analysis, setAnalysis] =  useState(initialAnalysis)
const [toast, setToast] = useState({
    message: "",
    type: "",
});
//   const [history, setHistory] = useState(previousEntries); 
    const [history, setHistory] = useLocalStorage(
    "journal-history",
    []
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const analyzeEntry = async () => {

     if (!journalText.trim()) {

        setError("Please write something.");
        setAnalysis(initialAnalysis);
        return;

    }
    if(journalText.trim().length<15){

        setError(

        "Please write at least 15 characters."

        );
        setAnalysis(initialAnalysis);
        return;

    }

    try{

        setLoading(true);

        setError("");

        const result = await analyzeJournal(journalText);

        setAnalysis(result);

        const newEntry =
            createJournalEntry(
                journalText,
                result
            );

        setHistory((prev)=>[
            newEntry,
            ...prev
        ]);
        setJournalText("");
        // setAnalysis(initialAnalysis);
        setToast({

    message: "Journal analyzed successfully!",

    type: "success",

});
    }

    catch(err){
        console.error(err);
        setError(
            "Unable to analyze your journal."
        );
        setToast({

    message: "Unable to analyze journal.",

    type: "error",

});

    }

    finally{

        setLoading(false);

    }

}
  return (
    
    <JournalContext.Provider
      value={{
        journalText,
        setJournalText,

        analysis,
        setAnalysis,

        history,
        setHistory,

        analyzeEntry,

         loading,
        setLoading,

        error,
        setError,
        toast,
        setToast,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};
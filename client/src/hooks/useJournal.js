import { useContext } from "react";
import { JournalContext } from "../context/JournalContext";

const useJournal = () => useContext(JournalContext);

export default useJournal;
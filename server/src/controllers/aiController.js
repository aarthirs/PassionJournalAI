import { analyzeWithGemini } from "../services/geminiService.js";

export const analyzeJournal = async (req, res) => {

    try{

        const { journalText } = req.body;

        const result =
            await analyzeWithGemini(journalText);

        res.json(result);

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

}
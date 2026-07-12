import { analyzeByRules } from "../../utils/analysisEngine";
import { AI_PROVIDER } from "../../utils/constants";

const CURRENT_PROVIDER = AI_PROVIDER.RULE;

export const analyzeWithAI = async (journalText) => {

    try{

        switch(CURRENT_PROVIDER){

            case AI_PROVIDER.RULE:

                return analyzeByRules(journalText);

            default:

                return analyzeByRules(journalText);

        }

    }

    catch(error){

        console.error(error);

        return analyzeByRules(journalText);

    }

}

  // using case and default : Graceful Degradation.
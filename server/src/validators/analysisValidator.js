export const validateAnalysis = (analysis) => {

    if (!analysis) {
        return false;
    }

    const requiredFields = [
        "passion",
        "mood",
        "score",
        "reflection",
        "goal",
    ];

    return requiredFields.every((field) => {

        return analysis[field] !== undefined &&
               analysis[field] !== null;

    });

};
import useJournal from "../../hooks/useJournal";

const PreviousEntries = () => {
    const {history}=useJournal();
    if (history.length === 0) {
  return (
    <div className="rounded-xl border border-dashed border-gray-700 bg-[#111827] p-10 text-center">

      <div className="mb-4 text-5xl">
        📖
      </div>

      <h2 className="mb-2 text-2xl font-semibold">
        No Journal Entries
      </h2>

      <p className="text-gray-400">
        Your previous journal entries will appear here.
      </p>

    </div>
  );
}
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">
        Previous Entries
      </h2>

      <div className="overflow-hidden rounded-xl border border-white/10">

        {/* Header */}

        <div className="grid grid-cols-12 bg-[#111827] px-5 py-4 text-sm font-semibold uppercase tracking-wide text-gray-400">

          <div className="col-span-2">
            Date
          </div>

          <div className="col-span-2">
            Passion
          </div>

          <div className="col-span-2">
            Score
          </div>

          <div className="col-span-6">
            Reflection
          </div>

        </div>

        {/* Rows */}

        {history.map((entry) => (
          <div
            key={entry.id}
            className="
              grid
              grid-cols-12
              items-center
              border-t
              border-white/10
              px-5
              py-4
              transition
              hover:bg-white/5
            "
          >
            <div className="col-span-2 text-gray-300">
             {new Date(entry.createdAt).toLocaleDateString(
                "en-GB"
            )}
            </div>

            <div className="col-span-2 font-medium">
              {entry.analysis.passion}
            </div>

            <div className="col-span-2 font-semibold text-orange-400">
              ⭐ {entry.analysis.score}
            </div>

            <div className="col-span-6 text-gray-400">
              {entry.analysis.reflection}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousEntries;
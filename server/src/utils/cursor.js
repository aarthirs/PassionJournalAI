// Cursor (keyset) pagination helpers.
//
// WHY NOT skip/limit? With .skip(n) the database must walk and discard n
// documents on every page, so page 50 is far slower than page 1, and if a new
// entry is inserted while you scroll, rows shift and you see duplicates or
// gaps. A cursor instead says "give me everything strictly older than this
// exact position", which is index-friendly and stable during inserts.
//
// The cursor encodes createdAt AND _id, because two entries can share the same
// createdAt (e.g. bulk-imported data). Without the _id tiebreaker, pagination
// could loop or skip those rows.

export const encodeCursor = (doc) =>
  Buffer.from(`${new Date(doc.createdAt).toISOString()}|${doc._id}`, "utf8").toString("base64url");

export const decodeCursor = (cursor) => {
  try {
    const [iso, id] = Buffer.from(cursor, "base64url").toString("utf8").split("|");
    const date = new Date(iso);
    if (!iso || !id || Number.isNaN(date.getTime())) return null;
    return { createdAt: date, id };
  } catch {
    return null;
  }
};

// Mongo filter meaning "strictly after this cursor position" in
// {createdAt: -1, _id: -1} sort order.
export const cursorFilter = ({ createdAt, id }) => ({
  $or: [
    { createdAt: { $lt: createdAt } },
    { createdAt, _id: { $lt: id } },
  ],
});

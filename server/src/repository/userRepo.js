import User from "../models/User.js";

export const findById = (id) => User.findById(id);

// Find an existing user by Google id (or email), or create one. Also links a
// Google login to a pre-existing email account. This is the single entry point
// for turning a Google profile into a User row.
export const findOrCreateByGoogle = async ({ googleId, email, name, avatar }) => {
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    let dirty = false;
    if (!user.googleId) { user.googleId = googleId; user.provider = "google"; dirty = true; }
    if (avatar && !user.avatar) { user.avatar = avatar; dirty = true; }
    if (dirty) await user.save();
    return user;
  }

  return User.create({ googleId, email, name, avatar, provider: "google" });
};

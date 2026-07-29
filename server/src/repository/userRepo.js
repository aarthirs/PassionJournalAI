import User from "../models/User.js";

// Phase 3 has no auth yet (that lands in Phase 5). To keep every query
// user-scoped from day one, we resolve a single "demo" user and cache its id.
// In Phase 5, attachUser is replaced by real auth and this helper goes away.
let demoUserIdCache = null;

export const getDemoUserId = async () => {
  if (demoUserIdCache) return demoUserIdCache;

  let user = await User.findOne({ email: "demo@reflect.local" });
  if (!user) {
    user = await User.create({
      name: "Demo User",
      email: "demo@reflect.local",
      provider: "local",
    });
  }

  demoUserIdCache = user._id;
  return demoUserIdCache;
};

export const findUserById = (id) => User.findById(id);

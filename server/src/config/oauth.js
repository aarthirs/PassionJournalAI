import { OAuth2Client } from "google-auth-library";
import env from "./env.js";

// One configured Google OAuth client for the whole server.
export const oauthClient = new OAuth2Client(
  env.google.clientId,
  env.google.clientSecret,
  env.google.callbackUrl
);

// Step 1 of the flow: build the Google consent-screen URL we redirect the user to.
export const getGoogleAuthUrl = () =>
  oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    // openid+email+profile gives us a signed ID token containing the user's
    // identity — no extra API call needed.
    scope: ["openid", "email", "profile"],
  });

// Step 2: exchange the one-time ?code for tokens, then verify the ID token's
// signature with Google and read the user's profile out of it.
export const getGoogleUser = async (code) => {
  const { tokens } = await oauthClient.getToken(code);
  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.google.clientId,
  });
  const p = ticket.getPayload();
  return {
    googleId: p.sub, // Google's stable unique id for this account
    email: p.email,
    name: p.name || "Explorer",
    avatar: p.picture || "",
  };
};

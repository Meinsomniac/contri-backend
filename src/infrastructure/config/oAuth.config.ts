import "dotenv/config";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_WEBCLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const googleClient = new OAuth2Client(GOOGLE_WEBCLIENT_ID);

import { OAuthClaims, oauthSignIn, AuthResult } from "../oauthHandler";
import { AuthProvider } from "../types";

export async function googleSignIn(
  claims: OAuthClaims,
  ipAddress: string,
  userAgent: string
): Promise<AuthResult> {
  return oauthSignIn(claims, AuthProvider.Google, ipAddress, userAgent);
}

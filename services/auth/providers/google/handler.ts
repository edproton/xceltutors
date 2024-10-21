import {
  OAuthClaims,
  oauthSignIn,
  AuthResult,
  ProviderType,
} from "../oauthHandler";

export async function googleSignIn(
  claims: OAuthClaims,
  ipAddress: string,
  userAgent: string
): Promise<AuthResult> {
  return oauthSignIn(claims, ProviderType.Google, ipAddress, userAgent);
}

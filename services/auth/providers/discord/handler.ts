import {
  OAuthClaims,
  oauthSignIn,
  AuthResult,
  ProviderType,
} from "../oauthHandler";

export async function discordSignIn(
  claims: OAuthClaims,
  ipAddress: string,
  userAgent: string
): Promise<AuthResult> {
  return oauthSignIn(claims, ProviderType.Discord, ipAddress, userAgent);
}

import {
  OAuthClaims,
  oauthSignIn,
  AuthResult,
  ProviderType,
} from "../oauthHandler";

export async function discordSignIn(claims: OAuthClaims): Promise<AuthResult> {
  return oauthSignIn(claims, ProviderType.Discord);
}

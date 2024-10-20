import {
  OAuthClaims,
  oauthSignIn,
  AuthResult,
  ProviderType,
} from "../oauthHandler";

export async function googleSignIn(claims: OAuthClaims): Promise<AuthResult> {
  return oauthSignIn(claims, ProviderType.Google);
}

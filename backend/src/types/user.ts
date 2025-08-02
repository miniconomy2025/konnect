export interface CreateUserData {
  googleId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  keyPairs: {
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
  }[]
}
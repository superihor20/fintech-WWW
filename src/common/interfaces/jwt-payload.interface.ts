export interface JwtPayload {
  id: number;
  email: string;
  walletId: number;
  iat: number;
  exp: number;
}

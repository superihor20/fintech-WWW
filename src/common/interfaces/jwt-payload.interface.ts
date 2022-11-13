import { Role } from '../../entities';

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
  iat: number;
  exp: number;
  walletId: number;
  profileId: number;
}

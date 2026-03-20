import { UserRole } from './enums';

export interface AuthenticatedUser {
  id: string;
  cognitoSub: string;
  username: string;
  role: UserRole;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

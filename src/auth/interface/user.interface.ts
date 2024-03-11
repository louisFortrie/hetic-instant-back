export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
};

export interface IAuhtenticate {
  readonly user: User;
  readonly token: string;
}

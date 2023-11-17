enum UserProvider {
  Temp = 'Temp',
  Google = 'Google',
}

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  provider: UserProvider;
  createdAt: number;
  updatedAt: number;
}

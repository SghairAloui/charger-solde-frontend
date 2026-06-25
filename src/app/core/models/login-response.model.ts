import {Role} from '../enums/role.enum';

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  photoUrl: string;
}

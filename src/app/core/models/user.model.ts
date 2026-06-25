import {Role} from '../enums/role.enum';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numTel: string;
  photoUrl: string;
  role: Role;
  active: boolean;
  createdAt: Date;
}

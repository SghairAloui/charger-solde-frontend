import {Role} from '../enums/role.enum';

export interface ProfileResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numTel: string;
  photoUrl: string;
  role: Role;
}

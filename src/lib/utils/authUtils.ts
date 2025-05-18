import { Role } from '../store/features/auth/authSlice';

export const hasRole = (roles: Role[], roleName: string): boolean => {
  return roles.some((role) => role.toLowerCase() === roleName.toLowerCase());
};

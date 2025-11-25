import { useAuth } from '@/contexts/AuthContext';

export const usePermission = (required: string) => {
  const { permissions } = useAuth();
  if (!permissions) return false;
  return permissions[required as keyof typeof permissions] === true;
};



import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  type Role,
  type Permission,
  DEFAULT_MATRIX,
} from '@/lib/permissions';

interface AccessState {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  matrix: Record<Role, Record<Permission, boolean>>;
  setRolePermission: (role: Role, perm: Permission, value: boolean) => void;
  resetMatrix: () => void;
  can: (perm: Permission) => boolean;
  activePermissions: Permission[];
}

const AccessContext = createContext<AccessState | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);

  const setRolePermission = (role: Role, perm: Permission, value: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: value },
    }));
  };

  const resetMatrix = () => setMatrix(DEFAULT_MATRIX);

  const activePermissions = useMemo(
    () => (Object.keys(matrix[currentRole]) as Permission[]).filter((p) => matrix[currentRole][p]),
    [matrix, currentRole]
  );

  const can = (perm: Permission) => matrix[currentRole][perm] === true;

  const value: AccessState = {
    currentRole,
    setCurrentRole,
    matrix,
    setRolePermission,
    resetMatrix,
    can,
    activePermissions,
  };

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessState {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error('useAccess must be used within AccessProvider');
  return ctx;
}

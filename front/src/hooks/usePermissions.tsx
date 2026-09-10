import { ReactNode, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

export type PermAction = "create" | "read" | "update" | "delete";

/**
 * Permission helpers derived from the logged-in admin.
 * SUPER_ADMIN always passes. Otherwise a permission string
 * "<resource>:<action>" must be present in admin.permissions
 * (which the server already resolves as role ∪ per-admin overrides).
 */
export function usePermissions() {
  const { admin } = useAuth();

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";
  const perms = useMemo(
    () => new Set<string>(Array.isArray(admin?.permissions) ? admin!.permissions : []),
    [admin]
  );

  const can = (resource: string, action: PermAction): boolean => {
    if (isSuperAdmin) return true;
    return perms.has(`${resource}:${action}`);
  };

  const canAny = (resource: string): boolean => {
    if (isSuperAdmin) return true;
    for (const p of perms) if (p.startsWith(`${resource}:`)) return true;
    return false;
  };

  return {
    isSuperAdmin,
    can,
    canAny,
    canCreate: (r: string) => can(r, "create"),
    canRead: (r: string) => can(r, "read"),
    canUpdate: (r: string) => can(r, "update"),
    canDelete: (r: string) => can(r, "delete"),
  };
}

interface CanProps {
  resource: string;
  action: PermAction;
  children: ReactNode;
  /** Rendered when permission is missing (default: nothing). */
  fallback?: ReactNode;
}

/**
 * Render `children` only if the current admin has `resource:action`.
 * Use to hide Create / Edit / Delete controls the admin can't perform.
 *
 *   <Can resource="products" action="update"><Button>Edit</Button></Can>
 */
export function Can({ resource, action, children, fallback = null }: CanProps) {
  const { can } = usePermissions();
  return <>{can(resource, action) ? children : fallback}</>;
}

export default usePermissions;

"use client";

import { useRole } from "@/hooks/useRole";
import type { UserRole } from "@/types/domain";
import type { ReactNode } from "react";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { role, loading } = useRole();
  if (loading) return null;
  if (!role || !allowedRoles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}

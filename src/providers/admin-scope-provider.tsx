'use client';

import { createContext, use, type ReactNode } from 'react';

const AdminScopeContext = createContext(false);

function AdminScopeProvider({ children }: { children: ReactNode }) {
  return <AdminScopeContext value={true}>{children}</AdminScopeContext>;
}

function useIsAdminScope() {
  return use(AdminScopeContext);
}

function AdminScopeBoundary({ children }: { children: ReactNode }) {
  const isAdmin = useIsAdminScope();
  if (!isAdmin) return <>{children}</>;
  return <div data-admin>{children}</div>;
}

export { AdminScopeBoundary, AdminScopeProvider, useIsAdminScope };

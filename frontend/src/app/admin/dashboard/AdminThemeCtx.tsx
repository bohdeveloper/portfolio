'use client';
import { createContext, useContext } from 'react';

interface AdminThemeCtxType {
  isDark: boolean;
  toggle: () => void;
}

export const AdminThemeCtx = createContext<AdminThemeCtxType>({
  isDark: true,
  toggle: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeCtx);

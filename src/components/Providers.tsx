"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <AuthProvider>
      {isClient ? <SidebarProvider>{children}</SidebarProvider> : null}
    </AuthProvider>
  );
}

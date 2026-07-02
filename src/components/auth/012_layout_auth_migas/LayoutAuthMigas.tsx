'use client';

/**
 * Envuelve las paginas de autenticacion con migas de pan hacia el inicio de encuestas.
 */

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Migas } from '@/components/layout/004_migas';
import { resolverMigasAuth } from '@/utils/migasNavegacion';

interface LayoutAuthMigasProps {
  readonly children: ReactNode;
}

export function LayoutAuthMigas({ children }: LayoutAuthMigasProps) {
  const pathname = usePathname();
  const items = resolverMigasAuth(pathname);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Migas items={items} />
      </div>
      {children}
    </>
  );
}

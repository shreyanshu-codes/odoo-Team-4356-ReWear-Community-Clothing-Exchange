"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Shirt, PlusCircle, History, User, GitPullRequest } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/items', label: 'My Items', icon: Shirt },
  { href: '/dashboard/add-item', label: 'List New Item', icon: PlusCircle },
  { href: '/dashboard/swaps', label: 'Swap History', icon: History },
  { href: '/dashboard/requests', label: 'Swap Requests', icon: GitPullRequest },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    refreshUser();
  }, [pathname, refreshUser]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-[240px_1fr] gap-10">
        <aside>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

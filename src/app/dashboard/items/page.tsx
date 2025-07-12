"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { getItemsByUserId } from '@/lib/mockApi';
import type { Item } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyItemsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userItems, setUserItems] = useState<Item[]>([]);

  useEffect(() => {
    if (user) {
      const items = getItemsByUserId(user.id);
      setUserItems(items);
    }
  }, [user]);

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Items</CardTitle>
          <CardDescription>Manage all the items you've listed for swapping.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/add-item"><PlusCircle className="mr-2 h-4 w-4" /> List New Item</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {userItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image src={item.images[0]} alt={item.title} width={40} height={40} className="rounded-md object-cover" data-ai-hint="fashion clothing"/>
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell><Badge variant={item.status === 'available' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
                  <TableCell>{item.points}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/items/${item.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't listed any items yet.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/add-item">List Your First Item</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

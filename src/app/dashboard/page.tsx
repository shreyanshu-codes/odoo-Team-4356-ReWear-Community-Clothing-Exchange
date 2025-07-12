"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getItemsByUserId, getSwapsByUserId, getItemById } from '@/lib/mockApi';
import type { Item, Swap } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

interface EnrichedSwap extends Swap {
  itemTitle?: string;
  itemImage?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [userSwaps, setUserSwaps] = useState<EnrichedSwap[]>([]);

  useEffect(() => {
    if (user) {
      const items = getItemsByUserId(user.id);
      setUserItems(items);
      
      const swaps = getSwapsByUserId(user.id);
      const enrichedSwaps = swaps.map(swap => {
        const item = getItemById(swap.itemId);
        return {
          ...swap,
          itemTitle: item?.title,
          itemImage: item?.images[0],
        };
      });
      setUserSwaps(enrichedSwaps);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Welcome, {user.name}!</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Points</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">{user.points}</p>
          <CardDescription className="mt-1">Use points to redeem items from other users.</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Uploaded Items</CardTitle>
            <CardDescription>Manage the items you've listed for swapping.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/add-item"><PlusCircle className="mr-2 h-4 w-4" /> List New Item</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {userItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userItems.slice(0,3).map(item => (
                <Link key={item.id} href={`/items/${item.id}`}>
                    <Card className="overflow-hidden group">
                        <div className="aspect-video relative">
                            <Image src={item.images[0]} alt={item.title} fill className="object-cover" data-ai-hint="fashion clothing" />
                            <Badge className="absolute top-2 right-2">{item.status}</Badge>
                        </div>
                        <div className="p-3">
                            <h3 className="font-semibold truncate">{item.title}</h3>
                        </div>
                    </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">You haven't listed any items yet.</p>
          )}
          {userItems.length > 3 && 
            <div className="text-center mt-4">
              <Button variant="outline" asChild><Link href="/dashboard/items">View All Your Items</Link></Button>
            </div>
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Swap History</CardTitle>
          <CardDescription>Track your ongoing and completed swaps.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSwaps.length > 0 ? (
                userSwaps.slice(0, 3).map(swap => (
                  <TableRow key={swap.id}>
                    <TableCell className="font-medium">{swap.itemTitle || "Unknown Item"}</TableCell>
                    <TableCell><Badge variant="secondary">{swap.status}</Badge></TableCell>
                    <TableCell>{new Date(swap.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No swap history found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           {userSwaps.length > 3 && 
            <div className="text-center mt-4">
              <Button variant="outline" asChild><Link href="/dashboard/swaps">View All Swaps</Link></Button>
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}

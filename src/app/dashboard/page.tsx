"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getItemsByUserId, getSwapsByUserId, getItemById } from '@/lib/mockApi';
import type { Item, Swap } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface EnrichedSwap extends Swap {
  itemTitle?: string;
  itemImage?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [userSwaps, setUserSwaps] = useState<EnrichedSwap[]>([]);
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };


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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            { user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} width={96} height={96} className="rounded-full object-cover" data-ai-hint="user avatar" />
            ) : (
                <span className="text-4xl font-bold">{getInitials(user.name)}</span>
            )}
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
            <p className="text-lg text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Points</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-primary">{user.points}</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Items Listed</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{userItems.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Total Swaps</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{userSwaps.length}</p>
            </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Listings</h2>
            <Button asChild variant="outline">
                <Link href="/dashboard/items">View All</Link>
            </Button>
        </div>
         {userItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userItems.slice(0,4).map(item => (
                <Link key={item.id} href={`/items/${item.id}`}>
                    <Card className="overflow-hidden group">
                        <div className="aspect-square relative">
                            <Image src={item.images[0]} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint="fashion clothing" />
                        </div>
                        <div className="p-3">
                            <h3 className="font-semibold truncate">{item.title}</h3>
                        </div>
                    </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">You haven't listed any items yet.</p>
                 <Button asChild className="mt-4 bg-accent hover:bg-accent/90">
                    <Link href="/dashboard/add-item">List Your First Item</Link>
                </Button>
            </div>
          )}
      </div>

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Purchases</h2>
            <Button asChild variant="outline">
                <Link href="/dashboard/swaps">View All</Link>
            </Button>
        </div>
         {userSwaps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {userSwaps.filter(s => s.requesterId === user.id && s.status === 'accepted').slice(0, 4).map(swap => (
                    <Link key={swap.id} href={`/items/${swap.itemId}`}>
                        <Card className="overflow-hidden group">
                            <div className="aspect-square relative">
                                <Image src={swap.itemImage || "https://placehold.co/400x400.png"} alt={swap.itemTitle || "Item"} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint="fashion clothing" />
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold truncate">{swap.itemTitle || "Unknown Item"}</h3>
                            </div>
                        </Card>
                    </Link>
                ))}
                {userSwaps.filter(s => s.requesterId === user.id && s.status === 'accepted').length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg col-span-full">
                        <p className="text-muted-foreground">You haven't purchased any items yet.</p>
                    </div>
                )}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">You haven't purchased any items yet.</p>
            </div>
          )}
      </div>

    </div>
  );
}

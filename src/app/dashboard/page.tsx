"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getItemsByUserId, getSwapsByUserId, getItemById } from '@/lib/mockApi';
import type { Item, Swap } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    <div className="space-y-8 container mx-auto">
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <Avatar className="h-24 w-24 border">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
              <h1 className="text-2xl font-bold font-headline">Welcome, {user.name}!</h1>
              <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Points</CardTitle>
                <span className="text-muted-foreground">✨</span>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-primary">{user.points}</p>
                <p className="text-xs text-muted-foreground">Earn more by listing items!</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Items Listed</CardTitle>
                <span className="text-muted-foreground">👕</span>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{userItems.length}</p>
                <p className="text-xs text-muted-foreground">Keep your closet fresh</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
                <span className="text-muted-foreground">🤝</span>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{userSwaps.length}</p>
                <p className="text-xs text-muted-foreground">Successful exchanges</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>My Listings</CardTitle>
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/items">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            <CardDescription>The most recent items you've added.</CardDescription>
        </CardHeader>
         <CardContent>
         {userItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userItems.slice(0,4).map(item => (
                <Link key={item.id} href={`/items/${item.id}`}>
                    <div className="overflow-hidden group border rounded-lg hover:shadow-md transition-all">
                        <div className="aspect-square relative">
                            <Image src={item.images[0]} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint="fashion clothing" />
                        </div>
                        <div className="p-3 bg-card">
                            <h3 className="font-semibold truncate">{item.title}</h3>
                        </div>
                    </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">You haven't listed any items yet.</p>
                 <Button asChild className="mt-4">
                    <Link href="/dashboard/add-item">List Your First Item</Link>
                </Button>
            </div>
          )}
         </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>My Purchases</CardTitle>
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/swaps">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            <CardDescription>Items you've acquired through swapping.</CardDescription>
        </CardHeader>
        <CardContent>
            {userSwaps.filter(s => s.requesterId === user.id && s.status === 'accepted').length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {userSwaps.filter(s => s.requesterId === user.id && s.status === 'accepted').slice(0, 4).map(swap => (
                        <Link key={swap.id} href={`/items/${swap.itemId}`}>
                            <div className="overflow-hidden group border rounded-lg hover:shadow-md transition-all">
                                <div className="aspect-square relative">
                                    <Image src={swap.itemImage || "https://placehold.co/400x400.png"} alt={swap.itemTitle || "Item"} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint="fashion clothing" />
                                </div>
                                <div className="p-3 bg-card">
                                    <h3 className="font-semibold truncate">{swap.itemTitle || "Unknown Item"}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg col-span-full">
                    <p className="text-muted-foreground">You haven't purchased any items yet.</p>
                </div>
              )}
        </CardContent>
      </Card>
    </div>
  );
}

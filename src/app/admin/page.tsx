
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { getItems, getUsers, getSwaps, updateItem, getItemById } from '@/lib/mockApi';
import type { Item, User, Swap } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Search, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EnrichedSwap extends Swap {
  item?: Item;
  requesterName?: string;
  ownerName?: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [swaps, setSwaps] = useState<EnrichedSwap[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'You must be an admin to view this page.' });
        router.push('/');
        return;
      }
      const allItems = getItems();
      const allUsers = getUsers();
      const allSwaps = getSwaps();

      setItems(allItems);
      setUsers(allUsers);
      
      const enrichedSwaps = allSwaps.map(swap => {
        const item = getItemById(swap.itemId);
        const requester = allUsers.find(u => u.id === swap.requesterId);
        const owner = allUsers.find(u => u.id === swap.ownerId);
        return {
          ...swap,
          item,
          requesterName: requester?.name,
          ownerName: owner?.name,
        };
      });
      setSwaps(enrichedSwaps);
    }
  }, [user, loading, router, toast]);

  const handleItemStatusChange = (itemToUpdate: Item, newStatus: 'available' | 'rejected') => {
    const updated = updateItem({ ...itemToUpdate, status: newStatus });
    if (updated) {
      setItems(items.map(item => item.id === updated.id ? updated : item));
      toast({ title: 'Success', description: `Item "${itemToUpdate.title}" has been ${newStatus}.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update item.' });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (loading || !user || user.role !== 'admin') {
    return <div className="container mx-auto py-12 text-center">Loading or Access Denied...</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
        <div className="flex justify-between items-center mt-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
            </div>
            <Avatar>
                <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
        </div>
      </header>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="swaps">Manage Swaps</TabsTrigger>
          <TabsTrigger value="listings">Manage Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
            <div className="space-y-4">
                {users.map((u) => (
                    <Card key={u.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="user avatar" />
                                    <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{u.name} <Badge variant={u.role === 'admin' ? 'destructive' : 'outline'}>{u.role}</Badge></p>
                                    <p className="text-sm text-muted-foreground">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">View Profile</Button>
                                <Button variant="destructive" size="sm" disabled={u.role === 'admin'}>Remove</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="swaps" className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Manage Swaps</h2>
             <div className="space-y-4">
                {swaps.map((swap) => (
                    <Card key={swap.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                {swap.item ? (
                                    <Image src={swap.item.images[0]} alt={swap.item.title} width={64} height={64} className="rounded-md object-cover" data-ai-hint="fashion clothing" />
                                ) : (
                                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                                        <Shirt className="w-8 h-8 text-muted-foreground"/>
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold">{swap.item?.title || 'Unknown Item'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {swap.requesterName} &harr; {swap.ownerName}
                                    </p>
                                    <Badge variant={swap.status === 'accepted' ? 'default' : swap.status === 'rejected' ? 'destructive' : 'secondary'} className="mt-1">{swap.status}</Badge>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/items/${swap.itemId}`}><Eye className="mr-2 h-4 w-4" />View Item</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Manage Listings (Pending Approval)</h2>
             <div className="space-y-4">
                {items.filter(item => item.status === 'pending').map(item => (
                    <Card key={item.id}>
                         <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Image src={item.images[0]} alt={item.title} width={64} height={64} className="rounded-md object-cover" data-ai-hint="fashion clothing" />
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Listed by: {users.find(u => u.id === item.userId)?.name || 'Unknown'}
                                    </p>
                                     <Badge variant="secondary" className="mt-1">{item.status}</Badge>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleItemStatusChange(item, 'available')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleItemStatusChange(item, 'rejected')}>
                                     <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                 {items.filter(item => item.status === 'pending').length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No items are pending approval.</p>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
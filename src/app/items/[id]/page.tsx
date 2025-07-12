
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { getItemById, getUserById, addSwap, updateItem, updateUser, getItems, getItemsByUserId } from '@/lib/mockApi';
import type { Item, User } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [item, setItem] = useState<Item | null>(null);
  const [uploader, setUploader] = useState<User | null>(null);
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [selectedItemToSwap, setSelectedItemToSwap] = useState<Item | null>(null);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      const itemId = Number(params.id);
      const foundItem = getItemById(itemId);
      if (foundItem) {
        setItem(foundItem);
        const foundUploader = getUserById(foundItem.userId);
        setUploader(foundUploader || null);
        
        const allItems = getItems();
        setRelatedItems(
          allItems.filter(i => i.id !== foundItem.id && i.category === foundItem.category && i.status === 'available').slice(0, 4)
        );

        if (user) {
          setUserItems(getItemsByUserId(user.id).filter(i => i.status === 'available'));
        }
      }
    }
  }, [params.id, user]);

  const handleSwapRequest = () => {
    if (!user || !item || !selectedItemToSwap) return;
    setIsLoading(true);
    try {
      addSwap({ 
        itemId: item.id, 
        requesterId: user.id, 
        ownerId: item.userId,
        offeredItemId: selectedItemToSwap.id 
      });
      // Mark both items as pending swap
      updateItem({ ...item, status: 'pending_swap' });
      updateItem({ ...selectedItemToSwap, status: 'pending_swap' });

      toast({ title: 'Success', description: 'Swap request sent! The owner has been notified.' });
      setIsSwapDialogOpen(false);
      setSelectedItemToSwap(null); // Reset selection
      router.push('/dashboard/swaps');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send swap request.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = () => {
    if (!user || !item) return;
    if (user.points < item.points) {
      toast({ variant: 'destructive', title: 'Not enough points', description: "You don't have enough points to redeem this item." });
      return;
    }
    setIsLoading(true);
    try {
      const updatedUser = { ...user, points: user.points - item.points };
      updateUser(updatedUser);
      
      const updatedItem = { ...item, status: 'swapped' as const };
      updateItem(updatedItem);
      
      refreshUser();

      toast({ title: 'Success!', description: `${item.title} has been redeemed.` });
      router.push('/dashboard');

    } catch(error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to redeem item.' });
    } finally {
        setIsLoading(false);
    }
  };


  if (!item) {
    return (
        <div className="container mx-auto py-12 px-4 text-center">
            <p className="text-muted-foreground">Item not found.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
        </div>
    );
  }

  const isOwner = user?.id === item.userId;
  const canTakeAction = user && !isOwner && item.status === 'available';

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Card className="overflow-hidden sticky top-24">
                        <CardContent className="p-0 aspect-square relative">
                            <Image src={item.images[0]} alt={item.title} fill className="object-cover" data-ai-hint="fashion clothing" />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{item.title}</h1>
                    <p className="text-lg text-muted-foreground mt-1">by {uploader?.name || 'Unknown'}</p>
                    
                    <div className="my-6">
                        <h2 className="font-bold text-xl mb-2">Description</h2>
                        <p className="text-foreground/80">{item.description}</p>
                    </div>

                    <div className="my-6">
                        <h2 className="font-bold text-xl mb-2">Details</h2>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><strong>Category:</strong> {item.category}</div>
                            <div><strong>Type:</strong> {item.type}</div>
                            <div><strong>Size:</strong> {item.size}</div>
                            <div><strong>Condition:</strong> {item.condition}</div>
                        </div>
                    </div>
                     <div className="flex flex-wrap gap-2 mt-4">
                        {item.tags.map(tag => <Badge key={tag} variant="secondary">#{tag}</Badge>)}
                    </div>
                </div>
            </div>
        </div>

        <div>
            <Card className="sticky top-24">
                 <CardContent className="p-6 space-y-4">
                    <p className="text-3xl font-bold text-center">{item.points} Points</p>
                    
                    {item.status === 'available' ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <Check className="h-5 w-5" />
                            <span>Available for Swap</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-destructive">
                            <X className="h-5 w-5" />
                            <span>Not Available</span>
                        </div>
                    )}

                    <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={!canTakeAction || isLoading}>
                          Request Swap
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Propose a Swap</DialogTitle>
                          <DialogDescription>
                            Select one of your available items to offer in exchange for "{item.title}".
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[400px] overflow-y-auto space-y-2 p-1">
                          {userItems.length > 0 ? userItems.map(userItem => (
                            <Card 
                              key={userItem.id}
                              className={`flex items-center gap-4 p-3 cursor-pointer transition-all ${selectedItemToSwap?.id === userItem.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                              onClick={() => setSelectedItemToSwap(userItem)}
                            >
                              <Image src={userItem.images[0]} alt={userItem.title} width={48} height={48} className="rounded-md object-cover" data-ai-hint="fashion clothing" />
                              <div className="flex-1">
                                <p className="font-semibold">{userItem.title}</p>
                                <p className="text-sm text-primary">{userItem.points} points</p>
                              </div>
                            </Card>
                          )) : (
                            <p className="text-center text-muted-foreground py-8">You have no available items to swap.</p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsSwapDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleSwapRequest} disabled={!selectedItemToSwap || isLoading}>
                            {isLoading ? <RefreshCw className="animate-spin" /> : 'Send Request'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button size="lg" className="w-full" variant="outline" onClick={handleRedeem} disabled={!canTakeAction || isLoading || (user?.points ?? 0) < item.points}>
                        Redeem with Points
                    </Button>
                    {user && !isOwner && item.status === 'available' && (user.points < item.points) &&
                        <p className="text-destructive text-sm mt-2 text-center">You don't have enough points for this item.</p>
                    }
                    {isOwner &&
                        <p className="text-muted-foreground text-sm mt-2 text-center">This is your item.</p>
                    }
                 </CardContent>
            </Card>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You might also like</h2>
         {relatedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedItems.map(relatedItem => (
                <Card key={relatedItem.id} className="overflow-hidden group transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <Link href={`/items/${relatedItem.id}`}>
                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          src={relatedItem.images[0]}
                          alt={relatedItem.title}
                          fill
                          data-ai-hint="fashion clothing"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg truncate">{relatedItem.title}</h3>
                        <p className="text-primary font-bold mt-2">{relatedItem.points} Points</p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <p className="text-muted-foreground">No related items found.</p>
          )}
      </div>
    </div>
  );
}

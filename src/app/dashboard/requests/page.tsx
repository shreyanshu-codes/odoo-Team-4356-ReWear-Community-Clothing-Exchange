
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { getIncomingSwapsByUserId, updateSwap, getUserById, getItemById, updateUser, updateItem } from '@/lib/mockApi';
import type { Swap, Item, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, RefreshCw } from 'lucide-react';

interface EnrichedSwap extends Swap {
  item?: Item;
  offeredItem?: Item;
  requester?: User;
}

export default function SwapRequestsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<EnrichedSwap[]>([]);

  const fetchRequests = useCallback(() => {
    if (user) {
      const incomingSwaps = getIncomingSwapsByUserId(user.id);
      const enrichedSwaps = incomingSwaps.map(swap => ({
        ...swap,
        item: getItemById(swap.itemId),
        offeredItem: swap.offeredItemId ? getItemById(swap.offeredItemId) : undefined,
        requester: getUserById(swap.requesterId),
      }));
      setRequests(enrichedSwaps);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSwapAction = (swap: EnrichedSwap, newStatus: 'accepted' | 'rejected') => {
    if (!swap.item || !swap.requester || !user) return;

    try {
      updateSwap({ ...swap, status: newStatus });

      if (newStatus === 'accepted') {
        const itemOwner = user;
        const itemRequester = swap.requester;
        const requestedItem = swap.item;
        const offeredItem = swap.offeredItem;

        // Swap ownership if an item was offered
        if(offeredItem) {
            updateItem({ ...requestedItem, userId: itemRequester.id, status: 'available' });
            updateItem({ ...offeredItem, userId: itemOwner.id, status: 'available' });

             toast({
              title: "Swap Accepted!",
              description: `You've traded "${requestedItem.title}" for "${offeredItem.title}".`
            });
        } else {
            // This case handles swaps without an item offer (e.g., points-based, if implemented)
            // For now, it just marks the item as swapped.
            updateItem({ ...requestedItem, status: 'swapped' });
             toast({
              title: "Swap Accepted!",
              description: `You've swapped "${requestedItem.title}" with ${itemRequester.name}.`
            });
        }

      } else {
        // If rejected, make both items available again
        updateItem({ ...swap.item, status: 'available' });
        if (swap.offeredItem) {
          updateItem({ ...swap.offeredItem, status: 'available' });
        }

        toast({
          title: "Swap Rejected",
          description: `You have rejected the request for "${swap.item.title}".`
        });
      }
      
      refreshUser();
      fetchRequests();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while updating the swap."
      });
    }
  };
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incoming Swap Requests</CardTitle>
        <CardDescription>Manage swap requests for your items from other users.</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                   <div className="flex items-center gap-4 flex-1">
                        {req.item && (
                           <Image src={req.item.images[0]} alt={req.item.title} width={64} height={64} className="rounded-md object-cover" data-ai-hint="fashion clothing" />
                        )}
                        <div>
                            <p className="font-semibold text-lg">{req.item?.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={req.requester?.avatarUrl} alt={req.requester?.name} data-ai-hint="user avatar" />
                                    <AvatarFallback>{getInitials(req.requester?.name)}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm text-muted-foreground">
                                    Requested by <span className="font-medium text-foreground">{req.requester?.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {req.offeredItem && (
                       <div className="flex items-center gap-4 flex-1">
                           <RefreshCw className="h-6 w-6 text-muted-foreground" />
                            <Image src={req.offeredItem.images[0]} alt={req.offeredItem.title} width={64} height={64} className="rounded-md object-cover" data-ai-hint="fashion clothing" />
                            <div>
                                <p className="font-semibold text-lg">{req.offeredItem.title}</p>
                                <p className="text-sm text-muted-foreground">Offered Item</p>
                            </div>
                        </div>
                    )}
                  
                   <div className="flex items-center gap-2 self-end md:self-center">
                    {req.status === 'pending' ? (
                      <>
                        <Button size="sm" onClick={() => handleSwapAction(req, 'accepted')}>
                          <Check className="mr-2 h-4 w-4" /> Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleSwapAction(req, 'rejected')}>
                          <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </>
                    ) : (
                      <Badge variant={req.status === 'accepted' ? 'default' : 'destructive'}>{req.status}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You have no incoming swap requests.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getItemById, getUserById, addSwap, updateItem, updateUser } from '@/lib/mockApi';
import type { Item, User } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [item, setItem] = useState<Item | null>(null);
  const [uploader, setUploader] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      const itemId = Number(params.id);
      const foundItem = getItemById(itemId);
      if (foundItem) {
        setItem(foundItem);
        const foundUploader = getUserById(foundItem.userId);
        setUploader(foundUploader || null);
      }
    }
  }, [params.id]);

  const handleSwapRequest = () => {
    if (!user || !item) return;
    setIsLoading(true);
    try {
      addSwap({ itemId: item.id, requesterId: user.id, ownerId: item.userId });
      toast({ title: 'Success', description: 'Swap request sent! The owner has been notified.' });
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
      // Deduct points from redeemer
      const updatedUser = { ...user, points: user.points - item.points };
      updateUser(updatedUser);
      
      // Mark item as swapped
      const updatedItem = { ...item, status: 'swapped' as const };
      updateItem(updatedItem);
      
      // Refresh user in context
      refreshUser();

      toast({ title: 'Success!', description: `${item.title} has been redeemed.` });
      router.push('/dashboard');

    } catch(error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to redeem item.' });
    } finally {
        setIsLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
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
    <div className="container mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to items
      </Button>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {item.images.map((img, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0 aspect-square relative">
                      <Image src={img} alt={`${item.title} image ${index + 1}`} fill className="object-cover" data-ai-hint="fashion clothing" />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {item.images.length > 1 && (
                <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </>
            )}
          </Carousel>
        </div>
        <div>
          <Badge variant={item.status === 'available' ? 'default' : 'secondary'} className={`${item.status === 'available' ? 'bg-green-600 text-white' : ''}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
          <h1 className="text-4xl font-bold font-headline mt-2">{item.title}</h1>
          <p className="text-2xl text-primary font-semibold mt-1">{item.points} Points</p>
          
          <div className="mt-6 prose prose-lg text-foreground/80">
            <p>{item.description}</p>
          </div>

          <Card className="my-6">
            <CardContent className="p-6 grid grid-cols-2 gap-4 text-sm">
                <div><strong>Category:</strong> {item.category}</div>
                <div><strong>Type:</strong> {item.type}</div>
                <div><strong>Size:</strong> {item.size}</div>
                <div><strong>Condition:</strong> {item.condition}</div>
            </CardContent>
          </Card>
          
          <div className="flex flex-wrap gap-2 mt-4">
              {item.tags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
          </div>
          
          {uploader && (
            <div className="mt-6 border-t pt-6 flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={uploader.avatarUrl} alt={uploader.name} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(uploader.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Listed by {uploader.name}</p>
                <p className="text-sm text-muted-foreground">Joined on {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <Button size="lg" onClick={handleSwapRequest} disabled={!canTakeAction || isLoading}>Request Swap</Button>
            <Button size="lg" variant="outline" onClick={handleRedeem} disabled={!canTakeAction || isLoading || (user?.points ?? 0) < item.points}>
              Redeem with Points
            </Button>
          </div>
          {user && (user.points < item.points) && item.status === 'available' &&
            <p className="text-destructive text-sm mt-2">You don't have enough points for this item.</p>
          }
           {isOwner &&
            <p className="text-muted-foreground text-sm mt-2">This is your item.</p>
          }
        </div>
      </div>
    </div>
  );
}

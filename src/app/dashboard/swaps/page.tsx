"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { getSwapsByUserId, getItemById } from '@/lib/mockApi';
import type { Swap, Item } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EnrichedSwap extends Swap {
  item?: Item;
}

export default function SwapHistoryPage() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<EnrichedSwap[]>([]);

  useEffect(() => {
    if (user) {
      const userSwaps = getSwapsByUserId(user.id);
      const enrichedSwaps = userSwaps.map(swap => ({
        ...swap,
        item: getItemById(swap.itemId),
      }));
      setSwaps(enrichedSwaps);
    }
  }, [user]);

  if (!user) return null;

  const getSwapParty = (swap: EnrichedSwap) => {
    if (!swap.item) return 'Unknown User';
    if (user.id === swap.requesterId) {
        const owner = getItemById(swap.itemId);
        return `with ${owner?.userId === 2 ? 'Jane Doe' : 'John Smith'}`; // Simplified for mock
    }
    return `with ${user.name}`;
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Swap History</CardTitle>
          <CardDescription>An overview of all your past and pending swaps.</CardDescription>
        </CardHeader>
        <CardContent>
          {swaps.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {swaps.map(swap => (
                  <TableRow key={swap.id}>
                    <TableCell>
                      {swap.item ? (
                        <Link href={`/items/${swap.item.id}`} className="flex items-center gap-3 group">
                          <Image
                            src={swap.item.images[0]}
                            alt={swap.item.title}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                            data-ai-hint="fashion clothing"
                          />
                          <span className="font-medium group-hover:underline">{swap.item.title}</span>
                        </Link>
                      ) : (
                        'Unknown Item'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getSwapParty(swap)}</TableCell>
                    <TableCell>
                      <Badge variant={swap.status === 'accepted' ? 'default' : swap.status === 'rejected' ? 'destructive' : 'secondary'}>{swap.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(swap.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You have no swap history yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

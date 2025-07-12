"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { getItems } from '@/lib/mockApi';
import type { Item } from '@/lib/types';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const availableItems = getItems().filter(item => item.status === 'available');
    setItems(availableItems);
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline text-primary">Browse Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">Find your next favorite piece and give it a new home.</p>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden group transition-all hover:shadow-lg">
              <CardContent className="p-0">
                <Link href={`/items/${item.id}`}>
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      data-ai-hint="fashion clothing"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.category} &bull; {item.size}</p>
                    <p className="text-primary font-bold mt-2">{item.points} Points</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <p className="text-muted-foreground">No items currently available for swapping. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

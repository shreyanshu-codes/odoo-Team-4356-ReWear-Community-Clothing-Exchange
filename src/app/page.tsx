"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Item } from '@/lib/types';
import { getItems } from '@/lib/mockApi';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const allItems = getItems();
    // In a real app, you'd have a 'featured' flag. Here we just take the first few.
    setFeaturedItems(allItems.slice(0, 10));
  }, []);

  return (
    <div className="flex flex-col items-center">
      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
            Swap, Reuse, Sustain
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80">
            Join the ReWear community to exchange clothing, embrace sustainable fashion, and reduce textile waste. Give your wardrobe a second life.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href={user ? "/dashboard/add-item" : "/signup"}>
                Start Swapping <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/items">Browse Items</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary font-headline">Featured Items</h2>
          <p className="mt-2 text-center text-muted-foreground">Get inspired by what others are sharing</p>
          <div className="mt-10">
            {featuredItems.length > 0 ? (
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {featuredItems.map((item) => (
                    <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card className="overflow-hidden group">
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
                                <p className="text-muted-foreground text-sm">{item.category}</p>
                                <p className="text-primary font-bold mt-2">{item.points} Points</p>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
              </Carousel>
            ) : (
              <p className="text-center text-muted-foreground mt-8">No featured items available at the moment.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

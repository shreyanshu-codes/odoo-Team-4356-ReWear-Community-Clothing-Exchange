"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Item } from '@/lib/types';
import { getItems } from '@/lib/mockApi';
import { ArrowRight, Search, Shirt, ShoppingBag, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const allItems = getItems().filter(item => item.status === 'available');
    // In a real app, you'd have a 'featured' flag. Here we just take a few.
    setFeaturedItems(allItems.sort((a,b) => b.id - a.id).slice(0, 8));
  }, []);
  
  const categories = [
      { name: "Tops", icon: Shirt },
      { name: "Pants", icon: ShoppingBag },
      { name: "Dresses", icon: Gift },
      { name: "Jackets", icon: Shirt },
  ]

  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for items..." className="w-full pl-12 py-7 text-lg rounded-full" />
             </div>
             <div className="mt-4 flex items-center justify-center gap-4">
                <Button asChild className="bg-accent hover:bg-accent/90">
                    <Link href={user ? "/dashboard/add-item" : "/signup"}>
                        Start Swapping <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/items">Browse Items</Link>
                </Button>
            </div>
          </div>
          <div className="mt-12">
            <div className="aspect-[21/9] w-full relative overflow-hidden rounded-2xl">
                <Image src="https://placehold.co/1200x500.png" alt="Hero image" fill data-ai-hint="sustainable fashion" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-8">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                        Give Your Wardrobe a Second Life
                    </h1>
                </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Shop by Category</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map(category => (
                    <Link key={category.name} href="/items">
                        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                           <category.icon className="h-12 w-12 mx-auto text-primary" />
                           <p className="mt-4 font-semibold text-lg">{category.name}</p>
                        </Card>
                    </Link>
                ))}
             </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">Product Listings</h2>
          <div className="mt-10">
            {featuredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredItems.map(item => (
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
              <p className="text-center text-muted-foreground mt-8">No featured items available at the moment.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

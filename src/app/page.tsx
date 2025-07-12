
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
    setFeaturedItems(allItems.sort((a,b) => b.id - a.id).slice(0, 8));
  }, []);
  
  const categories = [
      { name: "Tops", icon: Shirt },
      { name: "Pants", icon: ShoppingBag },
      { name: "Dresses", icon: Gift },
      { name: "Jackets", icon: Shirt },
  ]

  return (
    <div className="flex flex-col items-center home-bg-gradient">
      <section className="w-full py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image src="https://assets.grok.com/users/705eca55-d729-4d51-b651-e1fdcd394a84/generated/db56ebf4-b19e-4a69-8cd7-01745b2dab99/image.jpg" alt="Hero image" fill data-ai-hint="sustainable fashion" className="object-cover" />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-8">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
                        Give Your Wardrobe a Second Life
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow-md">
                        Join a community dedicated to sustainable fashion. Swap clothes, earn points, and refresh your style without impacting the planet.
                    </p>
                     <div className="mt-8 flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-white/90 text-primary hover:bg-white">
                            <Link href={user ? "/dashboard/add-item" : "/signup"}>
                                Start Swapping <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="text-white border-white/80 hover:bg-white/10 hover:text-white">
                            <Link href="/items">Browse Items</Link>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="mt-12 max-w-3xl mx-auto glassmorphism p-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search for stylish pre-loved items..." className="w-full pl-12 py-7 text-lg rounded-full" />
                </div>
            </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 text-gradient">Shop by Category</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map(category => (
                    <Link key={category.name} href="/items">
                        <div className="text-center p-6 glassmorphism hover:shadow-xl transition-shadow cursor-pointer">
                           <category.icon className="h-12 w-12 mx-auto text-primary" />
                           <p className="mt-4 font-semibold text-lg">{category.name}</p>
                        </div>
                    </Link>
                ))}
             </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gradient">Product Listings</h2>
          <div className="mt-10">
            {featuredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredItems.map(item => (
                  <Card key={item.id} className="overflow-hidden group transition-all hover:shadow-lg bg-background/50">
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

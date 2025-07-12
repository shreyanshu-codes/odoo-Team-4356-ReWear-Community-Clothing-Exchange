
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Item } from '@/lib/types';
import { getItems } from '@/lib/mockApi';
import { ArrowRight, Shirt, RefreshCw, Handshake, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const allItems = getItems().filter(item => item.status === 'available');
    setFeaturedItems(allItems.sort((a,b) => b.id - a.id).slice(0, 8));
  }, []);
  
  const howItWorksSteps = [
    {
      icon: CheckCircle,
      title: "List Your Items",
      description: "Snap a photo of clothes you don't wear anymore and list them in seconds.",
    },
    {
      icon: RefreshCw,
      title: "Swap & Earn Points",
      description: "Other users can request to swap items with you, or you can earn points when your items are approved.",
    },
    {
      icon: Handshake,
      title: "Get New Styles",
      description: "Use your points or swapped items to get new-to-you pieces from the community.",
    },
  ];

  return (
    <div className="flex flex-col items-center home-bg-gradient">
      <section className="w-full py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 text-center">
            <div className="relative aspect-video lg:aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image src="https://assets.grok.com/users/705eca55-d729-4d51-b651-e1fdcd394a84/generated/db56ebf4-b19e-4a69-8cd7-01745b2dab99/image.jpg" alt="Hero image" priority fill data-ai-hint="sustainable fashion" className="object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
                        Give Your Wardrobe a Second Life
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow-md">
                        Join a community dedicated to sustainable fashion. Swap clothes, earn points, and refresh your style without impacting the planet.
                    </p>
                     <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                            <Link href={user ? "/dashboard/add-item" : "/signup"}>
                                Start Swapping <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="text-white border-white/80 hover:bg-white/10 hover:text-white shadow-lg backdrop-blur-sm">
                            <Link href="/items">Browse Items</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">A simple, rewarding process to refresh your wardrobe sustainably.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {howItWorksSteps.map(step => (
                    <div key={step.title} className="text-center p-6 glassmorphism">
                       <div className="flex justify-center items-center mb-4">
                          <div className="p-4 bg-primary/20 rounded-full">
                            <step.icon className="h-8 w-8 text-primary" />
                          </div>
                       </div>
                       <h3 className="mt-4 font-semibold text-xl">{step.title}</h3>
                       <p className="mt-2 text-muted-foreground">{step.description}</p>
                    </div>
                ))}
             </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gradient">Latest Listings</h2>
            <Button asChild variant="outline">
                <Link href="/items">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div>
            {featuredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredItems.map(item => (
                  <Card key={item.id} className="overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1 bg-background/80">
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

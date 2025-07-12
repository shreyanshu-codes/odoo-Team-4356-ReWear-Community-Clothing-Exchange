"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { getItems } from '@/lib/mockApi';
import type { Item } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ItemsPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');


  useEffect(() => {
    const availableItems = getItems().filter(item => item.status === 'available');
    setAllItems(availableItems);
    setFilteredItems(availableItems);
  }, []);

  useEffect(() => {
    let items = [...allItems];
    
    // Filter by search term
    if (searchTerm) {
        items = items.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filter by category
    if (category !== 'All') {
        items = items.filter(item => item.category === category);
    }

    // Sort items
    if (sort === 'newest') {
        items.sort((a, b) => b.id - a.id);
    } else if (sort === 'points-asc') {
        items.sort((a, b) => a.points - b.points);
    } else if (sort === 'points-desc') {
        items.sort((a, b) => b.points - a.points);
    }

    setFilteredItems(items);
  }, [searchTerm, category, sort, allItems]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search for items..." 
                className="w-full pl-10 text-lg py-6 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-6">
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Tops">Tops</SelectItem>
                    <SelectItem value="Dresses">Dresses</SelectItem>
                    <SelectItem value="Pants">Pants</SelectItem>
                    <SelectItem value="Jackets">Jackets</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="points-asc">Points: Low to High</SelectItem>
                    <SelectItem value="points-desc">Points: High to Low</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
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
            <p className="text-muted-foreground text-lg">No items found.</p>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

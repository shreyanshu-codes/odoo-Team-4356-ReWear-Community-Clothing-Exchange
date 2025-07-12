// This file simulates a backend API using localStorage.
// It's client-side only and should not be used in server components.
"use client";

import type { User, Item, Swap } from './types';

const isBrowser = typeof window !== 'undefined';

const initializeLocalStorage = () => {
  if (!isBrowser) return;

  if (!localStorage.getItem('rewear_users')) {
    const initialUsers: User[] = [
      { id: 1, email: "admin@rewear.com", password: "password123!", name: "Admin", points: 100, role: "admin" },
      { id: 2, email: "jane@rewear.com", password: "password123!", name: "Jane Doe", points: 50, role: "user" },
      { id: 3, email: "john@rewear.com", password: "password123!", name: "John Smith", points: 30, role: "user" },
    ];
    localStorage.setItem('rewear_users', JSON.stringify(initialUsers));
  }

  if (!localStorage.getItem('rewear_items')) {
    const initialItems: Item[] = [
      { id: 1, title: "Vintage Denim Jacket", description: "A classic denim jacket from the 90s. In great condition.", userId: 2, images: ["https://placehold.co/600x600.png"], category: "Jackets", type: "Casual", size: "M", condition: "Gently Used", tags: ["vintage", "denim"], status: "available", points: 20 },
      { id: 2, title: "Summer Floral Dress", description: "Light and airy floral dress, perfect for summer. Worn only a few times.", userId: 2, images: ["https://placehold.co/600x600.png"], category: "Dresses", type: "Casual", size: "S", condition: "Gently Used", tags: ["summer", "floral"], status: "available", points: 15 },
      { id: 3, title: "Formal Black Trousers", description: "Classic black trousers for formal occasions. Excellent condition.", userId: 3, images: ["https://placehold.co/600x600.png"], category: "Pants", type: "Formal", size: "L", condition: "Gently Used", tags: ["formal", "work"], status: "pending", points: 25 },
      { id: 4, title: "Graphic T-Shirt", description: "Cool graphic tee with a retro design.", userId: 3, images: ["https://placehold.co/600x600.png"], category: "Tops", type: "Casual", size: "M", condition: "Used", tags: ["graphic", "cotton"], status: "swapped", points: 10 },
      { id: 5, title: "Wool Scarf", description: "Warm wool scarf for winter.", userId: 2, images: ["https://placehold.co/600x600.png"], category: "Accessories", type: "Casual", size: "M", condition: "New", tags: ["winter", "wool"], status: "available", points: 10 },
      { id: 6, title: "Running Sneakers", description: "Comfortable running sneakers, used but still in good shape.", userId: 3, images: ["https://placehold.co/600x600.png"], category: "Accessories", type: "Sport", size: "L", condition: "Used", tags: ["sports", "sneakers"], status: "available", points: 30 },
    ];
    localStorage.setItem('rewear_items', JSON.stringify(initialItems));
  }

  if (!localStorage.getItem('rewear_swaps')) {
    const initialSwaps: Swap[] = [
       { id: 1, itemId: 4, requesterId: 2, ownerId: 3, status: "accepted", createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('rewear_swaps', JSON.stringify(initialSwaps));
  }
};

initializeLocalStorage();

// Generic helper functions
const getStore = <T>(key: string): T[] => {
  if (!isBrowser) return [];
  return JSON.parse(localStorage.getItem(key) || '[]') as T[];
};

const setStore = <T>(key: string, data: T[]) => {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(data));
};

// User Functions
export const getUsers = (): User[] => getStore<User>('rewear_users');
export const getUserById = (id: number): User | undefined => getUsers().find(u => u.id === id);
export const getUserByEmail = (email: string): User | undefined => getUsers().find(u => u.email === email);
export const addUser = (user: Omit<User, 'id' | 'points' | 'role'>): User => {
  const users = getUsers();
  const newUser: User = { 
    ...user, 
    id: Date.now(), 
    points: 10, // Starting points
    role: 'user' 
  };
  setStore<User>('rewear_users', [...users, newUser]);
  return newUser;
};
export const updateUser = (updatedUser: User): User | undefined => {
    let users = getUsers();
    users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
    setStore('rewear_users', users);
    return updatedUser;
}


// Item Functions
export const getItems = (): Item[] => getStore<Item>('rewear_items');
export const getItemById = (id: number): Item | undefined => getItems().find(i => i.id === id);
export const getItemsByUserId = (userId: number): Item[] => getItems().filter(i => i.userId === userId);
export const addItem = (item: Omit<Item, 'id' | 'status' | 'points'>): Item => {
  const items = getItems();
  const newItem: Item = { 
    ...item, 
    id: Date.now(), 
    status: 'pending', // Items now start as pending
    points: 10 // default points
  };
  setStore<Item>('rewear_items', [...items, newItem]);
  return newItem;
};
export const updateItem = (updatedItem: Item): Item | undefined => {
    let items = getItems();
    items = items.map(item => item.id === updatedItem.id ? updatedItem : item);
    setStore('rewear_items', items);
    return updatedItem;
};

// Swap Functions
export const getSwaps = (): Swap[] => getStore<Swap>('rewear_swaps');
export const getSwapsByUserId = (userId: number): Swap[] => getSwaps().filter(s => s.requesterId === userId || s.ownerId === userId);
export const addSwap = (swap: Omit<Swap, 'id' | 'status' | 'createdAt'>): Swap => {
  const swaps = getSwaps();
  const newSwap: Swap = {
    ...swap,
    id: Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  setStore<Swap>('rewear_swaps', [...swaps, newSwap]);
  // Also update item status
  const item = getItemById(swap.itemId);
  if (item) {
    item.status = 'pending';
    updateItem(item);
  }
  return newSwap;
}

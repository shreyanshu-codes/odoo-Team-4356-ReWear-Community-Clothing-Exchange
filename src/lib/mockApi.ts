
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

  // Clear old items to replace with new ones
  localStorage.removeItem('rewear_items');
  
  if (!localStorage.getItem('rewear_items')) {
    const initialItems: Item[] = [
      { id: 1, title: "Aesthetic Anime Printed T-shirt", description: "Oversized T-shirt with a unique aesthetic anime print. Perfect for a casual, stylish look.", userId: 2, images: ["https://thalasiknitfab.com/cdn/shop/files/TTS_661_ANIME_wOMEN_3_490x@2x.progressive.png.jpg?v=1696401980"], category: "Tops", type: "Casual", size: "M", condition: "New", tags: ["anime", "oversized", "aesthetic"], status: "available", points: 18 },
      { id: 2, title: "Women Baggy Blue Wide Leg Jeans", description: "High-rise, stretchable baggy jeans for a comfortable and trendy fit.", userId: 2, images: ["https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/25750064/2024/1/29/cfd8b277-d480-404d-a097-e6f8ad15edb71706507368324-The-Roadster-Life-Co-Women-Baggy-Blue-Wide-Leg-Stretchable-J-4.jpg"], category: "Pants", type: "Casual", size: "L", condition: "Gently Used", tags: ["baggy", "jeans", "high-rise"], status: "available", points: 22 },
      { id: 3, title: "Vintage Washed Wide Leg Baggy Jeans", description: "Tinted vintage wash baggy jeans with a wide leg. A real statement piece.", userId: 3, images: ["https://offduty.in/cdn/shop/files/IMG_2367_1400x.heic?v=1747200522"], category: "Pants", type: "Casual", size: "M", condition: "Used", tags: ["vintage", "wide-leg"], status: "available", points: 20 },
      { id: 4, title: "Breathable Baggy Cargo Pants", description: "Light and breathable baggy cargo pants. Ideal for a relaxed, utilitarian style.", userId: 3, images: ["https://littleboxindia.com/cdn/shop/files/28d_d3808282-d2fc-45e4-88eb-23cb4910b970.jpg?v=1740750143"], category: "Pants", type: "Casual", size: "S", condition: "Gently Used", tags: ["cargo", "baggy"], status: "pending", points: 15 },
      { id: 5, title: "White Ribbed Drawstring Crop Top", description: "A cute and simple white ribbed crop top with an adjustable drawstring front.", userId: 2, images: ["https://d1it09c4puycyh.cloudfront.net/catalog/product/j/r/jr2492_w.jpg"], category: "Tops", type: "Casual", size: "S", condition: "New", tags: ["crop-top", "white", "ribbed"], status: "available", points: 12 },
      { id: 6, title: "Men's Regular Casual Pants", description: "Comfortable and versatile casual pants for men, suitable for everyday wear.", userId: 3, images: ["https://m.media-amazon.com/images/I/91qdN8vNgAL._UY1100_.jpg"], category: "Pants", type: "Casual", size: "L", condition: "Used", tags: ["casual", "men"], status: "available", points: 14 },
      { id: 7, title: "Butterfly Print Top for Women", description: "Stylish and modern top for women with a subtle butterfly print.", userId: 2, images: ["https://i.pinimg.com/474x/f7/a8/f2/f7a8f24c1bb94860f3915760ceb02515.jpg"], category: "Tops", type: "Casual", size: "M", condition: "Gently Used", tags: ["stylish", "print"], status: "swapped", points: 10 },
    ];
    localStorage.setItem('rewear_items', JSON.stringify(initialItems));
  }

  if (!localStorage.getItem('rewear_swaps')) {
    const initialSwaps: Swap[] = [
       { id: 1, itemId: 7, requesterId: 3, ownerId: 2, status: "accepted", createdAt: new Date().toISOString() },
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
export const deleteItem = (itemId: number): void => {
    let items = getItems();
    items = items.filter(item => item.id !== itemId);
    setStore('rewear_items', items);
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

    

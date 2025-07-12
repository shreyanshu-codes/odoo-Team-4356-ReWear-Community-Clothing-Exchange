
"use client";

import type { User, Item, Swap } from './types';

// NOTE: This file is being phased out in favor of Firebase.
// It is kept for providing initial data and for components that haven't been migrated yet.

const isBrowser = typeof window !== 'undefined';

const initializeLocalStorage = () => {
  if (!isBrowser) return;

  if (!localStorage.getItem('rewear_users')) {
    const initialUsers: any[] = [
      { id: 'admin-mock-id', email: "admin@rewear.com", password: "password123!", name: "Admin", points: 500, role: "admin", avatarUrl: "https://placehold.co/100x100.png" },
      { id: 'jane-mock-id', email: "jane@rewear.com", password: "password123!", name: "Jane Doe", points: 500, role: "user", avatarUrl: "https://placehold.co/100x100.png" },
      { id: 'john-mock-id', email: "john@rewear.com", password: "password123!", name: "John Smith", points: 500, role: "user", avatarUrl: "https://placehold.co/100x100.png" },
      { id: 'mayank-mock-id', email: "mayankdl1972@gmail.com", password: "password123!", name: "Mayank", points: 500, role: "user", avatarUrl: "https://placehold.co/100x100.png" },
    ];
    localStorage.setItem('rewear_users', JSON.stringify(initialUsers));
  }
  
  if (!localStorage.getItem('rewear_items')) {
    const initialItems: any[] = [
      { id: 1, title: "Aesthetic Anime Printed T-shirt", description: "Oversized T-shirt with a unique aesthetic anime print. Perfect for a casual, stylish look.", userId: 'jane-mock-id', images: ["https://thalasiknitfab.com/cdn/shop/files/TTS_661_ANIME_wOMEN_3_490x@2x.progressive.png.jpg?v=1696401980"], category: "Tops", type: "Casual", size: "M", condition: "New", tags: ["anime", "oversized", "aesthetic"], status: "available", points: 180 },
      { id: 2, title: "Women Baggy Blue Wide Leg Jeans", description: "High-rise, stretchable baggy jeans for a comfortable and trendy fit.", userId: 'jane-mock-id', images: ["https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/25750064/2024/1/29/cfd8b277-d480-404d-a097-e6f8ad15edb71706507368324-The-Roadster-Life-Co-Women-Baggy-Blue-Wide-Leg-Stretchable-J-4.jpg"], category: "Pants", type: "Casual", size: "L", condition: "Gently Used", tags: ["baggy", "jeans", "high-rise"], status: "available", points: 220 },
      { id: 3, title: "Vintage Washed Wide Leg Baggy Jeans", description: "Tinted vintage wash baggy jeans with a wide leg. A real statement piece.", userId: 'john-mock-id', images: ["https://offduty.in/cdn/shop/files/IMG_2367_1400x.heic?v=1747200522"], category: "Pants", type: "Casual", size: "M", condition: "Used", tags: ["vintage", "wide-leg"], status: "available", points: 200 },
      { id: 4, title: "Breathable Baggy Cargo Pants", description: "Light and breathable baggy cargo pants. Ideal for a relaxed, utilitarian style.", userId: 'john-mock-id', images: ["https://littleboxindia.com/cdn/shop/files/28d_d3808282-d2fc-45e4-88eb-23cb4910b970.jpg?v=1740750143"], category: "Pants", type: "Casual", size: "S", condition: "Gently Used", tags: ["cargo", "baggy"], status: "pending", points: 150 },
      { id: 5, title: "White Ribbed Drawstring Crop Top", description: "A cute and simple white ribbed crop top with an adjustable drawstring front.", userId: 'jane-mock-id', images: ["https://d1it09c4puycyh.cloudfront.net/catalog/product/j/r/jr2492_w.jpg"], category: "Tops", type: "Casual", size: "S", condition: "New", tags: ["crop-top", "white", "ribbed"], status: "available", points: 120 },
      { id: 6, title: "Men's Regular Casual Pants", description: "Comfortable and versatile casual pants for men, suitable for everyday wear.", userId: 'john-mock-id', images: ["https://m.media-amazon.com/images/I/91qdN8vNgAL._UY1100_.jpg"], category: "Pants", type: "Casual", size: "L", condition: "Used", tags: ["casual", "men"], status: "available", points: 140 },
      { id: 7, title: "Butterfly Print Top for Women", description: "Stylish and modern top for women with a subtle butterfly print.", userId: 'jane-mock-id', images: ["https://i.pinimg.com/474x/f7/a8/f2/f7a8f24c1bb94860f3915760ceb02515.jpg"], category: "Tops", type: "Casual", size: "M", condition: "Gently Used", tags: ["stylish", "print"], status: "swapped", points: 100 },
      { id: 8, title: "Men Jeans Denim", description: "Classic blue denim jeans for men. A staple for any wardrobe.", userId: 'john-mock-id', images: ["https://tigc.in/cdn/shop/files/compress_0421-cpdnm-azure__1.jpg?v=1720758011"], category: "Pants", type: "Casual", size: "L", condition: "New", tags: ["jeans", "denim", "men"], status: "available", points: 250 },
      { id: 9, title: "Bomber Jacket", description: "Stylish and comfortable bomber jacket, perfect for a cool look.", userId: 'jane-mock-id', images: ["https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/25080860/2023/10/26/eb8530aa-292d-4b84-9e49-ee56a12999ce1698304530703-boohooMAN-Bomber-Jacket-5211698304530502-1.jpg"], category: "Jackets", type: "Casual", size: "M", condition: "Gently Used", tags: ["jacket", "bomber"], status: "available", points: 300 },
      { id: 10, title: "Pure Cotton Collar Shirt", description: "A classic pure cotton collar shirt from Marks & Spencer.", userId: 'john-mock-id', images: ["https://assets.digitalcontent.marksandspencer.app/image/upload/w_600,h_780,q_auto,f_auto,e_sharpen/SD_03_T11_0730A_Z0_X_EC_0"], category: "Tops", type: "Formal", size: "XL", condition: "New", tags: ["shirt", "formal", "cotton"], status: "available", points: 280 },
      { id: 11, title: "Jack & Jones Solid Casual Shirt", description: "A stylish beige casual shirt for men from Jack & Jones.", userId: 'jane-mock-id', images: ["https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24577032/2023/8/21/9d687d8f-8dfd-4653-9b33-4c3af2b3d3651692623856872JackJonesMenBeigeOpaqueCasualShirt1.jpg"], category: "Tops", type: "Casual", size: "M", condition: "Gently Used", tags: ["shirt", "casual", "men"], status: "available", points: 240 }
    ];
    localStorage.setItem('rewear_items', JSON.stringify(initialItems));
  }

  if (!localStorage.getItem('rewear_swaps')) {
    const initialSwaps: any[] = [
       { id: 1, itemId: 7, requesterId: 'john-mock-id', ownerId: 'jane-mock-id', status: "completed", createdAt: new Date().toISOString() },
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
export const getUserById = (id: string): User | undefined => getUsers().find(u => u.id === id);
export const getUserByEmail = (email: string): User | undefined => getUsers().find(u => u.email === email);
export const addUser = (user: Omit<User, 'id' | 'points' | 'role' | 'avatarUrl'>): User => {
  const users = getUsers();
  const newUser: User = { 
    ...user, 
    id: String(Date.now()), 
    points: 500, // Starting points
    role: 'user',
    avatarUrl: `https://placehold.co/100x100.png`
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
export const getItemsByUserId = (userId: string): Item[] => getItems().filter(i => i.userId === userId);
export const addItem = (item: Omit<Item, 'id' | 'status' | 'points'>): Item => {
  const items = getItems();
  const newItem: Item = { 
    ...item, 
    id: Date.now(), 
    status: 'pending', // Items now start as pending
    points: 250 // default points
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
export const getSwapsByUserId = (userId: string): Swap[] => getSwaps().filter(s => s.requesterId === userId || s.ownerId === userId);
export const getIncomingSwapsByUserId = (userId: string): Swap[] => getSwaps().filter(s => s.ownerId === userId);
export const getPendingIncomingSwapsByUserId = (userId: string): Swap[] => getSwaps().filter(s => s.ownerId === userId && s.status === 'pending');

export const addSwap = (swap: Omit<Swap, 'id' | 'status' | 'createdAt'>): Swap => {
  const swaps = getSwaps();
  const newSwap: Swap = {
    ...swap,
    id: Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  setStore<Swap>('rewear_swaps', [...swaps, newSwap]);
  
  // Also update item status to 'pending_swap'
  const item = getItemById(swap.itemId);
  if (item) {
    updateItem({ ...item, status: 'pending_swap' });
  }
  return newSwap;
}

export const updateSwap = (updatedSwap: Swap): Swap | undefined => {
    let swaps = getSwaps();
    swaps = swaps.map(swap => swap.id === updatedSwap.id ? updatedSwap : swap);
    setStore('rewear_swaps', swaps);
    return updatedSwap;
};

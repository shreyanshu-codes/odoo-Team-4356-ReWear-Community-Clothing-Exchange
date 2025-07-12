export interface User {
  id: number;
  email: string;
  password: string; // In a real app, this would be a hash
  name: string;
  location?: string;
  points: number;
  role: 'user' | 'admin';
}

export interface Item {
  id: number;
  title: string;
  description: string;
  userId: number;
  images: string[];
  category: 'Tops' | 'Dresses' | 'Pants' | 'Jackets' | 'Accessories';
  type: 'Casual' | 'Formal' | 'Sport';
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  condition: 'New' | 'Gently Used' | 'Used';
  tags: string[];
  status: 'available' | 'pending' | 'swapped' | 'rejected';
  points: number;
}

export interface Swap {
  id: number;
  itemId: number;
  requesterId: number;
  ownerId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

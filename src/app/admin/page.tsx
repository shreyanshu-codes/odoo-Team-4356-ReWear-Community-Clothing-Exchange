"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getItems, getUsers, updateItem } from '@/lib/mockApi';
import type { Item, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
        return;
      }
      setItems(getItems());
      setUsers(getUsers());
    }
  }, [user, loading, router]);

  const handleItemStatusChange = (itemToUpdate: Item, newStatus: 'available' | 'rejected') => {
    const updated = updateItem({ ...itemToUpdate, status: newStatus });
    if (updated) {
      setItems(items.map(item => item.id === updated.id ? updated : item));
      toast({ title: 'Success', description: `Item "${itemToUpdate.title}" has been ${newStatus}.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update item.' });
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return <div className="container mx-auto py-12 text-center">Access Denied</div>;
  }
  
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users and moderate item listings.</p>
      </div>

      <Tabs defaultValue="items">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Item Moderation</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Item Listings</CardTitle>
              <CardDescription>Review and approve or reject items submitted by users.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{users.find(u => u.id === item.userId)?.name || 'Unknown'}</TableCell>
                      <TableCell><Badge variant={item.status === 'available' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleItemStatusChange(item, 'available')}
                          disabled={item.status === 'available'}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleItemStatusChange(item, 'rejected')}
                          disabled={item.status === 'rejected'}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>View all registered users on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.points}</TableCell>
                      <TableCell><Badge variant={u.role === 'admin' ? 'destructive' : 'outline'}>{u.role}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

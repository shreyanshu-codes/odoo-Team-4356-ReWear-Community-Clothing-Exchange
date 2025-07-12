"use client";

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleUpdate = () => {
    // In a real app, this would submit to the backend.
    // Here, we just show a toast notification.
    toast({
        title: "Profile Updated",
        description: "Your information has been saved.",
    });
  }

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>View and manage your account details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue={user.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={user.email} disabled />
        </div>
        <div className="space-y-2">
            <Label>Points</Label>
            <p className="text-2xl font-bold">{user.points}</p>
        </div>
        <Button onClick={handleUpdate}>Update Profile</Button>
      </CardContent>
    </Card>
  );
}

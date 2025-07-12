"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { addItem } from '@/lib/mockApi';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  image: z
    .any()
    .refine((files) => files?.length == 1, "Image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  category: z.enum(['Tops', 'Dresses', 'Pants', 'Jackets', 'Accessories']),
  type: z.enum(['Casual', 'Formal', 'Sport']),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL']),
  condition: z.enum(['New', 'Gently Used', 'Used']),
  tags: z.string().min(1, "Please add at least one tag."),
});

export default function AddItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: undefined,
      tags: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", e.target.files);
    } else {
      setImagePreview(null);
      form.setValue("image", undefined);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Not authenticated", description: "You must be logged in to list an item." });
      return;
    }
    setIsLoading(true);

    const file = values.image[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      try {
        const base64Image = reader.result as string;
        addItem({
          ...values,
          userId: user.id,
          images: [base64Image],
          tags: values.tags.split(',').map(tag => tag.trim()),
        });
        toast({ title: "Success!", description: "Your item has been listed for approval." });
        router.push('/dashboard/items');
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to list item. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        toast({ variant: "destructive", title: "Error", description: "Could not read the image file."});
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>List a New Item</CardTitle>
        <CardDescription>Fill out the details below to add a new item to the swap market.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Vintage Blue Jeans" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe your item, its condition, and any special features." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                   {imagePreview && <img src={imagePreview} alt="Image Preview" className="w-32 h-32 object-cover rounded-md" />}
                  <FormControl>
                     <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                  </FormControl>
                  <FormDescription>Upload a clear photo of your item (PNG, JPG, WEBP, max 5MB).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['Tops', 'Dresses', 'Pants', 'Jackets', 'Accessories'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['Casual', 'Formal', 'Sport'].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a size" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['XS', 'S', 'M', 'L', 'XL'].map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a condition" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['New', 'Gently Used', 'Used'].map(con => <SelectItem key={con} value={con}>{con}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl><Input placeholder="vintage, cotton, blue (comma-separated)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>{isLoading ? "Listing Item..." : "List Item"}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

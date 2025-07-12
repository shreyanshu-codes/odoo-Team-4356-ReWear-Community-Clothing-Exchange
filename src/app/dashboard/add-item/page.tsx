"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { addItem } from '@/lib/mockApi';
import { generateItemDetails } from '@/ai/flows/generate-item-details';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, UploadCloud } from 'lucide-react';
import Image from 'next/image';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageFile: z.any().refine((files) => files?.length == 1, "Image is required.").refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`).refine(
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      imageFile: undefined,
    },
  });
  
  const fileRef = form.register("imageFile");

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  
  const handleAutofill = async () => {
    if (!imagePreview) {
      toast({ variant: 'destructive', title: 'No Image', description: 'Please provide an image first to use AI autofill.' });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generateItemDetails({ photoDataUri: imagePreview });
      form.setValue('title', result.title, { shouldValidate: true });
      form.setValue('description', result.description, { shouldValidate: true });
      form.setValue('category', result.category, { shouldValidate: true });
      form.setValue('type', result.type, { shouldValidate: true });
      form.setValue('size', result.size, { shouldValidate: true });
      form.setValue('condition', result.condition, { shouldValidate: true });
      form.setValue('tags', result.tags.join(', '), { shouldValidate: true });
      toast({ title: 'Success', description: 'AI has filled in the item details.' });
    } catch (error) {
      console.error('AI autofill failed:', error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate details. Please fill them in manually.' });
    } finally {
      setIsAiLoading(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Not authenticated", description: "You must be logged in to list an item." });
      return;
    }
    setIsLoading(true);

    const file = values.imageFile[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        const base64Image = reader.result as string;
        try {
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
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">List a New Item</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
                 <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Add Image</FormLabel>
                      <FormControl>
                        <div className="relative w-full h-64 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-muted-foreground hover:border-primary transition-colors">
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Image Preview" fill className="object-cover rounded-lg" />
                            ) : (
                                <>
                                    <UploadCloud className="h-12 w-12" />
                                    <p className="mt-2">Click to browse or drag & drop</p>
                                </>
                            )}
                            <Input 
                                type="file" 
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" 
                                accept="image/png, image/jpeg, image/webp"
                                {...fileRef}
                                onChange={handleImageFileChange}
                            />
                        </div>
                      </FormControl>
                      <FormDescription>Upload a clear photo of your item (PNG, JPG, WEBP, max 5MB).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end gap-4">
                    <Button type="button" className="w-full bg-accent hover:bg-accent/90" onClick={handleAutofill} disabled={!imagePreview || isAiLoading}>
                    <Sparkles className={`mr-2 h-4 w-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                    {isAiLoading ? 'Analyzing...' : 'Autofill with AI'}
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product Title</FormLabel>
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
                        <FormLabel>Product Description</FormLabel>
                        <FormControl><Textarea rows={5} placeholder="Describe your item, its condition, and any special features." {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="grid grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>{isLoading ? "Listing Item..." : "List Item"}</Button>
            </div>
        </form>
      </Form>
    </div>
  );
}

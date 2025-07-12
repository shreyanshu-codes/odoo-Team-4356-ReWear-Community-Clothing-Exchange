
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sparkles } from 'lucide-react';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageType: z.enum(['url', 'upload']),
  imageUrl: z.string().optional(),
  imageFile: z.any().optional(),
  category: z.enum(['Tops', 'Dresses', 'Pants', 'Jackets', 'Accessories']),
  type: z.enum(['Casual', 'Formal', 'Sport']),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL']),
  condition: z.enum(['New', 'Gently Used', 'Used']),
  tags: z.string().min(1, "Please add at least one tag."),
}).refine(data => {
    if (data.imageType === 'url') {
        return !!data.imageUrl && z.string().url().safeParse(data.imageUrl).success;
    }
    return true;
}, {
    message: "A valid image URL is required.",
    path: ["imageUrl"],
}).refine(data => {
    if (data.imageType === 'upload') {
        return data.imageFile?.length == 1;
    }
    return true;
}, {
    message: "Image is required.",
    path: ["imageFile"],
}).refine(data => {
    if (data.imageType === 'upload' && data.imageFile?.[0]) {
        return data.imageFile?.[0]?.size <= MAX_FILE_SIZE;
    }
    return true;
}, {
    message: `Max file size is 5MB.`,
    path: ["imageFile"],
}).refine(data => {
    if (data.imageType === 'upload' && data.imageFile?.[0]) {
        return ACCEPTED_IMAGE_TYPES.includes(data.imageFile?.[0]?.type);
    }
    return true;
}, {
    message: ".jpg, .jpeg, .png and .webp files are accepted.",
    path: ["imageFile"],
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
      imageType: 'url',
      imageUrl: "",
      imageFile: undefined,
    },
  });

  const imageType = form.watch("imageType");

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("imageFile", e.target.files);
    } else {
      setImagePreview(null);
      form.setValue("imageFile", undefined);
    }
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (z.string().url().safeParse(url).success) {
        setImagePreview(url);
    } else {
        setImagePreview(null);
    }
    form.setValue("imageUrl", url);
  }

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

    const processAndAddItem = (imageUrl: string) => {
        try {
            addItem({
              ...values,
              userId: user.id,
              images: [imageUrl],
              tags: values.tags.split(',').map(tag => tag.trim()),
            });
            toast({ title: "Success!", description: "Your item has been listed for approval." });
            router.push('/dashboard/items');
          } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to list item. Please try again." });
          } finally {
            setIsLoading(false);
          }
    }

    if (values.imageType === 'url' && values.imageUrl) {
        processAndAddItem(values.imageUrl);
    } else if (values.imageType === 'upload' && values.imageFile?.[0]) {
        const file = values.imageFile[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const base64Image = reader.result as string;
            processAndAddItem(base64Image);
        };
        reader.onerror = () => {
            toast({ variant: "destructive", title: "Error", description: "Could not read the image file."});
            setIsLoading(false);
        }
    } else {
        toast({ variant: "destructive", title: "Image Error", description: "Please provide a valid image URL or upload a file."});
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
                name="imageType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Image Source</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setImagePreview(null);
                          form.setValue('imageUrl', '');
                          form.setValue('imageFile', undefined);
                        }}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="url" /></FormControl>
                          <FormLabel className="font-normal">From URL</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="upload" /></FormControl>
                          <FormLabel className="font-normal">Upload from Device</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {imageType === 'url' ? (
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ""} onChange={handleImageUrlChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image File</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageFileChange} />
                      </FormControl>
                      <FormDescription>Upload a clear photo of your item (PNG, JPG, WEBP, max 5MB).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

             <div className="flex items-end gap-4">
                {imagePreview && <img src={imagePreview} alt="Image Preview" className="w-32 h-32 object-cover rounded-md" />}
                <Button type="button" variant="outline" onClick={handleAutofill} disabled={!imagePreview || isAiLoading}>
                  <Sparkles className={`mr-2 h-4 w-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                  {isAiLoading ? 'Analyzing...' : 'Autofill with AI'}
                </Button>
            </div>

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
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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

    

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  uploadType: z.enum(['local', 'url']),
  imageFile: z.any().optional(),
  imageUrl: z.string().optional(),
  category: z.enum(['Tops', 'Dresses', 'Pants', 'Jackets', 'Accessories']),
  type: z.enum(['Casual', 'Formal', 'Sport']),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL']),
  condition: z.enum(['New', 'Gently Used', 'Used']),
  tags: z.string().min(1, "Please add at least one tag."),
}).refine(data => {
    if (data.uploadType === 'local') {
        return data.imageFile?.length === 1;
    }
    return true;
}, {
    message: "Image is required.",
    path: ['imageFile'],
}).refine(data => {
    if (data.uploadType === 'local' && data.imageFile?.[0]) {
        return data.imageFile[0].size <= MAX_FILE_SIZE;
    }
    return true;
}, {
    message: `Max file size is 5MB.`,
    path: ['imageFile'],
}).refine(data => {
    if (data.uploadType === 'local' && data.imageFile?.[0]) {
        return ACCEPTED_IMAGE_TYPES.includes(data.imageFile[0].type);
    }
    return true;
}, {
    message: ".jpg, .jpeg, .png and .webp files are accepted.",
    path: ['imageFile'],
}).refine(data => {
    if (data.uploadType === 'url') {
        return z.string().url().safeParse(data.imageUrl).success;
    }
    return true;
}, {
    message: "Please enter a valid URL.",
    path: ['imageUrl'],
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
      uploadType: 'local',
      imageFile: undefined,
      imageUrl: "",
    },
  });
  
  const fileRef = form.register("imageFile");
  const uploadType = form.watch('uploadType');

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

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (z.string().url().safeParse(url).success) {
      setImagePreview(url);
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

    const processSubmit = (imageBase64: string) => {
        try {
            addItem({
                ...values,
                userId: user.id,
                images: [imageBase64],
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

    if (values.uploadType === 'local' && values.imageFile?.[0]) {
        const file = values.imageFile[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            processSubmit(reader.result as string);
        };
        reader.onerror = () => {
            toast({ variant: "destructive", title: "Error", description: "Could not read the image file."});
            setIsLoading(false);
        }
    } else if (values.uploadType === 'url' && values.imageUrl) {
        processSubmit(values.imageUrl);
    } else {
        toast({ variant: "destructive", title: "Image Error", description: "Please provide a valid image."});
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>List a New Item</CardTitle>
        <CardDescription>Fill out the details below to add a new item to the swap marketplace.</CardDescription>
      </CardHeader>
      <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <Card className="p-6">
                    <FormField
                      control={form.control}
                      name="uploadType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Image Source</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                field.onChange(value);
                                setImagePreview(null);
                                form.setValue('imageFile', undefined, { shouldValidate: true });
                                form.setValue('imageUrl', '', { shouldValidate: true });
                              }}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="local" id="local" />
                                </FormControl>
                                <Label htmlFor="local">Upload</Label>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="url" id="url" />
                                </FormControl>
                                <Label htmlFor="url">URL</Label>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {uploadType === 'local' ? (
                      <FormField
                        control={form.control}
                        name="imageFile"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Add Image</FormLabel>
                            <FormControl>
                              <div className="relative w-full h-64 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-muted-foreground hover:border-primary transition-colors bg-background">
                                  {imagePreview ? (
                                      <Image src={imagePreview} alt="Image Preview" fill className="object-cover rounded-lg" />
                                  ) : (
                                      <>
                                          <UploadCloud className="h-12 w-12" />
                                          <p className="mt-2 text-center text-sm">Click to browse or drag & drop</p>
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
                    ) : (
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem  className="mt-4">
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/image.png" {...field} onChange={(e) => {
                                    field.onChange(e);
                                    handleImageUrlChange(e);
                                }} value={field.value ?? ''} />
                              </FormControl>
                              {imagePreview && <div className="relative w-full h-64 mt-2 border rounded-lg"><Image src={imagePreview} alt="Image Preview" fill className="object-cover rounded-lg" data-ai-hint="fashion clothing" /></div>}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    )}
                </Card>

                <Button type="button" variant="outline" className="w-full" onClick={handleAutofill} disabled={!imagePreview || isAiLoading}>
                <Sparkles className={`mr-2 h-4 w-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                {isAiLoading ? 'Analyzing Image...' : 'Autofill details with AI'}
                </Button>
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
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Listing Item..." : "List Item"}</Button>
            </div>
        </form>
      </Form>
      </CardContent>
    </Card>
  );
}

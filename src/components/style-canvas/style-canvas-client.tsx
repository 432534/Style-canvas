
"use client";

import { useState, type DragEvent } from 'react';
import { RotateCcw, Save, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
type ClothingType = 'top' | 'bottom' | 'shoes' | 'accessory';
type ClothingItem = {
  id: number;
  name: string;
  imageUrl: string;
  type: ClothingType;
  hint: string;
};
type CartItem = ClothingItem & { cartId: number };


// Data
const wardrobe: ClothingItem[] = [
  { id: 1, name: 'Belt', imageUrl: '/images/accessories/belt.jpg', type: 'accessory', hint: 'belt' },
  { id: 2, name: 'Belt', imageUrl: '/images/accessories/belt2.webp', type: 'accessory', hint: 'belt2' },
  { id: 3, name: 'Cap', imageUrl: '/images/accessories/cap.png', type: 'accessory', hint: 'cap' },
  { id: 4, name: 'Hat', imageUrl: '/images/accessories/hat.png', type: 'accessory', hint: 'hat' },
  { id: 5, name: 'Sunglasses', imageUrl: '/images/accessories/sunglasses.jpg', type: 'accessory', hint: 'sunglasses' },
  { id: 6, name: 'Bottom', imageUrl: '/images/bottoms/bottom1.webp', type: 'bottom', hint: 'bottom' },
  { id: 7, name: 'Bottom2', imageUrl: '/images/bottoms/bottom2.webp', type: 'bottom', hint: 'bottom1' },
  { id: 8, name: 'Bottom3', imageUrl: '/images/bottoms/bottom3.jpg', type: 'bottom', hint: 'bottom2' },
  { id: 9, name: 'Bottom4', imageUrl: '/images/bottoms/bottom4.png', type: 'bottom', hint: 'bottom3' },
  { id: 10, name: 'Bottom5', imageUrl: '/images/bottoms/bottom5.png', type: 'bottom', hint: 'bottom4' },
  { id: 11, name: 'Shoes1', imageUrl: '/images/shoes/shoes1.webp', type: 'shoes', hint: 'shoes' },
  { id: 12, name: 'Shoes2', imageUrl: '/images/shoes/shoes2.webp', type: 'shoes', hint: 'shoes1' },
  { id: 13, name: 'Shoes3', imageUrl: '/images/shoes/shoes3.jpg', type: 'shoes', hint: 'shoes2' },
  { id: 14, name: 'Shoes4', imageUrl: '/images/shoes/shoes4.jpg', type: 'shoes', hint: 'shoes3' },
  { id: 15, name: 'Shoes5', imageUrl: '/images/shoes/shoes5.png', type: 'shoes', hint: 'shoes4' },
  { id: 16, name: 'Top1', imageUrl: '/images/tops/top1.webp', type: 'top', hint: 'top' },
  { id: 17, name: 'Top2', imageUrl: '/images/tops/top2.jpg', type: 'top', hint: 'top1' },
  { id: 18, name: 'Top3', imageUrl: '/images/tops/top3.jpg', type: 'top', hint: 'top2' },
  { id: 19, name: 'Top4', imageUrl: '/images/tops/top4.png', type: 'top', hint: 'top3' },
  { id: 20, name: 'Top5', imageUrl: '/images/tops/top5.png', type: 'top', hint: 'top4' },
];

export default function StyleCanvasClient() {
  const [outfitPreview, setOutfitPreview] = useState<ClothingItem[]>([]);
  const [outfitCollection, setOutfitCollection] = useState<ClothingItem[][]>([]);
  const [cartItems, updateCart] = useState<CartItem[]>([]);
  const [highlightDrop, setHighlightDrop] = useState(false);
  const { toast } = useToast();

  const onDragStart = (e: DragEvent<HTMLDivElement>, item: ClothingItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id }));
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlightDrop(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlightDrop(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlightDrop(false);
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    const droppedItem = wardrobe.find(piece => piece.id === data.id);
    if (droppedItem) {
      setOutfitPreview(prev => [...prev, droppedItem]);
    }
  };

  const clearCanvas = () => {
    setOutfitPreview([]);
    toast({
      title: 'Canvas Cleared',
      description: 'Start fresh with a new look.',
    });
  };

  const saveOutfit = () => {
    if (!outfitPreview.length) {
      toast({
        variant: 'destructive',
        title: 'Empty Canvas',
        description: 'You need to add items before saving!',
      });
      return;
    }

    setOutfitCollection(prev => [[...outfitPreview], ...prev]);
    toast({
      title: 'Outfit Saved!',
      description: 'Added to your personal wardrobe collection.',
    });
  };

  const pushToCart = () => {
    if (!outfitPreview.length) {
      toast({
        variant: 'destructive',
        title: 'Nothing to Add',
        description: 'Add some items to your canvas first.',
      });
      return;
    }
    const itemsToAdd: CartItem[] = outfitPreview.map(item => ({...item, cartId: Date.now() + Math.random()}));
    updateCart(prev => [...prev, ...itemsToAdd]);
    toast({
      title: 'Added to Cart!',
      description: 'Your outfit items are now in the cart.',
    });
  };

  const removeFromCanvas = (index: number) => {
    setOutfitPreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeFromCart = (cartId: number) => {
    updateCart(prev => prev.filter((item) => item.cartId !== cartId));
  };
  
  const loadOutfit = (outfit: ClothingItem[]) => {
    setOutfitPreview(outfit);
    toast({
        title: 'Outfit Loaded',
        description: 'The saved outfit has been loaded onto the canvas.'
    });
  };

  return (
    <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <div className="text-left">
          <h1 className="font-headline text-4xl font-bold tracking-tight lg:text-5xl">StyleCanvas</h1>
          <p className="text-muted-foreground mt-2">Drag, drop, and design your perfect look.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart />
              {cartItems.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Your Shopping Cart</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cartId} className="flex items-center justify-between gap-4 p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="bg-card p-2 rounded-md">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-cover rounded-md"
                          data-ai-hint={item.hint}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.cartId)}>
                      <Trash2 className="w-4 h-4 text-destructive"/>
                    </Button>
                  </div>
                ))
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="mt-6">
                <Button className="w-full">Proceed to Checkout</Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Clothing options */}
        <aside className="lg:col-span-1">
          <Card className="shadow-lg sticky top-8">
            <CardHeader>
              <CardTitle>Clothing Items</CardTitle>
              <CardDescription>Pick your pieces and drag them in.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                  {wardrobe.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className="p-4 border rounded-lg flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:scale-105 bg-card"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="object-cover rounded-md"
                        data-ai-hint={item.hint}
                      />
                      <span className="text-sm text-center font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        <section className="lg:col-span-2 space-y-8">
          <Card
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
            className={cn(
              "shadow-lg transition-all",
              highlightDrop ? "border-primary border-2 border-dashed bg-accent/10" : "border-transparent"
            )}
          >
            <CardHeader>
              <CardTitle>Your Outfit Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] bg-muted/50 rounded-lg p-4 flex flex-col gap-4 items-center">
                {outfitPreview.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-muted-foreground">
                    <p className="text-lg">Drop items here</p>
                  </div>
                ) : (
                  outfitPreview.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="relative group p-2 border rounded-lg flex items-center justify-center bg-card shadow-sm animate-in fade-in zoom-in-95"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="object-cover rounded-md"
                        data-ai-hint={item.hint}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={() => removeFromCanvas(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                <Button onClick={clearCanvas} variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
                <Button onClick={saveOutfit} variant="outline"><Save className="mr-2 h-4 w-4" /> Save</Button>
                <Button onClick={pushToCart}><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</Button>
              </div>
            </CardContent>
          </Card>

          {outfitCollection.length > 0 && (
            <Card className="shadow-lg animate-in fade-in">
              <CardHeader>
                <CardTitle>Saved Outfits</CardTitle>
                <CardDescription>What you’ve built so far.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {outfitCollection.map((combo, idx) => (
                  <Card key={idx} className="p-4 bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => loadOutfit(combo)}>
                    <p className="font-semibold mb-2 text-foreground">Outfit {outfitCollection.length - idx}</p>
                    <div className="flex flex-wrap gap-4">
                      {combo.map((item, itemIdx) => (
                        <div key={`${item.id}-${itemIdx}`} className="p-2 border rounded-md flex flex-col items-center gap-2 bg-card shadow-sm" title={item.name}>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="object-cover rounded-md"
                            data-ai-hint={item.hint}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}

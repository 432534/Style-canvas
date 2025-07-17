"use client";

import { useState, type DragEvent, useRef, type MouseEvent, useEffect } from 'react';
import { RotateCcw, Save, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type ClothingType = 'top' | 'bottom' | 'shoes' | 'accessory';
type ClothingItem = {
  id: number;
  name: string;
  imageUrl: string;
  type: ClothingType;
  hint: string;
};
type CanvasItem = ClothingItem & { 
  instanceId: number;
  x: number;
  y: number;
};
type CartItem = ClothingItem & { quantity: number; };

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

const MIN_CANVAS_HEIGHT = 400;
const ITEM_WIDTH = 116; 
const ITEM_HEIGHT = 116; 

export default function StyleCanvasClient() {
  const [outfitPreview, setOutfitPreview] = useState<CanvasItem[]>([]);
  const [outfitCollection, setOutfitCollection] = useState<CanvasItem[][]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [highlightDrop, setHighlightDrop] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(MIN_CANVAS_HEIGHT);
  const { toast } = useToast();
  
  const dragItem = useRef<CanvasItem | null>(null);
  const dragItemOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateHeight = () => {
      if (outfitPreview.length === 0) {
        setCanvasHeight(MIN_CANVAS_HEIGHT);
        return;
      }
      const maxY = Math.max(...outfitPreview.map(item => item.y));
      const requiredHeight = maxY + ITEM_HEIGHT;
      setCanvasHeight(Math.max(MIN_CANVAS_HEIGHT, requiredHeight));
    };
    calculateHeight();
  }, [outfitPreview]);

  const onDragStartWardrobe = (e: DragEvent<HTMLDivElement>, item: ClothingItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'wardrobe', id: item.id }));
    dragItem.current = null;
  };

  const onDragStartCanvasItem = (e: DragEvent<HTMLDivElement>, item: CanvasItem) => {
    dragItem.current = item;
    const rect = e.currentTarget.getBoundingClientRect();
    dragItemOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlightDrop(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlightDrop(false);
  };
  
  const isOverlapping = (x: number, y: number, currentItemId: number, items: CanvasItem[]) => {
    for (const item of items) {
      if (item.instanceId === currentItemId) continue;
      if (
        x < item.x + ITEM_WIDTH &&
        x + ITEM_WIDTH > item.x &&
        y < item.y + ITEM_HEIGHT &&
        y + ITEM_HEIGHT > item.y
      ) {
        return true;
      }
    }
    return false;
  };
  
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlightDrop(false);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const currentDragItem = dragItem.current;
    if (currentDragItem) {
        let newX = e.clientX - canvasRect.left - dragItemOffset.current.x;
        let newY = e.clientY - canvasRect.top - dragItemOffset.current.y;
        newX = Math.max(0, Math.min(newX, canvasRect.width - ITEM_WIDTH));
        newY = Math.max(0, Math.min(newY, canvasHeight - ITEM_HEIGHT));

        if (!isOverlapping(newX, newY, currentDragItem.instanceId, outfitPreview)) {
          setOutfitPreview(prev =>
              prev.map(item =>
                  item.instanceId === currentDragItem.instanceId
                      ? { ...item, x: newX, y: newY }
                      : item
              )
          );
        } else {
            toast({
                variant: 'destructive',
                title: 'Overlapping Items',
                description: 'Please drop the item in an empty space.',
            });
        }
        dragItem.current = null;
        return;
    }
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
if (data.type === 'wardrobe') {
    const itemFromWardrobe = wardrobe.find(p => p.id === data.id); 

    if (itemFromWardrobe) {
        let xPos = e.clientX - canvasRect.left - (ITEM_WIDTH / 2);
        let yPos = e.clientY - canvasRect.top - (ITEM_HEIGHT / 2);
        xPos = Math.max(0, Math.min(xPos, canvasRect.width - ITEM_WIDTH));
        yPos = Math.max(0, Math.min(yPos, canvasHeight - ITEM_HEIGHT));
        let checkX = xPos;
        let checkY = yPos;

        let tries = 0;
        const maxTries = (canvasRect.width / ITEM_WIDTH) * 10;
        while (isOverlapping(checkX, checkY, -1, outfitPreview) && tries < maxTries) {
            checkY += ITEM_HEIGHT;
            if (checkY + ITEM_HEIGHT > canvasHeight) {
                checkY = 0;
                checkX += ITEM_WIDTH;
            }
            if (checkX + ITEM_WIDTH > canvasRect.width) {
                checkX = 0;
            }

            tries++;
        }
        if (tries >= maxTries) {
            toast({
                variant: 'destructive',
                title: 'Canvas is full',
                description: 'Could not find a space for the item.', 
            });
            return;
        }
        const itemToAdd: CanvasItem = {
            ...itemFromWardrobe,
            instanceId: Date.now(),
            x: checkX,
            y: checkY
        };
        setOutfitPreview(prevItems => [...prevItems, itemToAdd]);
    }
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
    
    setCartItems(prevCart => {
      const updatedCart = [...prevCart];
      outfitPreview.forEach(canvasItem => {
        const existingItemIndex = updatedCart.findIndex(cartItem => cartItem.id === canvasItem.id);
        if (existingItemIndex > -1) {
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + 1,
          };
        } else {
          const {instanceId, x, y, ...item} = canvasItem;
          updatedCart.push({ ...item, quantity: 1 });
        }
      });
      return updatedCart;
    });

    toast({
      title: 'Added to Cart!',
      description: 'Your outfit items are now in the cart.',
    });
  };

  const removeFromCanvas = (e: MouseEvent<HTMLButtonElement>, instanceId: number) => {
    e.stopPropagation();
    setOutfitPreview(prev => prev.filter((item) => item.instanceId !== instanceId));
  };
  
  const removeFromCart = (itemId: number) => {
    setCartItems(prev => {
        const itemInCart = prev.find(item => item.id === itemId);
        if (itemInCart && itemInCart.quantity > 1) {
            return prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item);
        } else {
            return prev.filter(item => item.id !== itemId);
        }
    });
  };

  const loadOutfit = (outfit: CanvasItem[]) => {
    setOutfitPreview(outfit);
    toast({
        title: 'Outfit Loaded',
        description: 'The saved outfit has been loaded onto the canvas.'
    });
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

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
              {totalCartItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center">
                  {totalCartItems}
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
                  <div key={item.id} className="flex items-center justify-between gap-4 p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="bg-card p-2 rounded-md overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-contain rounded-md"
                          data-ai-hint={item.hint}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground">Quantity: {item.quantity}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
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
                      onDragStart={(e) => onDragStartWardrobe(e, item)}
                      className="p-4 border rounded-lg flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:scale-105 bg-card"
                    >
                      <div className="w-[100px] h-[100px] rounded-md overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="object-contain w-full h-full"
                          data-ai-hint={item.hint}
                        />
                      </div>
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
            className={cn(
              "shadow-lg transition-all",
              highlightDrop ? "border-primary border-2 border-dashed bg-accent/10" : "border-transparent"
            )}
          >
            <CardHeader>
              <CardTitle>Your Outfit Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={canvasRef}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragLeave={onDragLeave}
                className="relative bg-muted/50 rounded-lg p-4"
                style={{ height: `${canvasHeight}px` }}
              >
                {outfitPreview.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-muted-foreground pointer-events-none">
                    <p className="text-lg">Drop items here</p>
                  </div>
                ) : (
                  outfitPreview.map((item) => (
                    <div
                      key={item.instanceId}
                      draggable
                      onDragStart={(e) => onDragStartCanvasItem(e, item)}
                      className="absolute group p-2 border rounded-lg flex items-center justify-center bg-card shadow-sm animate-in fade-in zoom-in-95 cursor-grab active:cursor-grabbing"
                      style={{ left: `${item.x}px`, top: `${item.y}px`, width: `${ITEM_WIDTH}px`, height: `${ITEM_HEIGHT}px` }}
                    >
                      <div className="w-[100px] h-[100px] rounded-md overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="object-contain w-full h-full pointer-events-none"
                          data-ai-hint={item.hint}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-3 -right-3 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10"
                        onClick={(e) => removeFromCanvas(e, item.instanceId)}
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
                        <div key={`${item.id}-${itemIdx}`} className="p-2 border rounded-md flex flex-col items-center gap-2 bg-card shadow-sm overflow-hidden" title={item.name}>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="object-contain rounded-md"
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

"use client";

import { useState, type DragEvent } from 'react';
import { RotateCcw, Save, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

type ClothingType = 'top' | 'bottom' | 'shoes' | 'accessory';

type ClothingItem = {
  id: number;
  name: string;
  imageUrl: string;
  type: ClothingType;
  hint: string;
};

const clothesSeed: ClothingItem[] = [
  { id: 1, name: 'Classic T-Shirt', imageUrl: '/images/accessories/hat.png', type: 'top', hint: 'tshirt' },
  { id: 2, name: 'Slim-fit Jeans', imageUrl: '/images/shoes/shoes1.webp', type: 'bottom', hint: 'jeans' },
  { id: 3, name: 'Denim Jacket', imageUrl: '/images/shoes/shoes2.webp', type: 'top', hint: 'jacket' },
  { id: 4, name: 'White Sneakers', imageUrl: '/images/tops/top1.webp', type: 'shoes', hint: 'sneakers' },
  { id: 5, name: 'Aviator Sunglasses', imageUrl: '/images/tops/top3.jpg', type: 'accessory', hint: 'sunglasses' },
  { id: 6, name: 'Chronograph Watch', imageUrl: '/images/bottoms/bottom4.png', type: 'accessory', hint: 'watch' },
];

export default function StyleCanvasClient() {
  const [currentItems, setCurrentItems] = useState<ClothingItem[]>([]);
  const [outfitsArchive, setOutfitsArchive] = useState<ClothingItem[][]>([]);
  const [dragHover, setDragHover] = useState(false);
  const { toast } = useToast();

  const startDrag = (e: DragEvent<HTMLDivElement>, piece: ClothingItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: piece.id }));
  };

  const onDragHover = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragHover(true);
  };

  const onDragExit = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragHover(false);
  };

  const onDropItem = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragHover(false);
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    const found = clothesSeed.find(c => c.id === data.id);
    if (found) {
      setCurrentItems(prev => [...prev, found]);
    }
  };

  const clearCanvas = () => {
    setCurrentItems([]);
    toast({
      title: 'Canvas Cleared',
      description: 'Starting fresh again!',
    });
  };

  const storeOutfit = () => {
    if (!currentItems.length) {
      toast({
        variant: 'destructive',
        title: 'Empty Outfit',
        description: 'Nothing to save yet.',
      });
      return;
    }
    setOutfitsArchive(prev => [currentItems, ...prev]);
    setCurrentItems([]);
    toast({
      title: 'Outfit Saved!',
      description: 'You can revisit it anytime.',
    });
  };

  const pushToCart = () => {
    if (!currentItems.length) {
      toast({
        variant: 'destructive',
        title: 'Empty Outfit',
        description: 'Add some pieces first.',
      });
      return;
    }
    toast({
      title: 'Added to Cart!',
      description: 'Your look is ready to shop.',
    });
  };

  const removeItem = (idx: number) => {
    setCurrentItems(items => items.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen w-full bg-background p-5 sm:p-7 lg:p-10">
      <header className="text-center mb-10">
        <h1 className="font-headline text-4xl font-bold tracking-tight lg:text-5xl">StyleCanvas</h1>
        <p className="text-muted-foreground mt-2">Create your vibe. Drop and match your favorites.</p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <aside className="lg:col-span-1">
          <Card className="shadow-md sticky top-10">
            <CardHeader>
              <CardTitle>Wardrobe</CardTitle>
              <CardDescription>Drag your picks onto the canvas.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {clothesSeed.map(piece => (
                <div
                  key={piece.id}
                  draggable
                  onDragStart={(e) => startDrag(e, piece)}
                  className="p-3 border rounded-md flex flex-col items-center gap-1.5 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm hover:scale-105 bg-card"
                >
                  <Image
                    src={piece.imageUrl}
                    alt={piece.name}
                    width={90}
                    height={90}
                    className="object-cover rounded"
                    data-ai-hint={piece.hint}
                  />
                  <span className="text-xs text-center font-medium">{piece.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-span-2 space-y-8">
          <Card
            onDragOver={onDragHover}
            onDrop={onDropItem}
            onDragLeave={onDragExit}
            className={cn(
              "shadow-md transition-all",
              dragHover ? "border-primary border-2 border-dashed bg-accent/20" : "border-transparent"
            )}
          >
            <CardHeader>
              <CardTitle>Outfit Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[320px] bg-muted/40 rounded p-4 flex flex-col gap-4 items-center">
                {currentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-muted-foreground">
                    <p className="text-base">Drop pieces here</p>
                  </div>
                ) : (
                  currentItems.map((item, idx) => (
                    <div key={idx} className="relative group p-3 border rounded flex items-center justify-center gap-3 bg-card shadow-sm w-full max-w-md">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="object-cover rounded"
                        data-ai-hint={item.hint}
                      />
                      <span className="text-sm flex-grow font-medium">{item.name}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive"/>
                      </Button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-5 justify-center">
                <Button onClick={clearCanvas} variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
                <Button onClick={storeOutfit} variant="outline"><Save className="mr-2 h-4 w-4" /> Save</Button>
                <Button onClick={pushToCart}><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</Button>
              </div>
            </CardContent>
          </Card>

          {outfitsArchive.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Saved Looks</CardTitle>
                <CardDescription>Your previously styled outfits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {outfitsArchive.map((outfit, idx) => (
                  <Card key={idx} className="p-4 bg-muted/30">
                    <p className="font-semibold mb-2">Outfit {outfitsArchive.length - idx}</p>
                    <div className="flex flex-wrap gap-3">
                      {outfit.map((item, innerIdx) => (
                        <div key={innerIdx} className="p-2 border rounded flex flex-col items-center bg-card shadow-sm">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={36}
                            height={36}
                            className="object-cover rounded"
                            data-ai-hint={item.hint}
                          />
                          <span className="text-xs text-center">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

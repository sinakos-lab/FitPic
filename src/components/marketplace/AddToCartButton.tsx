"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

type ArtPiece = {
  id: string;
    title: string;
      price_cents: number;
        image_url: string;
        };

        export function AddToCartButton({ art }: { art: ArtPiece }) {
          const { addItem } = useCart();
            const [isAdded, setIsAdded] = useState(false);

              const handleAdd = () => {
                  addItem({
                        id: art.id,
                              title: art.title,
                                    price_cents: art.price_cents,
                                          image_url: art.image_url,
                                              });
                                                  
                                                      setIsAdded(true);
                                                          setTimeout(() => setIsAdded(false), 2000);
                                                            };

                                                              return (
                                                                  <Button 
                                                                        onClick={handleAdd} 
                                                                              className="w-full" 
                                                                                    size="lg"
                                                                                          variant={isAdded ? "secondary" : "default"}
                                                                                              >
                                                                                                    {isAdded ? (
                                                                                                            <>
                                                                                                                      <Check className="mr-2 h-5 w-5" />
                                                                                                                                Added to Cart
                                                                                                                                        </>
                                                                                                                                              ) : (
                                                                                                                                                      <>
                                                                                                                                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                                                                                                                                          Add to Cart
                                                                                                                                                                                  </>
                                                                                                                                                                                        )}
                                                                                                                                                                                            </Button>
                                                                                                                                                                                              );
                                                                                                                                                                                              }
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AddToCartButton } from "@/components/marketplace/AddToCartButton";

export default async function ArtPiecePage({
  params,
  }: {
    params: Promise<{ id: string }>;
    }) {
      const { id } = await params;
        const supabase = await createClient();

          const { data: art } = await supabase
              .from("art_pieces")
                  .select("*")
                      .eq("id", id)
                          .eq("is_published", true)
                              .single();

                                if (!art) {
                                    notFound();
                                      }

                                        return (
                                            <div className="space-y-6">
                                                  <Link 
                                                          href="/marketplace" 
                                                                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                                                                        >
                                                                                <ChevronLeft className="mr-1 h-4 w-4" />
                                                                                        Back to Marketplace
                                                                                              </Link>

                                                                                                    <div className="grid gap-8 lg:grid-cols-2">
                                                                                                            {/* Art Image */}
                                                                                                                    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                                                                                                                              <Image
                                                                                                                                          src={art.image_url}
                                                                                                                                                      alt={art.title}
                                                                                                                                                                  fill
                                                                                                                                                                              className="object-cover"
                                                                                                                                                                                          priority
                                                                                                                                                                                                    />
                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                    {/* Art Details */}
                                                                                                                                                                                                                            <div className="flex flex-col space-y-6">
                                                                                                                                                                                                                                      <div>
                                                                                                                                                                                                                                                  <h1 className="text-3xl font-bold tracking-tight">{art.title}</h1>
                                                                                                                                                                                                                                                              <p className="mt-2 text-lg text-muted-foreground">By {art.artist_name}</p>
                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                  <div className="flex items-center gap-4">
                                                                                                                                                                                                                                                                                              <span className="text-2xl font-semibold">
                                                                                                                                                                                                                                                                                                            ${(art.price_cents / 100).toFixed(2)}
                                                                                                                                                                                                                                                                                                                        </span>
                                                                                                                                                                                                                                                                                                                                    <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium capitalize text-secondary-foreground">
                                                                                                                                                                                                                                                                                                                                                  {art.category}
                                                                                                                                                                                                                                                                                                                                                              </span>
                                                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                                                  <p className="text-base leading-relaxed text-muted-foreground">
                                                                                                                                                                                                                                                                                                                                                                                              {art.description}
                                                                                                                                                                                                                                                                                                                                                                                                        </p>

                                                                                                                                                                                                                                                                                                                                                                                                                  <div className="border-t border-border pt-6">
                                                                                                                                                                                                                                                                                                                                                                                                                              <AddToCartButton art={art} />
                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
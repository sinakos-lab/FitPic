"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadFrame(formData: FormData) {
  const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

        // Verify admin
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single<{ role: string }>();
            if (profile?.role !== "admin") return { success: false, error: "Not authorized" };

              const file = formData.get("image") as File;
                if (!file || file.size === 0) return { success: false, error: "No image provided" };

                  // 1. Upload image to Storage (using the art-images bucket we created)
                    const fileExt = file.name.split(".").pop();
                      const fileName = `frames/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                        
                          const { error: uploadError } = await supabase.storage
                              .from("art-images")
                                  .upload(fileName, file, { upsert: false });

                                    if (uploadError) return { success: false, error: uploadError.message };

                                      const { data: { publicUrl } } = supabase.storage.from("art-images").getPublicUrl(fileName);

                                        // 2. Insert into database
                                          const width = parseInt(formData.get("width_px") as string);
                                            const height = parseInt(formData.get("height_px") as string);

                                              // Calculate a safe inner opening (e.g., 10% inset on all sides)
                                                const inner_x = Math.round(width * 0.1);
                                                  const inner_y = Math.round(height * 0.1);
                                                    const inner_width = Math.round(width * 0.8);
                                                      const inner_height = Math.round(height * 0.8);

                                                        const { error: dbError } = await supabase.from("frames").insert<any>({})
                                                            name: formData.get("name") as string,
                                                                style: formData.get("style") as string,
                                                                    color: formData.get("color") as string,
                                                                        difficulty: formData.get("difficulty") as string,
                                                                            width_px: width,
                                                                                height_px: height,
                                                                                    aspect_ratio: width / height,
                                                                                        image_url: publicUrl,
                                                                                            thumbnail_url: publicUrl,
                                                                                                inner_x, inner_y, inner_width, inner_height,
                                                                                                    is_active: true,
                                                                                                        created_by: user.id
                                                                                                          });

                                                                                                            if (dbError) return { success: false, error: dbError.message };

                                                                                                              revalidatePath("/studio");
                                                                                                                revalidatePath("/admin");
                                                                                                                  return { success: true };
                                                                                                                  }
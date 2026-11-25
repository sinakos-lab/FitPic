import Link from "next/link";
import { Button } from "@/components/ui/button";
import { continueAsGuest } from "@/lib/actions/auth";

export default function Home() {
  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                    FitPic
                          </h1>
                                <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                                        Upload your photos, fit them into beautiful digital frames, and find the perfect fit.
                                              </p>
                                                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                                            <Link href="/register">
                                                                      <Button size="lg" className="w-full sm:w-auto">Create Account</Button>
                                                                              </Link>
                                                                                      <Link href="/login">
                                                                                                <Button size="lg" variant="outline" className="w-full sm:w-auto">Log In</Button>
                                                                                                        </Link>
                                                                                                                
                                                                                                                        {/* The Guest Button */}
                                                                                                                                <form action={continueAsGuest}>
                                                                                                                                          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                                                                                                                                                      Continue as Guest
                                                                                                                                                                </Button>
                                                                                                                                                                        </form>
                                                                                                                                                                              </div>
                                                                                                                                                                                  </div>
                                                                                                                                                                                    );
                                                                                                                                                                                    }
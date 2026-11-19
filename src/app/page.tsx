import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        FitPic
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Upload your photos, fit them into beautiful digital frames, and find the perfect fit.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/register">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="outline">Log In</Button>
        </Link>
      </div>
    </div>
  );
}
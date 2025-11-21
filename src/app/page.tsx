"use client"

import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay"

export default function Home() {
  const heroImages = PlaceHolderImages.filter((img) => img.id.startsWith('hero-'));

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Carousel
          opts={{
            loop: true,
            align: 'start',
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          className="h-full w-full"
        >
          <CarouselContent className="-ml-0 h-full">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="relative h-full basis-full pl-0 md:basis-1/2 lg:basis-1/3">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover opacity-30"
                  data-ai-hint={image.imageHint}
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />


      <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
        <div className="mb-4 flex items-center gap-3 rounded-full bg-primary/20 px-4 py-2 text-primary [text-shadow:0_0_8px_hsl(var(--primary))]">
          <BrainCircuit className="h-6 w-6" />
          <span className="font-headline text-lg">SME DataBrain</span>
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          Your AI-Powered Business Co-Pilot
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/80">
          Transform documents, visualize performance, and get instant insights with the power of generative AI. Make smarter decisions, faster.
        </p>
        <Link href="/register" className="mt-8">
          <Button size="lg" className="group bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 transform hover:scale-105">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <>
    {/* // <Link href="/" className={cn('flex items-center gap-2', className)}> */}
      <BrainCircuit className="h-7 w-7 text-primary [text-shadow:0_0_10px_hsl(var(--primary))] motion-safe:animate-pulse" />
      <span className="font-headline text-xl font-bold text-foreground">
        SME DataBrain
      </span>
    {/* // </Link> */}
    </>
  );
}

import Link from 'next/link';
import { Lock } from 'lucide-react';

export function VoteLockLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="bg-primary text-primary-foreground p-2 rounded-lg transition-transform group-hover:scale-110">
        <Lock className="w-6 h-6" />
      </div>
      <h1 className="text-3xl font-bold font-headline text-foreground transition-colors group-hover:text-primary">
        VoteLock
      </h1>
    </Link>
  );
}

import { Beat } from '@/lib/firestore-beats';
import { BeatCard } from './BeatCard';
import { Loader2 } from 'lucide-react';

interface BeatGridProps {
  beats: Beat[];
  isLoading: boolean;
  onPlay: (beat: Beat) => void;
  onBuy: (beat: Beat) => void;
  isAuthenticated: boolean;
}

export function BeatGrid({
  beats,
  isLoading,
  onPlay,
  onBuy,
  isAuthenticated,
}: BeatGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (beats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No beats found. Try adjusting your search or filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {beats.length} beat{beats.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {beats.map((beat) => (
          <BeatCard
            key={beat.id}
            beat={beat}
            onPlay={onPlay}
            onBuy={onBuy}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </>
  );
}

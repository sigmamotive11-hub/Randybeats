import { Beat } from '@/lib/firestore-beats';
import { Button } from '@/components/ui/button';
import { Music, Play, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface BeatCardProps {
  beat: Beat;
  onPlay: (beat: Beat) => void;
  onBuy: (beat: Beat) => void;
  isAuthenticated: boolean;
}

export function BeatCard({ beat, onPlay, onBuy, isAuthenticated }: BeatCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Cover Art */}
      <div className="relative w-full aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {beat.coverArt ? (
          <img
            src={beat.coverArt}
            alt={beat.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music className="w-12 h-12 text-muted-foreground" />
        )}

        {/* Overlay on hover (desktop) or always visible (mobile) */}
        {isHovering && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              onClick={() => onPlay(beat)}
            >
              <Play className="w-4 h-4" />
              Play
            </Button>
          </div>
        )}

        {/* Mobile play button - always visible */}
        <div className="md:hidden absolute inset-0 bg-black/40 flex items-center justify-center">
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            onClick={() => onPlay(beat)}
          >
            <Play className="w-4 h-4" />
            Play
          </Button>
        </div>
      </div>

      {/* Beat Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-bold text-foreground truncate">{beat.title}</h3>
          <p className="text-sm text-muted-foreground">{beat.genre}</p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="block font-semibold text-foreground">{beat.bpm}</span>
            <span>BPM</span>
          </div>
          {beat.key && (
            <div>
              <span className="block font-semibold text-foreground">{beat.key}</span>
              <span>Key</span>
            </div>
          )}
        </div>

        {/* Description */}
        {beat.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {beat.description}
          </p>
        )}

        {/* Tags */}
        {beat.tags && beat.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {beat.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {beat.tags.length > 2 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{beat.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-lg font-bold text-accent">${beat.price.toFixed(2)}</span>
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            onClick={() => onBuy(beat)}
          >
            <ShoppingCart className="w-4 h-4" />
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
}

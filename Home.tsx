import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Play, ShoppingCart, LogOut, LogIn } from "lucide-react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const GENRES = ["All", "Hip-Hop", "Trap", "R&B", "Lo-Fi", "Drill", "Afrobeats", "Electronic", "Soul"];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [beats, setBeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, [auth]);

  // Load beats from Firestore
  useEffect(() => {
    const loadBeats = async () => {
      try {
        setIsLoading(true);
        const beatsRef = collection(db, "beats");
        const q = query(beatsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const beatsData = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBeats(beatsData);
      } catch (error) {
        console.error("Error loading beats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBeats();
  }, [db]);

  // Filter beats
  const filteredBeats = beats.filter((beat) => {
    const matchesGenre = selectedGenre === "All" || beat.genre === selectedGenre;
    const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handlePlayPreview = (beat: any) => {
    if (playingId === beat.id) {
      audioRef?.pause();
      setPlayingId(null);
    } else {
      if (audioRef) audioRef.pause();
      const audio = new Audio(beat.audioUrl);
      audio.play();
      setAudioRef(audio);
      setPlayingId(beat.id);

      // Auto stop after 30 seconds
      setTimeout(() => {
        audio.pause();
        setPlayingId(null);
      }, 30000);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black border-b border-orange-600/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-white">RANDYBEATS</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-400">{user.email}</span>
                <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" className="gap-2 bg-orange-600 hover:bg-orange-700">
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-600/10 to-black border-b border-orange-600/30 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white">
              Premium <span className="text-orange-500">Beats</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              High-quality, royalty-free beats for your next project
            </p>
            <div className="flex gap-4 justify-center">
              {!user && (
                <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
                  <ShoppingCart className="w-5 h-5" />
                  Start Shopping
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-black border-b border-orange-600/30 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search beats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
            />
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre} className="text-white">
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Beats Grid */}
      <section className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading beats...</p>
            </div>
          ) : filteredBeats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No beats found. Try a different search or genre.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBeats.map((beat) => (
                <Card key={beat.id} className="bg-gray-900 border-gray-800 overflow-hidden hover:border-orange-600 transition group">
                  {/* Cover Art */}
                  <div className="relative bg-gradient-to-br from-orange-600 to-orange-900 h-48 flex items-center justify-center overflow-hidden">
                    {beat.coverArt ? (
                      <img src={beat.coverArt} alt={beat.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <Music className="w-16 h-16 text-orange-300 opacity-50" />
                    )}
                  </div>

                  {/* Beat Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{beat.title}</h3>
                    <p className="text-sm text-orange-500 mb-3">{beat.genre}</p>

                    <div className="flex gap-2 text-xs text-gray-400 mb-4">
                      <span>🎵 {beat.bpm} BPM</span>
                      {beat.key && <span>🎹 {beat.key}</span>}
                    </div>

                    {beat.description && (
                      <p className="text-sm text-gray-300 mb-4 line-clamp-2">{beat.description}</p>
                    )}

                    {/* Tags */}
                    {beat.tags && beat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {beat.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-500">${beat.price}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlayPreview(beat)}
                          className={`gap-1 ${playingId === beat.id ? "bg-orange-600 border-orange-600" : ""}`}
                        >
                          <Play className="w-4 h-4" />
                          {playingId === beat.id ? "Stop" : "Play"}
                        </Button>
                        {user ? (
                          <Button size="sm" className="gap-1 bg-orange-600 hover:bg-orange-700">
                            <ShoppingCart className="w-4 h-4" />
                            Buy
                          </Button>
                        ) : (
                          <Button size="sm" className="gap-1 bg-orange-600 hover:bg-orange-700">
                            <ShoppingCart className="w-4 h-4" />
                            Buy
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-orange-600/30 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-gray-400 text-sm">
          <p>© 2026 RANDYBEATS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Plus, Edit2, Trash2, Music, LogOut, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

const GENRES = ["Hip-Hop", "Trap", "R&B", "Lo-Fi", "Drill", "Afrobeats", "Electronic", "Soul"];
const ADMIN_UID = "IajG51UNTUOYYvPIlFm5TmdV9Sv2";
const IMGBB_API_KEY = "03082f5cb5527bff5741a6dc7fe146d1";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [beats, setBeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    bpm: "120",
    price: "29.99",
    audioUrl: "",
    coverArt: "",
    description: "",
    key: "",
  });

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

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
      } catch (err) {
        setError("Failed to load beats");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBeats();
  }, []);

  // Check if user is admin
  if (!user || user.uid !== ADMIN_UID) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-gray-900 border-gray-800">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300 mb-4">You do not have permission to access the admin dashboard.</p>
          <p className="text-sm text-gray-400">Your UID: {user?.uid}</p>
        </Card>
      </div>
    );
  }

  // Upload image to ImgBB
  const uploadToImgBB = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data.url;
      } else {
        setError("Failed to upload image");
        return null;
      }
    } catch (err) {
      setError("Error uploading image");
      console.error(err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadToImgBB(file);
      if (url) {
        setFormData({ ...formData, coverArt: url });
        setSuccess("Image uploaded successfully");
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.genre || !formData.audioUrl || !formData.price) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const beatData = {
        title: formData.title,
        genre: formData.genre,
        bpm: parseInt(formData.bpm),
        price: parseFloat(formData.price),
        audioUrl: formData.audioUrl,
        coverArt: formData.coverArt,
        description: formData.description,
        key: formData.key,
        tags: tags,
        updatedAt: new Date(),
      };

      if (editingId) {
        // Update existing beat
        const beatRef = doc(db, "beats", editingId);
        await updateDoc(beatRef, beatData);
        setSuccess("Beat updated successfully");
        setEditingId(null);
      } else {
        // Create new beat
        await addDoc(collection(db, "beats"), {
          ...beatData,
          createdAt: new Date(),
        });
        setSuccess("Beat created successfully");
      }

      // Reload beats
      const beatsRef = collection(db, "beats");
      const q = query(beatsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const beatsData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBeats(beatsData);

      // Reset form
      setFormData({
        title: "",
        genre: "",
        bpm: "120",
        price: "29.99",
        audioUrl: "",
        coverArt: "",
        description: "",
        key: "",
      });
      setTags([]);
      setIsOpen(false);
    } catch (err) {
      setError("Failed to save beat");
      console.error(err);
    }
  };

  // Handle edit
  const handleEdit = (beat: any) => {
    setFormData({
      title: beat.title,
      genre: beat.genre,
      bpm: beat.bpm.toString(),
      price: beat.price.toString(),
      audioUrl: beat.audioUrl,
      coverArt: beat.coverArt || "",
      description: beat.description || "",
      key: beat.key || "",
    });
    setTags(beat.tags || []);
    setEditingId(beat.id);
    setIsOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this beat?")) {
      try {
        await deleteDoc(doc(db, "beats", id));
        setBeats(beats.filter((b) => b.id !== id));
        setSuccess("Beat deleted successfully");
      } catch (err) {
        setError("Failed to delete beat");
        console.error(err);
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">RANDYBEATS Admin</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Alerts */}
        {error && (
          <Alert className="mb-4 bg-red-900/20 border-red-800">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-900/20 border-green-800">
            <AlertCircle className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {/* Add Beat Button */}
        <div className="mb-8">
          <Button
            onClick={() => {
              setFormData({
                title: "",
                genre: "",
                bpm: "120",
                price: "29.99",
                audioUrl: "",
                coverArt: "",
                description: "",
                key: "",
              });
              setTags([]);
              setEditingId(null);
              setIsOpen(true);
            }}
            className="gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
            Add New Beat
          </Button>
        </div>

        {/* Add/Edit Beat Form */}
        {isOpen && (
          <Card className="mb-8 bg-gray-900 border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Beat" : "Add New Beat"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <Label className="text-white">Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Beat title"
                    required
                  />
                </div>

                {/* Genre */}
                <div>
                  <Label className="text-white">Genre *</Label>
                  <Select value={formData.genre} onValueChange={(v) => setFormData({ ...formData, genre: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g} className="text-white">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* BPM */}
                <div>
                  <Label className="text-white">BPM *</Label>
                  <Input
                    type="number"
                    value={formData.bpm}
                    onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    min="40"
                    max="300"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <Label className="text-white">Price (USD) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    step="0.01"
                    required
                  />
                </div>

                {/* Audio URL */}
                <div className="md:col-span-2">
                  <Label className="text-white">Audio URL *</Label>
                  <Input
                    type="url"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="https://example.com/beat.mp3"
                    required
                  />
                </div>

                {/* Cover Art Upload */}
                <div className="md:col-span-2">
                  <Label className="text-white">Cover Art (ImgBB)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={uploading}
                    />
                    {uploading && <span className="text-gray-400">Uploading...</span>}
                  </div>
                  {formData.coverArt && (
                    <div className="mt-2">
                      <img src={formData.coverArt} alt="Preview" className="w-20 h-20 rounded" />
                    </div>
                  )}
                </div>

                {/* Key */}
                <div>
                  <Label className="text-white">Key</Label>
                  <Input
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g., C Minor"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Beat description"
                    rows={3}
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <Label className="text-white">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (tagInput.trim()) {
                            setTags([...tags, tagInput.trim()]);
                            setTagInput("");
                          }
                        }
                      }}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Add tag and press Enter"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (tagInput.trim()) {
                          setTags([...tags, tagInput.trim()]);
                          setTagInput("");
                        }
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-orange-600/20 text-orange-400 px-3 py-1 rounded flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="text-orange-300 hover:text-orange-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  {editingId ? "Update Beat" : "Create Beat"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="border-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Beats List */}
        <div>
          <h2 className="text-xl font-bold mb-4">All Beats ({beats.length})</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading beats...</p>
          ) : beats.length === 0 ? (
            <p className="text-gray-400">No beats yet. Create your first beat!</p>
          ) : (
            <div className="space-y-2">
              {beats.map((beat) => (
                <Card key={beat.id} className="bg-gray-900 border-gray-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {beat.coverArt ? (
                      <img src={beat.coverArt} alt={beat.title} className="w-12 h-12 rounded" />
                    ) : (
                      <Music className="w-12 h-12 text-gray-600" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{beat.title}</h3>
                      <p className="text-sm text-gray-400">
                        {beat.genre} • {beat.bpm} BPM • ${beat.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(beat)}
                      className="gap-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(beat.id)}
                      className="gap-1 bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

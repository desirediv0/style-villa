import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { testimonials } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Star,
  Quote,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ── Testimonial Form ──
function TestimonialForm({
  mode,
  testimonialId,
}: {
  mode: "create" | "edit";
  testimonialId?: string;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(mode === "edit");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    city: "",
    text: "",
    rating: 5,
    isPublished: true,
    position: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && testimonialId) {
      const fetchTestimonial = async () => {
        try {
          const response = await testimonials.getTestimonialById(testimonialId);
          if (response.data.success) {
            const t = response.data.data.testimonial;
            setFormData({
              name: t.name || "",
              role: t.role || "",
              city: t.city || "",
              text: t.text || "",
              rating: t.rating || 5,
              isPublished: t.isPublished ?? true,
              position: t.position || 0,
            });
            if (t.image) setImagePreview(t.image);
          }
        } catch (error: any) {
          toast.error("Failed to load testimonial");
        } finally {
          setFormLoading(false);
        }
      };
      fetchTestimonial();
    }
  }, [mode, testimonialId]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: any = { ...formData };
      if (imageFile) payload.image = imageFile;

      if (mode === "create") {
        await testimonials.createTestimonial(payload);
        toast.success("Testimonial created successfully");
      } else {
        await testimonials.updateTestimonial(testimonialId!, payload);
        toast.success("Testimonial updated successfully");
      }
      navigate("/testimonials");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save testimonial");
    } finally {
      setIsLoading(false);
    }
  };

  if (formLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" type="button" onClick={() => navigate("/testimonials")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Add Testimonial" : "Edit Testimonial"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "create" ? "Add a new customer testimonial" : "Update testimonial details"}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Priya Sharma"
          />
        </div>

        {/* Role + City */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role / Title</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Regular Buyer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Mumbai"
            />
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({ ...formData, rating: s })}
                className="p-0.5"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    s <= formData.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200 hover:fill-amber-200 hover:text-amber-200"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Text / Review */}
        <div className="space-y-2">
          <Label htmlFor="text">Review / Message</Label>
          <Textarea
            id="text"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Customer review or testimonial text..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            The review text shown on the homepage carousel
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Screenshot Image (optional)</Label>
          <p className="text-xs text-muted-foreground">
            Upload a WhatsApp chat screenshot or any review image
          </p>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
          >
            <input {...getInputProps()} />
            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-cover"
                />
                <p className="text-sm text-muted-foreground">Click or drag to replace</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Position + Published */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position (order)</Label>
            <Input
              id="position"
              type="number"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
              }
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label>Published</Label>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked })
                }
              />
              <span className="text-sm text-muted-foreground">
                {formData.isPublished ? "Visible on site" : "Hidden"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Testimonial" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/testimonials")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Testimonials List ──
function TestimonialsList() {
  const [testimonialList, setTestimonialList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPublished, setFilterPublished] = useState<string>("");

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 50 };
      if (search) params.search = search;
      if (filterPublished) params.isPublished = filterPublished;
      const response = await testimonials.getTestimonials(params);
      if (response.data.success) {
        setTestimonialList(response.data.data.testimonials);
      }
    } catch (error) {
      toast.error("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [search, filterPublished]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await testimonials.deleteTestimonial(id);
      toast.success("Testimonial deleted");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await testimonials.togglePublish(id);
      toast.success("Status updated");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm">Manage customer reviews shown on homepage</p>
        </div>
        <Link to="/testimonials/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Testimonial
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search testimonials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value)}
          className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : testimonialList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Quote className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No testimonials yet</p>
            <Link to="/testimonials/new">
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add First Testimonial
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testimonialList.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-start gap-4">
                {/* Image thumbnail */}
                <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border">
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Quote className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{t.name}</h3>
                    <Badge variant={t.isPublished ? "default" : "secondary"}>
                      {t.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {[t.role, t.city].filter(Boolean).join(" · ")}
                  </p>
                  {t.text && (
                    <p className="text-sm text-muted-foreground mt-1 italic line-clamp-2">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  )}
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${
                          s <= t.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div className="text-sm text-muted-foreground hidden md:block">
                  #{t.position}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/testimonials/${t.id}`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTogglePublish(t.id)}>
                      {t.isPublished ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" /> Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(t.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Router ──
export default function TestimonialsPage() {
  const { id } = useParams();
  const location = useLocation();

  if (location.pathname.endsWith("/new")) {
    return <TestimonialForm mode="create" />;
  }

  if (id) {
    return <TestimonialForm mode="edit" testimonialId={id} />;
  }

  return <TestimonialsList />;
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminUsers, adminRoles } from "@/api/adminService";
import { Role, AdminRoleItem } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AdminEditPage() {
  const { adminId } = useParams<{ adminId: string }>();
  const { admin: currentAdmin } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = currentAdmin?.role === "SUPER_ADMIN";
  const isSelf = adminId === currentAdmin?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customRoles, setCustomRoles] = useState<AdminRoleItem[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "ADMIN",
    roleId: "",
    isActive: true,
  });

  useEffect(() => {
    if (!adminId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [adminsRes, rolesRes] = await Promise.all([
          adminUsers.getAllAdmins(),
          adminRoles.getRoles(),
        ]);
        if (rolesRes.data.success) setCustomRoles(rolesRes.data.data.roles);
        const found = adminsRes.data.data.admins.find(
          (a: any) => a.id === adminId
        );
        if (!found) {
          toast.error("Admin not found");
          navigate("/admins");
          return;
        }
        setForm({
          firstName: found.firstName ?? "",
          lastName: found.lastName ?? "",
          email: found.email ?? "",
          password: "",
          role: found.role ?? "ADMIN",
          roleId: found.roleId ?? "",
          isActive: found.isActive !== false,
        });
      } catch {
        toast.error("Error loading admin");
        navigate("/admins");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminId, navigate]);

  const set = (name: string, value: any) =>
    setForm((f) => ({ ...f, [name]: value }));

  const handleSave = async () => {
    if (!adminId) return;
    if (form.password && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      setSaving(true);
      // Details (name / email / password / active)
      await adminUsers.updateAdminDetails(adminId, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
        ...(isSelf ? {} : { isActive: form.isActive }),
      });
      // Role + assigned custom role
      if (!isSelf) {
        await adminUsers.updateAdmin(adminId, {
          role: form.role,
          roleId: form.roleId || null,
        });
      }
      toast.success("Admin updated");
      navigate("/admins");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update admin");
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Card className="mx-auto max-w-md bg-amber-50">
        <CardContent className="p-6 text-amber-800">
          Only Super Admins can edit admin accounts.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="mr-4"
          onClick={() => navigate("/admins")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Edit Admin</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Reset Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Base Role</Label>
              <select
                id="role"
                value={form.role}
                disabled={isSelf}
                onChange={(e) => set("role", e.target.value)}
                className="w-full rounded-md border px-3 py-2 disabled:opacity-60"
              >
                {Object.keys(Role).map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleId">Assigned Custom Role</Label>
              <select
                id="roleId"
                value={form.roleId}
                disabled={isSelf}
                onChange={(e) => set("roleId", e.target.value)}
                className="w-full rounded-md border px-3 py-2 disabled:opacity-60"
              >
                <option value="">— None —</option>
                {customRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isSelf && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive admins cannot log in.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => set("isActive", v)}
              />
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Manage this admin's per-admin permission overrides from the
            Permissions button on the Admins list.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/admins")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

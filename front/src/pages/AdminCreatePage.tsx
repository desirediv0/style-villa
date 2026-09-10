import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminUsers, adminRoles } from "@/api/adminService";
import { Role, AdminRoleItem } from "@/types/admin";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PermissionMatrix from "@/components/PermissionMatrix";
import { emptyMatrix, matrixToList } from "@/config/permissions";

export default function AdminCreatePage() {
  const { admin: currentAdmin } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = currentAdmin?.role === "SUPER_ADMIN";

  const [loading, setLoading] = useState(false);
  const [customRoles, setCustomRoles] = useState<AdminRoleItem[]>([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "ADMIN",
    roleId: "",
  });
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const [matrix, setMatrix] = useState<Record<string, string[]>>(() => {
    const m = emptyMatrix();
    m.dashboard = ["read"];
    return m;
  });

  useEffect(() => {
    adminRoles
      .getRoles()
      .then((res) => {
        if (res.data.success) setCustomRoles(res.data.data.roles);
      })
      .catch(() => {});
  }, []);

  const set = (name: string, value: string) =>
    setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      toast.error("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await adminUsers.registerAdmin({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        roleId: form.roleId || null,
        ...(useCustomPermissions && {
          customPermissions: matrixToList(matrix),
        }),
      });
      if (res.data.success) {
        toast.success("Admin created");
        navigate("/admins");
      } else {
        toast.error(res.data.message || "Failed to create admin");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error creating admin");
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Card className="mx-auto max-w-md bg-amber-50">
        <CardContent className="p-6 text-amber-800">
          Only Super Admins can create new admin accounts.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create New Admin</h1>
        <p className="text-muted-foreground">
          Add an administrator, assign a role, and optionally override permissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  required
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
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Base Role (fallback permissions)</Label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
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
                  onChange={(e) => set("roleId", e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="">— None —</option>
                  {customRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.permissions.length} perms)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Effective permissions = assigned custom role ∪ per-admin overrides
              below. If no custom role and no overrides, the base role's default
              permissions are used.
            </p>

            <div className="border-t pt-4">
              <div className="mb-4 flex items-center gap-2">
                <Checkbox
                  id="customPermissions"
                  checked={useCustomPermissions}
                  onCheckedChange={(c) => setUseCustomPermissions(!!c)}
                />
                <Label htmlFor="customPermissions" className="font-medium">
                  Set per-admin permission overrides
                </Label>
              </div>
              {useCustomPermissions && (
                <PermissionMatrix value={matrix} onChange={setMatrix} />
              )}
            </div>

            <CardFooter className="flex justify-between px-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admins")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

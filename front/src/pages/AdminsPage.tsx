import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { adminUsers, adminRoles } from "@/api/adminService";
import { Admin, Role, AdminRoleItem } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Plus, Pencil, ShieldCheck, Trash2 } from "lucide-react";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [customRoles, setCustomRoles] = useState<AdminRoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { admin: currentAdmin } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = currentAdmin?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [adminsRes, rolesRes] = await Promise.all([
        adminUsers.getAllAdmins(),
        adminRoles.getRoles().catch(() => null),
      ]);
      if (adminsRes.data.success) setAdmins(adminsRes.data.data.admins);
      else toast.error("Failed to fetch admins");
      if (rolesRes?.data?.success) setCustomRoles(rolesRes.data.data.roles);
    } catch {
      toast.error("Error fetching admin users");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (adminId: string, isActive: boolean) => {
    try {
      const res = await adminUsers.updateAdmin(adminId, { isActive });
      if (res.data.success) {
        toast.success(`Admin ${isActive ? "activated" : "deactivated"}`);
        fetchAll();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error updating status");
    }
  };

  const updateRole = async (adminId: string, role: string) => {
    try {
      const res = await adminUsers.updateAdmin(adminId, { role });
      if (res.data.success) {
        toast.success("Base role updated");
        fetchAll();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error updating role");
    }
  };

  const updateCustomRole = async (adminId: string, roleId: string) => {
    try {
      const res = await adminUsers.updateAdmin(adminId, {
        roleId: roleId || null,
      });
      if (res.data.success) {
        toast.success("Assigned role updated");
        fetchAll();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error updating assigned role");
    }
  };

  const removeAdmin = async (adminId: string) => {
    if (!confirm("Delete this admin? This cannot be undone.")) return;
    try {
      const res = await adminUsers.deleteAdmin(adminId);
      if (res.data.success) {
        toast.success("Admin deleted");
        fetchAll();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error deleting admin");
    }
  };

  const roleBadgeColor = (role: string) =>
    ({
      SUPER_ADMIN: "bg-red-500 hover:bg-red-600",
      ADMIN: "bg-blue-500 hover:bg-blue-600",
      MANAGER: "bg-primary hover:bg-primary/90",
      CONTENT_EDITOR: "bg-purple-500 hover:bg-purple-600",
      SUPPORT_AGENT: "bg-yellow-500 hover:bg-yellow-600",
    }[role] || "bg-gray-500 hover:bg-gray-600");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Users</h1>
          <p className="text-muted-foreground">
            Manage administrators, their roles and permissions.
          </p>
        </div>
        {isSuperAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/roles">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Roles
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admins/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Admin
              </Link>
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        </div>
      ) : admins.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">No admin users found</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => {
            const editable = isSuperAdmin && admin.id !== currentAdmin?.id;
            return (
              <Card
                key={admin.id}
                className={admin.isActive === false ? "opacity-70" : ""}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {admin.firstName} {admin.lastName}
                    </CardTitle>
                    <Badge className={roleBadgeColor(admin.role)}>
                      {admin.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                </CardHeader>

                <CardContent className="text-sm">
                  <p className="mb-1">
                    <span className="font-medium">Status: </span>
                    <Badge
                      variant={admin.isActive !== false ? "default" : "outline"}
                    >
                      {admin.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Assigned role: </span>
                    {admin.roleName || "—"}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Permissions: </span>
                    {admin.permissions?.length ?? 0}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Last Login: </span>
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleString()
                      : "Never"}
                  </p>

                  {editable && (
                    <>
                      <Separator className="my-2" />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admins/${admin.id}/edit`)}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            navigate(`/admins/permissions/${admin.id}`)
                          }
                        >
                          Permissions
                        </Button>
                        {admin.isActive !== false ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(admin.id, false)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(admin.id, true)}
                          >
                            Activate
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAdmin(admin.id)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>

                      <div className="mt-3 grid gap-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Base role
                          <select
                            className="mt-1 w-full rounded border px-2 py-1 text-sm"
                            value={admin.role}
                            onChange={(e) =>
                              updateRole(admin.id, e.target.value)
                            }
                          >
                            {Object.keys(Role).map((r) => (
                              <option key={r} value={r}>
                                {r.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs font-medium text-muted-foreground">
                          Assigned custom role
                          <select
                            className="mt-1 w-full rounded border px-2 py-1 text-sm"
                            value={admin.roleId ?? ""}
                            onChange={(e) =>
                              updateCustomRole(admin.id, e.target.value)
                            }
                          >
                            <option value="">— None —</option>
                            {customRoles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isSuperAdmin && (
        <div className="mt-4 rounded-lg border bg-amber-50 p-4">
          <p className="text-amber-800">
            Only Super Admins can manage other admin users.
          </p>
        </div>
      )}
    </div>
  );
}

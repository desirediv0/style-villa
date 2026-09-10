import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminUsers } from "@/api/adminService";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import PermissionMatrix from "@/components/PermissionMatrix";
import { emptyMatrix, listToMatrix, matrixToList } from "@/config/permissions";

/**
 * Edit a single admin's *per-admin* permission overrides.
 * These are merged with the admin's assigned Role permissions at login.
 */
export default function AdminPermissionsPage() {
  const { adminId } = useParams<{ adminId: string }>();
  const { admin: currentAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [matrix, setMatrix] = useState<Record<string, string[]>>(emptyMatrix());

  const isSuperAdmin = currentAdmin?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!adminId) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminUsers.getAllAdmins();
        if (!res.data.success) throw new Error();
        const found = res.data.data.admins.find((a: any) => a.id === adminId);
        if (!found) {
          toast.error("Admin not found");
          navigate("/admins");
          return;
        }
        setAdminData(found);
        // ownPermissions is the editable set; fall back to permissions.
        setMatrix(
          listToMatrix(found.ownPermissions ?? found.permissions ?? [])
        );
      } catch {
        toast.error("Error fetching admin data");
        navigate("/admins");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminId, navigate]);

  const roleGranted = useMemo(
    () => new Set<string>(adminData?.rolePermissions ?? []),
    [adminData]
  );
  const count = useMemo(
    () => Object.values(matrix).reduce((s, a) => s + a.length, 0),
    [matrix]
  );

  const handleSave = async () => {
    if (!adminId) return;
    try {
      setSaving(true);
      const res = await adminUsers.updateAdminPermissions(adminId, {
        permissions: matrixToList(matrix),
      });
      if (res.data.success) {
        toast.success("Permissions updated");
        navigate("/admins");
      } else {
        toast.error(res.data.message || "Failed to update permissions");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error updating permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card className="mx-auto max-w-md bg-amber-50">
        <CardContent className="p-6 text-amber-800">
          Only Super Admins can manage admin permissions.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="mr-4"
          onClick={() => navigate("/admins")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Per-admin Permissions</h1>
          <p className="text-muted-foreground">
            {adminData?.firstName} {adminData?.lastName} ({adminData?.email})
            {adminData?.roleName ? ` · role: ${adminData.roleName}` : ""}
          </p>
        </div>
      </div>

      {roleGranted.size > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-sm text-blue-900">
            This admin's assigned role already grants{" "}
            <strong>{roleGranted.size}</strong> permission(s). Anything you set
            below is <em>added</em> on top of the role.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Overrides — {count} permission{count === 1 ? "" : "s"} selected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionMatrix value={matrix} onChange={setMatrix} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/admins")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Permissions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { adminRoles } from "@/api/adminService";
import { AdminRoleItem } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import PermissionMatrix from "@/components/PermissionMatrix";
import {
  emptyMatrix,
  listToMatrix,
  matrixToList,
} from "@/config/permissions";

type EditorState = {
  open: boolean;
  mode: "create" | "edit";
  id?: string;
  name: string;
  description: string;
  matrix: Record<string, string[]>;
};

const blankEditor = (): EditorState => ({
  open: false,
  mode: "create",
  name: "",
  description: "",
  matrix: emptyMatrix(),
});

export default function RolesPage() {
  const { admin } = useAuth();
  const canManage =
    admin?.role === "SUPER_ADMIN" ||
    admin?.permissions?.includes("roles:create") ||
    admin?.permissions?.includes("roles:update");

  const [roles, setRoles] = useState<AdminRoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<EditorState>(blankEditor());
  const [deleteTarget, setDeleteTarget] = useState<AdminRoleItem | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await adminRoles.getRoles();
      if (res.data.success) setRoles(res.data.data.roles);
      else toast.error("Failed to load roles");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openCreate = () =>
    setEditor({ ...blankEditor(), open: true, mode: "create" });

  const openEdit = (role: AdminRoleItem) =>
    setEditor({
      open: true,
      mode: "edit",
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      matrix: listToMatrix(role.permissions),
    });

  const closeEditor = () => setEditor((s) => ({ ...s, open: false }));

  const permissionCount = useMemo(
    () =>
      Object.values(editor.matrix).reduce((sum, arr) => sum + arr.length, 0),
    [editor.matrix]
  );

  const handleSave = async () => {
    if (!editor.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    const permissions = matrixToList(editor.matrix);
    try {
      setSaving(true);
      if (editor.mode === "create") {
        const res = await adminRoles.createRole({
          name: editor.name.trim(),
          description: editor.description.trim() || undefined,
          permissions,
        });
        if (res.data.success) {
          toast.success("Role created");
          closeEditor();
          fetchRoles();
        }
      } else if (editor.id) {
        const res = await adminRoles.updateRole(editor.id, {
          name: editor.name.trim(),
          description: editor.description.trim(),
          permissions,
        });
        if (res.data.success) {
          toast.success("Role updated");
          closeEditor();
          fetchRoles();
        }
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminRoles.deleteRole(deleteTarget.id);
      if (res.data.success) {
        toast.success("Role deleted");
        setDeleteTarget(null);
        fetchRoles();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete role");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roles &amp; Permissions</h1>
          <p className="text-muted-foreground">
            Create reusable roles and assign them to admin users.
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Role
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : roles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No roles yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {role.name}
                  </CardTitle>
                  {role.isSystem && <Badge variant="outline">System</Badge>}
                </div>
                {role.description && (
                  <CardDescription>{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {role.permissions.length} permissions
                  </Badge>
                  <Badge variant="secondary">
                    {role.adminCount} admin{role.adminCount === 1 ? "" : "s"}
                  </Badge>
                </div>
                {canManage && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(role)}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={role.adminCount > 0}
                      title={
                        role.adminCount > 0
                          ? "Reassign its admins before deleting"
                          : undefined
                      }
                      onClick={() => setDeleteTarget(role)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / edit dialog */}
      <Dialog open={editor.open} onOpenChange={(o) => !o && closeEditor()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editor.mode === "create" ? "New Role" : "Edit Role"}
            </DialogTitle>
            <DialogDescription>
              {permissionCount} permission{permissionCount === 1 ? "" : "s"} selected
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">Name</Label>
                <Input
                  id="role-name"
                  value={editor.name}
                  onChange={(e) =>
                    setEditor((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="e.g. Catalog Editor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-desc">Description</Label>
                <Input
                  id="role-desc"
                  value={editor.description}
                  onChange={(e) =>
                    setEditor((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <PermissionMatrix
              value={editor.matrix}
              onChange={(matrix) => setEditor((s) => ({ ...s, matrix }))}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditor}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editor.mode === "create" ? "Create Role" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete role</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

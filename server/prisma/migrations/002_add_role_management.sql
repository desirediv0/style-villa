-- Role management: reusable named roles + per-role permission matrix.
-- An admin's effective permissions = (their role's permissions) UNION (their per-admin "Permission" rows).
-- Run manually against the database, or via `prisma migrate dev` after `npm install`.

-- 1. Reusable roles
CREATE TABLE IF NOT EXISTS "Role" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "isSystem"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");

-- 2. Per-role permission rows
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id"       TEXT NOT NULL,
    "roleId"   TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action"   TEXT NOT NULL,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_resource_action_key"
    ON "RolePermission"("roleId", "resource", "action");

ALTER TABLE "RolePermission"
    DROP CONSTRAINT IF EXISTS "RolePermission_roleId_fkey";
ALTER TABLE "RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Link Admin -> Role
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "roleId" TEXT;

ALTER TABLE "Admin"
    DROP CONSTRAINT IF EXISTS "Admin_roleId_fkey";
ALTER TABLE "Admin"
    ADD CONSTRAINT "Admin_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

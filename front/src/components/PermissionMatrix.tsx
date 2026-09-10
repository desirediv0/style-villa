import { useMemo } from "react";
import {
  ACTIONS,
  RESOURCE_DEFS,
  RESOURCE_GROUPS,
} from "@/config/permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PermissionMatrixProps {
  // { resource: [action, ...] }
  value: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
  disabled?: boolean;
}

/**
 * Full resource x action permission grid, grouped by area.
 * Used by the Roles editor and by per-admin permission overrides.
 */
export function PermissionMatrix({
  value,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const grouped = useMemo(
    () =>
      RESOURCE_GROUPS.map((group) => ({
        group,
        resources: RESOURCE_DEFS.filter((r) => r.group === group),
      })),
    []
  );

  const has = (resource: string, action: string) =>
    value[resource]?.includes(action) ?? false;

  const toggle = (resource: string, action: string) => {
    if (disabled) return;
    const current = value[resource] ?? [];
    const next = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    onChange({ ...value, [resource]: next });
  };

  const toggleRow = (resource: string) => {
    if (disabled) return;
    const current = value[resource] ?? [];
    const all = current.length === ACTIONS.length;
    onChange({ ...value, [resource]: all ? [] : [...ACTIONS] });
  };

  const setAll = (grant: boolean) => {
    if (disabled) return;
    const next: Record<string, string[]> = {};
    RESOURCE_DEFS.forEach((r) => {
      next[r.key] = grant ? [...ACTIONS] : [];
    });
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Grant create / read / update / delete access per section.
        </p>
        {!disabled && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAll(true)}>
              Select all
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setAll(false)}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {grouped.map(({ group, resources }) => (
        <div key={group} className="rounded-lg border">
          <div className="border-b bg-muted/40 px-4 py-2 text-sm font-medium">
            {group}
          </div>
          <div className="divide-y">
            {resources.map((r) => {
              const rowActions = value[r.key] ?? [];
              const allChecked = rowActions.length === ACTIONS.length;
              return (
                <div
                  key={r.key}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`row-${r.key}`}
                      checked={allChecked}
                      disabled={disabled}
                      onCheckedChange={() => toggleRow(r.key)}
                    />
                    <Label htmlFor={`row-${r.key}`} className="font-medium">
                      {r.label}
                    </Label>
                    <code className="text-xs text-muted-foreground">{r.key}</code>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {ACTIONS.map((action) => (
                      <div
                        key={`${r.key}-${action}`}
                        className="flex items-center gap-1.5"
                      >
                        <Checkbox
                          id={`${r.key}-${action}`}
                          checked={has(r.key, action)}
                          disabled={disabled}
                          onCheckedChange={() => toggle(r.key, action)}
                        />
                        <Label
                          htmlFor={`${r.key}-${action}`}
                          className="text-xs capitalize"
                        >
                          {action}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PermissionMatrix;

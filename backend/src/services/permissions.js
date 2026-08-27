/**
 * Role -> base permissions map. Per-user overrides (grants or revokes) live in
 * user_permission_overrides and are layered on top of this at auth time.
 *
 * Permission naming: <resource>:<action>
 */
const ROLE_PERMISSIONS = {
  admin: ['*'], // full access

  project_manager: [
    'projects:read', 'projects:write',
    'clients:read', 'clients:write',
    'quotes:read', 'quotes:write', 'quotes:send',
    'documents:read', 'documents:write',
    'users:read',
      'invoices:read', 'invoices:write',
  ],

  accountant: [
    'projects:read',
    'clients:read',
    'quotes:read', 'quotes:write', 'quotes:send',
    'documents:read', 'documents:write',
      'invoices:read', 'invoices:write',
  ],

  staff: [
    'projects:read',
    'clients:read',
    'quotes:read',
    'documents:read', 'documents:write',
  ],
};

function expandPermissions(role, overrides = []) {
  const base = new Set(ROLE_PERMISSIONS[role] || []);
  const grants = overrides.filter((o) => o.allowed).map((o) => o.permission);
  const revokes = new Set(overrides.filter((o) => !o.allowed).map((o) => o.permission));
  grants.forEach((p) => base.add(p));
  revokes.forEach((p) => base.delete(p));
  return base;
}

function hasPermission(permissionSet, permission) {
  if (permissionSet.has('*')) return true;
  return permissionSet.has(permission);
}

module.exports = { ROLE_PERMISSIONS, expandPermissions, hasPermission };

import { PORTALS } from '../config/portals';

/* ============================================================
   Default permission matrices per role.
   Keyed by portal id → screen label (matching the sidebar nav),
   so the Permissions screen always has meaningful data to show
   even when the backend hasn't stored a matrix yet.
   ============================================================ */

// All screen labels grouped by portal, derived from the nav config
export function allScreens() {
  const out = {};
  Object.values(PORTALS).forEach((p) => {
    out[p.id] = [];
    p.nav.forEach((g) => g.items.forEach((i) => out[p.id].push(i.label)));
  });
  return out;
}

/**
 * Portals a role may access = portals where its matrix grants at least one screen.
 * Used to enforce that users can only enter portals they have permission for.
 */
export function allowedPortalsFor(matrix) {
  if (!matrix || typeof matrix !== 'object') return [];
  return Object.keys(matrix).filter(
    (pid) => matrix[pid] && Object.values(matrix[pid]).some(Boolean)
  );
}

export function blankMatrix() {
  const screens = allScreens();
  const m = {};
  Object.keys(screens).forEach((pid) => {
    m[pid] = {};
    screens[pid].forEach((label) => { m[pid][label] = false; });
  });
  return m;
}

function fullMatrix() {
  const screens = allScreens();
  const m = {};
  Object.keys(screens).forEach((pid) => {
    m[pid] = {};
    screens[pid].forEach((label) => { m[pid][label] = true; });
  });
  return m;
}

// Turn on specific screens for a portal
function grant(matrix, portalId, labels) {
  if (!matrix[portalId]) matrix[portalId] = {};
  labels.forEach((l) => { matrix[portalId][l] = true; });
  return matrix;
}

/**
 * Build a sensible default access matrix from the role name.
 * Matches on keywords so it works for backend-defined role names too.
 */
export function defaultMatrixFor(roleName = '') {
  const n = roleName.toLowerCase();

  // Full access
  if (n.includes('admin') || n.includes('ceo') || n.includes('director') || n.includes('super')) {
    return fullMatrix();
  }

  const m = blankMatrix();

  if (n.includes('manager')) {
    grant(m, 'crm', allScreens().crm);
    grant(m, 'masters', allScreens().masters);
    grant(m, 'admin', allScreens().admin);
    return m;
  }

  if (n.includes('marketing')) {
    // CRM portal only
    grant(m, 'crm', ['Dashboard', 'Leads', 'Companies', 'Contacts', 'Sales Reports']);
    return m;
  }

  if (n.includes('account') || n.includes('finance')) {
    grant(m, 'crm', ['Dashboard', 'Approvals', 'Sales Reports']);
    return m;
  }

  if (n.includes('support')) {
    grant(m, 'crm', ['Dashboard', 'Companies', 'Contacts', 'Activities', 'Follow-ups']);
    return m;
  }

  if (n.includes('read') || n.includes('view')) {
    grant(m, 'crm', ['Dashboard', 'Sales Reports']);
    return m;
  }

  // Sales Executive / default sales user
  grant(m, 'crm', ['Dashboard', 'Companies', 'Contacts', 'Leads', 'Opportunities', 'Activities', 'Follow-ups', 'Sales Reports']);
  return m;
}

/**
 * Fallback roles used only if the backend returns no roles at all,
 * so the Admin portal is never empty.
 */
export const fallbackRoles = [
  { id: 'r-admin', name: 'Administrator', description: 'Full system access across all modules', color: '#dc2626', users: 1 },
  { id: 'r-ceo', name: 'CEO', description: 'Executive access with full visibility and approvals', color: '#7c3aed', users: 1 },
  { id: 'r-manager', name: 'Sales Manager', description: 'Manage team, leads, opportunities and approvals', color: '#16a34a', users: 3 },
  { id: 'r-exec', name: 'Sales Executive', description: 'Create and manage own leads and activities', color: '#2563eb', users: 6 },
  { id: 'r-marketing', name: 'Marketing', description: 'Manage campaigns, lead sources and marketing data', color: '#0891b2', users: 2 },
  { id: 'r-support', name: 'Support', description: 'Customer support and activity tracking', color: '#d97706', users: 2 },
  { id: 'r-accounts', name: 'Accounts', description: 'Approvals and financial reports', color: '#be185d', users: 2 },
  { id: 'r-readonly', name: 'Read Only', description: 'View-only access to dashboards and reports', color: '#64748b', users: 1 },
].map((r) => ({ ...r, status: 'Active', matrix: defaultMatrixFor(r.name) }));

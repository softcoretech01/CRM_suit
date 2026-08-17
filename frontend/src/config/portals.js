import {
  LayoutDashboard,
  Zap,
  Building2,
  Users,
  LineChart,
  FileText,
  CalendarCheck,
  CheckSquare,
  Mail,
  MessageCircle,
  PieChart,
  ShieldCheck
} from 'lucide-react';

/* ============================================================
   Portal definitions — three separate workspaces.
   Each portal scopes the sidebar navigation and landing route.
   ============================================================ */

export const PORTALS = {
  crm: {
    id: 'crm',
    name: 'CRM Portal',
    short: 'CRM',
    tagline: 'Leads, pipeline & customer relationships',
    icon: 'bi-graph-up-arrow',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    home: '/dashboard',
    nav: [
      {
        group: 'Workspace',
        items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
      },
      {
        group: 'Sales',
        items: [
          { to: '/companies', icon: Building2, label: 'Companies' },
          { to: '/contacts', icon: Users, label: 'Contacts' },
          { to: '/leads', icon: Zap, label: 'Leads' },
          { to: '/opportunities', icon: LineChart, label: 'Opportunities' },
          // Note: Proposals & Pipeline paths remain active, but hidden from main UI nav to reduce clutter
        ],
      },
      {
        group: 'Activities',
        items: [
          { to: '/activities', icon: CalendarCheck, label: 'Activities' },
          { to: '/activities/followups', icon: CheckSquare, label: 'Follow-ups' },
        ],
      },
      {
        group: 'Communication',
        items: [
          { to: '/email-campaigns', icon: Mail, label: 'Email' },
          { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
        ],
      },
      {
        group: 'Reports',
        items: [
          { to: '/reports', icon: PieChart, label: 'Sales Reports' },
        ],
      },
    ],
  },

  masters: {
    id: 'masters',
    name: 'Masters Portal',
    short: 'Masters',
    tagline: 'Configure master data & reference lists',
    icon: 'bi-collection-fill',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #2563eb)',
    home: '/masters/dashboard',
    nav: [
      {
        group: '',
        items: [
          { to: '/masters/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
        ],
      },
      {
        group: 'General',
        items: [
          { to: '/masters/company', icon: 'bi-building-fill', label: 'Company Master' },
          { to: '/masters/products', icon: 'bi-box-seam-fill', label: 'Product Master' },
          { to: '/masters/industries', icon: 'bi-diagram-3-fill', label: 'Industry Master' },
        ],
      },
      {
        group: 'Sales Configuration',
        items: [
          { to: '/masters/lead-sources', icon: 'bi-signpost-split-fill', label: 'Lead Source' },
          { to: '/masters/campaigns', icon: 'bi-megaphone-fill', label: 'Campaign' },
          { to: '/masters/activity-types', icon: 'bi-list-check', label: 'Activity Type' },
          { to: '/masters/lead-status', icon: 'bi-flag-fill', label: 'Lead Status' },
          { to: '/masters/lead-temperature', icon: 'bi-thermometer-half', label: 'Lead Temperature' },
          { to: '/masters/next-actions', icon: 'bi-arrow-right-circle-fill', label: 'Next Action' },
          { to: '/masters/priorities', icon: 'bi-exclamation-diamond-fill', label: 'Priority' },
        ],
      },
      {
        group: 'Geography',
        items: [
          { to: '/masters/countries', icon: 'bi-globe2', label: 'Country' },
          { to: '/masters/states', icon: 'bi-geo-fill', label: 'State' },
          { to: '/masters/cities', icon: 'bi-geo-alt-fill', label: 'City' },
        ],
      },
    ],
  },

  admin: {
    id: 'admin',
    name: 'Admin Portal',
    short: 'Admin',
    tagline: 'Users, roles & access control',
    icon: 'bi-shield-lock-fill',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5, #7e22ce)',
    home: '/admin-dashboard',
    nav: [
      {
        group: '',
        items: [
          { to: '/admin-dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
          { to: '/users', icon: 'bi-people-fill', label: 'Users' },
          { to: '/roles', icon: 'bi-shield-lock-fill', label: 'Roles' },
          { to: '/permissions', icon: 'bi-ui-checks-grid', label: 'Permissions' },
        ],
      },
    ],
  },
};

export const PORTAL_ORDER = ['admin', 'masters', 'crm'];

/** Map a pathname to the portal that owns it (for deep links / refresh). */
export function portalForPath(pathname) {
  if (pathname.startsWith('/masters')) return 'masters';
  if (
    pathname.startsWith('/users') ||
    pathname.startsWith('/roles') ||
    pathname.startsWith('/permissions')
  )
    return 'admin';
  return 'crm';
}

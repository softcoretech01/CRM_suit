import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as mock from '../data/mockData';
import { apiFetch } from '../utils/api';
import { colorFor } from '../utils/format';
import { defaultMatrixFor, fallbackRoles } from '../data/permissionDefaults';

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [adminCompanies, setAdminCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  
  // Master data lists
  const [leadSources, setLeadSources] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [companyTypes, setCompanyTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [nextActions, setNextActions] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [productCategories, setProductCategories] = useState([]);

  const fetchAll = useCallback(() => {
    if (!sessionStorage.getItem('token')) return;

    // Parse a role's stored permissions; fall back to a sensible default
    // matrix when the backend hasn't stored one yet, so the Permissions
    // screen always has meaningful data to display and edit.
    const resolveMatrix = (r) => {
      let perm = r.matrix || r.permissions;
      if (typeof perm === 'string') {
        try { perm = JSON.parse(perm); } catch { perm = null; }
      }
      // Use the stored matrix as the source of truth when it exists (the backend
      // returns only the enabled screens; anything missing = denied). Merging it
      // onto the role-name default would resurrect screens the user turned OFF,
      // so return it as-is. Fall back to a default only when nothing is saved yet.
      if (perm && typeof perm === 'object' && Object.keys(perm).length > 0) {
        return perm;
      }
      return defaultMatrixFor(r.name);
    };

    // Fetch initial data from backend
    apiFetch('/admin/roles').then(res => {
      if (res.data && res.data.length > 0) {
        setRoles(res.data.map(r => ({
          ...r,
          color: colorFor(r.name),
          users: r.users ?? r.user_count ?? 0,
          status: r.status === 'ACTIVE' ? 'Active' : r.status === 'INACTIVE' ? 'Inactive' : r.status,
          matrix: resolveMatrix(r),
        })));
      } else {
        setRoles(fallbackRoles);
      }
    }).catch(err => {
      console.error("Failed to fetch roles, using defaults:", err);
      setRoles(fallbackRoles);
    });

    apiFetch('/admin/users').then(res => {
      console.log('USERS API RESPONSE:', res);
      const list = res.data || res.items || (Array.isArray(res) ? res : []);
      console.log('USERS PARSED LIST:', list);
      if (list && list.length > 0) {
        setUsers(list.map(u => {
          const name = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown';
          return {
            ...u,
            name,
            color: colorFor(name),
            role: u.role || u.role_name || '',
            department: u.department || '',
            designation: u.designation || '',
            branch: 'HQ',
            email: u.email,
            mobile: u.mobile || '',
            status: u.status === 'ACTIVE' || u.status === 'Active' ? 'Active' : 'Inactive',
          };
        }));
      }
    }).catch(err => console.error("Failed to fetch users:", err));

    const fetchCompanies = () => {
      const prefix = '/crm';
      apiFetch(`${prefix}/companies`).then(res => {
        console.log('COMPANIES API RESPONSE:', res);
        const list = res.data || (Array.isArray(res) ? res : []);
        console.log('COMPANIES PARSED LIST:', list);
        if (list && list.length > 0) {
          setCompanies(list.map(c => ({
            ...c,
            status: c.status === 'ACTIVE' || c.status === 'Active' ? 'Active' : 'Inactive'
          })));
        }
      }).catch(err => console.error("Failed to fetch companies:", err));
    };
    
    const fetchAdminCompanies = () => {
      apiFetch('/admin/companies').then(res => {
        console.log('ADMIN COMPANIES API RESPONSE:', res);
        const list = res.data || (Array.isArray(res) ? res : []);
        if (list && list.length > 0) {
          setAdminCompanies(list.map(c => ({
            ...c,
            status: c.status === 'ACTIVE' || c.status === 'Active' ? 'Active' : 'Inactive'
          })));
        }
      }).catch(err => console.error("Failed to fetch admin companies:", err));
    };

    fetchCompanies();
    fetchAdminCompanies();

    const fetchMaster = (slug, setter) => {
      apiFetch(`/masters/${slug}`).then(res => {
        const list = res.data || (Array.isArray(res) ? res : []);
        if (list && list.length > 0) setter(list);
      }).catch(err => console.error(`Failed to fetch ${slug}:`, err));
    };

    fetchMaster('lead-sources', setLeadSources);
    fetchMaster('campaigns', setCampaigns);
    fetchMaster('industries', setIndustries);
    fetchMaster('company-types', setCompanyTypes);
    fetchMaster('activity-types', setActivityTypes);
    fetchMaster('lead-statuses', setLeadStatuses);
    fetchMaster('next-actions', setNextActions);
    fetchMaster('priorities', setPriorities);
    fetchMaster('countries', setCountries);
    fetchMaster('states', setStates);
    fetchMaster('cities', setCities);

    // Product Categories
    fetchMaster('product-categories', setProductCategories);

    const prefix = '/crm';
    
    apiFetch(`${prefix}/products`).then(res => {
      if (res.data) setProducts(res.data);
    }).catch(err => console.error("Failed to fetch products:", err));
    
    apiFetch('/crm/contacts').then(res => {
      if (res.data) setContacts(res.data.map(c => ({
        ...c,
        companyId: c.crm_company_id || c.company_id || c.companyId,
        name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
        status: c.status === 'ACTIVE' ? 'Active' : c.status === 'INACTIVE' ? 'Inactive' : c.status
      })));
    }).catch(err => console.error("Failed to fetch contacts:", err));

    // Fetch CRM data
    apiFetch('/crm/leads').then(res => {
      if (res.data) setLeads(res.data);
    }).catch(err => console.error("Failed to fetch leads:", err));

    apiFetch('/crm/opportunities').then(res => {
      if (res.data) setOpportunities(res.data);
    }).catch(err => console.error("Failed to fetch opportunities:", err));

    apiFetch('/crm/activities').then(res => {
      if (res.data) setActivities(res.data);
    }).catch(err => console.error("Failed to fetch activities:", err));

    apiFetch('/crm/followups').then(res => {
      if (res.data) setFollowUps(res.data);
    }).catch(err => console.error("Failed to fetch followups:", err));

    apiFetch('/crm/approvals').then(res => {
      if (res.data) setPendingApprovals(res.data);
    }).catch(err => console.error("Failed to fetch approvals:", err));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Volume 3 & 4 state
  const [followUps, setFollowUps] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [whatsappCampaigns, setWhatsappCampaigns] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [proposals, setProposals] = useState([]);

  // ---- Leads ----
  const num = (v) => (v != null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : null);
  const tempFromScore = (s) => { const n = Number(s) || 0; return n >= 67 ? 'Hot' : n >= 34 ? 'Warm' : 'Cold'; };

  const addLead = useCallback(async (lead) => {
    try {
      // Map camelCase form fields to the backend's flat lead schema.
      const assignee = lead.assignedTo
        ? users.find((u) => u.name === lead.assignedTo || String(u.id) === String(lead.assignedTo))
        : null;
      const body = {
        lead_name: lead.lead_name || lead.company || lead.leadName || '',
        contact_name: lead.contact_name || lead.contact || null,
        email: lead.email || lead.contactEmail || null,
        phone: lead.phone || lead.contactMobile || lead.mobile || null,
        address: lead.address || null,
        business_details: lead.business_details || lead.businessDetails || null,
        requirement: lead.requirement || null,
        temperature: lead.temperature || tempFromScore(lead.score),
        source: lead.source || null,
        priority: lead.priority || 'Medium',
        value: Number(lead.value) || 0,
        company_id: num(lead.companyId ?? lead.company_id),
        product_id: num(lead.productId ?? lead.product_id),
        assigned_to: assignee ? num(assignee.id) : num(lead.assigned_to),
        notes: lead.notes || null,
        status: lead.status || 'New',
      };
      const res = await apiFetch('/crm/leads', { method: 'POST', body });
      const rec = { id: res.data.id, ...lead };
      setLeads((l) => [rec, ...l]);
      return rec;
    } catch (err) {
      console.error("Failed to add lead:", err);
      throw err;
    }
  }, [users]);

  const updateLead = useCallback(async (id, patch) => {
    try {
      // Map camelCase → flat schema. The update SP COALESCEs, so omitted keys keep their value.
      const assignee = patch.assignedTo
        ? users.find((u) => u.name === patch.assignedTo || String(u.id) === String(patch.assignedTo))
        : null;
      const has = (a, b) => patch[a] !== undefined || (b && patch[b] !== undefined);
      const body = {
        lead_name: patch.lead_name ?? patch.company,
        contact_name: patch.contact_name ?? patch.contact,
        email: patch.email ?? patch.contactEmail,
        phone: patch.phone ?? patch.contactMobile ?? patch.mobile,
        address: patch.address,
        business_details: patch.business_details ?? patch.businessDetails,
        requirement: patch.requirement,
        temperature: patch.temperature,
        source: patch.source,
        priority: patch.priority,
        value: patch.value !== undefined ? Number(patch.value) || 0 : undefined,
        company_id: has('companyId', 'company_id') ? num(patch.companyId ?? patch.company_id) : undefined,
        product_id: has('productId', 'product_id') ? num(patch.productId ?? patch.product_id) : undefined,
        assigned_to: patch.assignedTo !== undefined ? (assignee ? num(assignee.id) : null) : undefined,
        notes: patch.notes,
      };
      await apiFetch(`/crm/leads/${id}`, { method: 'PUT', body });
      setLeads((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    } catch (err) {
      console.error("Failed to update lead:", err);
      throw err;
    }
  }, [users]);

  const deleteLead = useCallback(async (id) => {
    try {
      await apiFetch(`/crm/leads/${id}`, { method: 'DELETE' });
      setLeads((l) => l.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Failed to delete lead:", err);
      throw err;
    }
  }, []);

  // ---- Companies ----
  const addCompany = useCallback(async (c) => {
    try {
      const code = c.code || `CMP-${1011 + Math.floor(Math.random() * 900)}`;
      const payload = { ...c, code, status: c.status || 'Active' };
      const prefix = '/crm';
      const res = await apiFetch(`${prefix}/companies`, { method: 'POST', body: payload });
      const new_id = res.data?.id || res.id;
      const rec = { id: new_id, ...payload };
      setCompanies((l) => [rec, ...l]);
      return rec;
    } catch (err) {
      console.error("Failed to add company:", err);
      throw err;
    }
  }, []);

  const updateCompany = useCallback(async (id, patch) => {
    try {
      const prefix = '/crm';
      await apiFetch(`${prefix}/companies/${id}`, { method: 'PUT', body: patch });
      setCompanies((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    } catch (err) {
      console.error("Failed to update company:", err);
      throw err;
    }
  }, []);

  const deleteCompany = useCallback(async (id) => {
    try {
      const prefix = '/crm';
      await apiFetch(`${prefix}/companies/${id}`, { method: 'DELETE' });
      setCompanies((l) => l.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Failed to delete company:", err);
      throw err;
    }
  }, []);

  // ---- Contacts ----
  const addContact = useCallback(async (c) => {
    try {
      const code = c.code || `CNT-${2013 + Math.floor(Math.random() * 900)}`;
      let first_name = c.first_name || c.name || '';
      let last_name = null;
      const payload = { ...c, code, status: c.status || 'Active', first_name, last_name, name: c.name || first_name };
      
      ['assigned_to', 'created_by', 'companyId', 'company_id', 'crm_company_id'].forEach(f => {
        if (payload[f] === '') payload[f] = null;
        else if (payload[f] != null && !isNaN(payload[f])) payload[f] = parseInt(payload[f], 10);
      });

      if (payload.companyId) {
        payload.company_id = payload.companyId;
        payload.crm_company_id = payload.companyId; // CRM specific alias
      }
      const res = await apiFetch('/crm/contacts', { method: 'POST', body: payload });
      const new_id = res.data?.id || res.id;
      const rec = { id: new_id, ...payload };
      setContacts((l) => [rec, ...l]);
      return rec;
    } catch (err) {
      console.error("Failed to add contact:", err);
      throw err;
    }
  }, []);

  const updateContact = useCallback(async (id, patch) => {
    try {
      let payload = { ...patch };
      if (patch.name) {
        payload.first_name = patch.name;
        payload.last_name = null;
      } else if (patch.first_name && !patch.name) {
        payload.name = patch.first_name;
        payload.last_name = null;
      }
      
      ['assigned_to', 'created_by', 'companyId', 'company_id', 'crm_company_id'].forEach(f => {
        if (payload[f] === '') payload[f] = null;
        else if (payload[f] != null && !isNaN(payload[f])) payload[f] = parseInt(payload[f], 10);
      });

      if (payload.companyId) {
        payload.company_id = payload.companyId;
        payload.crm_company_id = payload.companyId; // CRM specific alias
      }
      await apiFetch(`/crm/contacts/${id}`, { method: 'PUT', body: payload });
      setContacts((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    } catch (err) {
      console.error("Failed to update contact:", err);
      throw err;
    }
  }, []);

  const deleteContact = useCallback(async (id) => {
    try {
      await apiFetch(`/crm/contacts/${id}`, { method: 'DELETE' });
      setContacts((l) => l.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Failed to delete contact:", err);
      throw err;
    }
  }, []);

  // ---- Products ----
  const addProduct = useCallback(async (p) => {
    try {
      const code = p.code || `PRD-${101 + Math.floor(Math.random() * 900)}`;
      const payload = { ...p, code, status: p.status || 'Active' };
      const prefix = '/crm';
      const res = await apiFetch(`${prefix}/products`, { method: 'POST', body: payload });
      const new_id = res.data?.id || res.id;
      const rec = { id: new_id, ...payload };
      setProducts((l) => [rec, ...l]);
      return rec;
    } catch (err) {
      console.error("Failed to add product:", err);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id, patch) => {
    try {
      const prefix = '/crm';
      await apiFetch(`${prefix}/products/${id}`, { method: 'PUT', body: patch });
      setProducts((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    } catch (err) {
      console.error("Failed to update product:", err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      const prefix = '/crm';
      await apiFetch(`${prefix}/products/${id}`, { method: 'DELETE' });
      setProducts((l) => l.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw err;
    }
  }, []);

  // ---- Opportunities ----
  const addOpportunity = useCallback(async (o) => {
    try {
      // Opportunities are created by converting a lead.
      const res = await apiFetch(`/crm/leads/${o.leadId}/convert`, {
        method: 'POST',
        body: { expected_close: o.expected_close || null },
      });
      const rec = { id: res.data?.opportunity_id || res.data?.id, ...o };
      setOpportunities((l) => [rec, ...l]);
      return rec;
    } catch (err) {
      console.error("Failed to add opportunity:", err);
      throw err;
    }
  }, []);

  const updateOpportunity = useCallback(async (id, patch) => {
    try {
      const stage = patch.stage ?? patch.status;
      if (stage !== undefined && stage !== null && stage !== '') {
        // Stage/status changes go through the dedicated stage endpoint.
        await apiFetch(`/crm/opportunities/${id}/stage`, { method: 'POST', body: { stage } });
      } else if (patch.name !== undefined || patch.value !== undefined || patch.expected_close !== undefined) {
        // Field edits go through the standard update endpoint.
        await apiFetch(`/crm/opportunities/${id}`, { method: 'PUT', body: patch });
      }
      // Other patches (e.g. next-action hints) are local-only — no destructive write.
      setOpportunities((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    } catch (err) {
      console.error("Failed to update opportunity:", err);
      throw err;
    }
  }, []);

  const deleteOpportunity = useCallback((id) => setOpportunities((l) => l.filter((x) => x.id !== id)), []);

  // ---- Activities ----
  const addActivity = useCallback(async (a) => {
    try {
      const res = await apiFetch('/crm/activities', { method: 'POST', body: a });
      const rec = { id: res.data.id, ...a };
      setActivities((l) => [rec, ...l]);
      return rec;
    } catch (err) {
      console.error("Failed to log activity:", err);
      throw err;
    }
  }, []);

  const updateActivity = useCallback((id, patch) => {
    setActivities((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const deleteActivity = useCallback((id) => setActivities((l) => l.filter((x) => x.id !== id)), []);

  // ---- Follow-ups ----
  const addFollowUp = useCallback(async (f) => {
    try {
      const res = await apiFetch('/crm/followups', { method: 'POST', body: f });
      const rec = { id: res.data.id, ...f };
      setFollowUps((l) => [rec, ...l]);
      return rec;
    } catch (err) {
      console.error("Failed to add follow-up:", err);
      throw err;
    }
  }, []);

  const updateFollowUp = useCallback(async (id, patch) => {
    try {
      const status = String(patch.status || '').toLowerCase();
      if (status === 'completed' || status === 'done') {
        // Completion is a dedicated endpoint that also logs the activity.
        await apiFetch(`/crm/followups/${id}/done`, {
          method: 'POST',
          body: { outcome: patch.outcome || '', subject: patch.subject || '' },
        });
      } else {
        await apiFetch(`/crm/followups/${id}`, { method: 'PUT', body: patch });
      }
      setFollowUps((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    } catch (err) {
      console.error("Failed to update follow-up:", err);
      throw err;
    }
  }, []);

  const deleteFollowUp = useCallback((id) => setFollowUps((l) => l.filter((x) => x.id !== id)), []);

  // ---- Users ----
  const addUser = useCallback(async (u) => {
    // Lookup role_id from the roles loaded from the backend
    const roleObj = roles.find(r => r.name === u.role);
    if (!roleObj) {
      throw new Error(`Role "${u.role || '(none)'}" is not available. Please pick a valid role.`);
    }
    const roleId = Number(roleObj.id);
    if (!Number.isInteger(roleId)) {
      throw new Error('Roles are still loading — please wait a moment and try again.');
    }

    const payload = {
      employee_code: `EMP-${Math.floor(Math.random() * 9000)}`,
      name: u.name,
      username: u.username || u.email.split('@')[0],
      email: u.email,
      mobile: u.mobile || '',
      department: u.department,
      designation: u.designation,
      role_id: roleId,
      password: u.password || 'Password@123',
      companyId: u.companyId ? Number(u.companyId) : null,
      profile_pic: u.profile_pic || u.profilePic || null,
    };

    try {
      const res = await apiFetch('/admin/users', { method: 'POST', body: payload });
      const new_id = res.data.id;
      const rec = { 
        id: new_id, 
        status: 'Active', 
        name: u.name,
        color: colorFor(u.name),
        ...u 
      };
      setUsers((l) => [rec, ...l]);
      return rec;
    } catch (err) {
      console.error("Failed to add user:", err);
      throw err;
    }
  }, [roles]);
  const updateUser = useCallback(async (id, patch) => {
    const toDb = (s) => (s === 'Active' ? 'ACTIVE' : s === 'Inactive' ? 'INACTIVE' : s);
    try {
      const keys = Object.keys(patch);
      if (keys.length === 1 && patch.status) {
        await apiFetch(`/admin/users/${id}/status`, { method: 'PATCH', body: { status: toDb(patch.status) } });
      } else {
        const roleObj = patch.role ? roles.find((r) => r.name === patch.role) : null;
        const body = {
          name: patch.name !== undefined ? patch.name : undefined,
          username: patch.username !== undefined ? patch.username : undefined,
          email: patch.email,
          mobile: patch.mobile,
          department: patch.department,
          designation: patch.designation,
          role_id: roleObj ? Number(roleObj.id) : undefined,
          status: patch.status ? toDb(patch.status) : undefined,
          password: patch.password,
          companyId: patch.companyId ? Number(patch.companyId) : undefined,
          profile_pic: patch.profile_pic !== undefined ? patch.profile_pic : patch.profilePic !== undefined ? patch.profilePic : undefined,
        };
        await apiFetch(`/admin/users/${id}`, { method: 'PUT', body });
      }
      setUsers((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    } catch (err) {
      console.error("Failed to update user:", err);
      throw err;
    }
  }, [roles]);

  const deleteUser = useCallback(async (id) => {
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      setUsers((l) => l.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      throw err;
    }
  }, []);

  const updateRole = useCallback(async (id, patch) => {
    const existing = roles.find(r => r.id === id) || {};
    const payload = {
      name: patch.name || existing.name,
      description: patch.description !== undefined ? patch.description : existing.description,
      matrix: patch.matrix !== undefined ? patch.matrix : existing.matrix,
    };
    try {
      await apiFetch(`/admin/roles/${id}`, { method: 'PUT', body: payload });
      setRoles((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    } catch (err) {
      console.error("Failed to persist role to backend:", err);
      throw err;
    }
  }, [roles]);
  const addRole = useCallback(async (r) => {
    const payload = {
      name: r.name,
      code: r.name.toUpperCase().substring(0, 3) + Math.floor(Math.random() * 100),
      description: r.description
    };
    try {
      const res = await apiFetch('/admin/roles', { method: 'POST', body: payload });
      const new_id = res.data.id;
      const rec = { 
        id: new_id, 
        users: 0, 
        color: colorFor(r.name), 
        ...r 
      };
      setRoles((l) => [...l, rec]);
      return rec;
    } catch (err) {
      console.error("Failed to add role:", err);
      throw err;
    }
  }, []);
  const deleteRole = useCallback(async (id) => {
    try {
      await apiFetch(`/admin/roles/${id}`, { method: 'DELETE' });
      setRoles((l) => l.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Failed to delete role:", err);
      throw err;
    }
  }, []);

  const value = {
    leads, addLead, updateLead, deleteLead,
    companies, addCompany, updateCompany, deleteCompany,
    contacts, addContact, updateContact, deleteContact,
    products, addProduct, updateProduct, deleteProduct,
    opportunities, addOpportunity, updateOpportunity, deleteOpportunity,
    activities, addActivity, updateActivity, deleteActivity, setActivities,
    users, addUser, updateUser, deleteUser, setUsers,
    roles, addRole, updateRole, deleteRole, setRoles,
    followUps, addFollowUp, updateFollowUp, deleteFollowUp,
    documents, setDocuments,
    emailCampaigns, setEmailCampaigns,
    whatsappCampaigns, setWhatsappCampaigns,
    adminCompanies, setAdminCompanies,
    productCategories,
    
    leadSources, campaigns, industries, companyTypes,
    activityTypes, leadStatuses, nextActions, priorities,
    countries, states, cities,
    setStates, setCities,
    fetchAll,
    refreshCompanies: () => {
      apiFetch('/crm/companies').then(res => {
        if (res.data) setCompanies(res.data.map(c => ({
          ...c,
          status: c.status === 'ACTIVE' ? 'Active' : c.status === 'INACTIVE' ? 'Inactive' : c.status
        })));
      }).catch(err => console.error("Failed to fetch companies:", err));
    },
    refreshMaster: (slug) => {
      const asList = (res) => (Array.isArray(res) ? res : (res?.data || []));
      if (slug === 'companies' || slug === 'company') {
        apiFetch('/crm/companies').then(res => {
          setCompanies(asList(res).map(c => ({ ...c, status: c.status === 'ACTIVE' ? 'Active' : c.status === 'INACTIVE' ? 'Inactive' : c.status })));
        }).catch(err => console.error("Failed to fetch companies:", err));
      } else if (slug === 'products') {
        // Products are a CRM resource, not a masters list.
        apiFetch('/crm/products').then(res => setProducts(asList(res)))
          .catch(err => console.error("Failed to fetch products:", err));
      } else {
        const setters = {
          'lead-sources': setLeadSources,
          'campaigns': setCampaigns,
          'industries': setIndustries,
          'company-types': setCompanyTypes,
          'product-categories': setProductCategories,
          'activity-types': setActivityTypes,
          'lead-statuses': setLeadStatuses,
          'next-actions': setNextActions,
          'priorities': setPriorities,
          'countries': setCountries,
          'states': setStates,
          'cities': setCities,
        };
        const setter = setters[slug];
        if (setter) {
          apiFetch(`/masters/${slug}`).then(res => setter(asList(res)))
            .catch(err => console.error(`Failed to fetch ${slug}:`, err));
        }
      }
    }
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export const useCrm = () => useContext(CrmContext);

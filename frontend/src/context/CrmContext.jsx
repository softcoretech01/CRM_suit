import { createContext, useContext, useState, useCallback } from 'react';
import * as mock from '../data/mockData';

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const [leads, setLeads] = useState(mock.leads);
  const [companies, setCompanies] = useState(mock.companies);
  const [contacts, setContacts] = useState(mock.contacts);
  const [opportunities, setOpportunities] = useState(mock.opportunities);
  const [activities, setActivities] = useState(mock.activities);
  const [users, setUsers] = useState(mock.users);
  const [roles, setRoles] = useState(mock.roles);

  // Volume 3 & 4 state
  const [followUps, setFollowUps] = useState(mock.followUps || []);
  const [documents, setDocuments] = useState(mock.documents || []);
  const [emailCampaigns, setEmailCampaigns] = useState(mock.emailCampaigns || []);
  const [whatsappCampaigns, setWhatsappCampaigns] = useState(mock.whatsappCampaigns || []);
  const [automations, setAutomations] = useState(mock.automations || []);
  const [pendingApprovals, setPendingApprovals] = useState(mock.pendingApprovals || []);

  // ---- Leads ----
  const addLead = useCallback((lead) => {
    const num = `LEAD-${String(124 + Math.floor(Math.random() * 900)).padStart(6, '0')}`;
    const rec = { id: num, number: num, ...lead };
    setLeads((l) => [rec, ...l]);
    return rec;
  }, []);
  const updateLead = useCallback((id, patch) => {
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const deleteLead = useCallback((id) => setLeads((l) => l.filter((x) => x.id !== id)), []);

  // ---- Companies ----
  const addCompany = useCallback((c) => {
    const code = `CMP-${1011 + Math.floor(Math.random() * 900)}`;
    const rec = { id: code, code, status: 'Active', ...c };
    setCompanies((l) => [rec, ...l]);
    return rec;
  }, []);
  const updateCompany = useCallback((id, patch) => {
    setCompanies((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const deleteCompany = useCallback((id) => setCompanies((l) => l.filter((x) => x.id !== id)), []);

  // ---- Contacts ----
  const addContact = useCallback((c) => {
    const id = `CNT-${2013 + Math.floor(Math.random() * 900)}`;
    const rec = { id, status: 'Active', ...c };
    setContacts((l) => [rec, ...l]);
    return rec;
  }, []);
  const updateContact = useCallback((id, patch) => {
    setContacts((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const deleteContact = useCallback((id) => setContacts((l) => l.filter((x) => x.id !== id)), []);

  // ---- Opportunities ----
  const addOpportunity = useCallback((o) => {
    const num = `OPP-${3009 + Math.floor(Math.random() * 900)}`;
    const rec = { id: num, number: num, currency: 'INR', ...o };
    setOpportunities((l) => [rec, ...l]);
    return rec;
  }, []);
  const updateOpportunity = useCallback((id, patch) => {
    setOpportunities((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const deleteOpportunity = useCallback((id) => setOpportunities((l) => l.filter((x) => x.id !== id)), []);

  // ---- Activities ----
  const addActivity = useCallback((a) => {
    const id = `ACT-${9011 + Math.floor(Math.random() * 900)}`;
    const rec = { id, ...a };
    setActivities((l) => [rec, ...l]);
    return rec;
  }, []);
  const updateActivity = useCallback((id, patch) => {
    setActivities((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const deleteActivity = useCallback((id) => setActivities((l) => l.filter((x) => x.id !== id)), []);

  // ---- Follow-ups ----
  const addFollowUp = useCallback((f) => {
    const id = `FU-${Math.floor(100 + Math.random() * 900)}`;
    const rec = { id, ...f };
    setFollowUps((l) => [rec, ...l]);
    return rec;
  }, []);
  const updateFollowUp = useCallback((id, patch) => {
    setFollowUps((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const deleteFollowUp = useCallback((id) => setFollowUps((l) => l.filter((x) => x.id !== id)), []);

  // ---- Users ----
  const addUser = useCallback((u) => {
    const id = `USR-${String(11 + Math.floor(Math.random() * 90)).padStart(3, '0')}`;
    const rec = { id, status: 'Active', ...u };
    setUsers((l) => [rec, ...l]);
    return rec;
  }, []);
  const updateUser = useCallback((id, patch) => {
    setUsers((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const deleteUser = useCallback((id) => setUsers((l) => l.filter((x) => x.id !== id)), []);

  const updateRole = useCallback((id, patch) => {
    setRoles((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const addRole = useCallback((r) => {
    const id = `ROL-${String(10 + Math.floor(Math.random() * 90)).padStart(3, '0')}`;
    const rec = { id, users: 0, color: '#94a3b8', ...r };
    setRoles((l) => [...l, rec]);
    return rec;
  }, []);
  const deleteRole = useCallback((id) => setRoles((l) => l.filter((x) => x.id !== id)), []);

  const value = {
    leads, addLead, updateLead, deleteLead,
    companies, addCompany, updateCompany, deleteCompany,
    contacts, addContact, updateContact, deleteContact,
    opportunities, addOpportunity, updateOpportunity, deleteOpportunity,
    activities, addActivity, updateActivity, deleteActivity,
    users, addUser, updateUser, deleteUser,
    roles, addRole, updateRole, deleteRole,
    followUps, addFollowUp, updateFollowUp, deleteFollowUp,
    documents, setDocuments,
    emailCampaigns, setEmailCampaigns,
    whatsappCampaigns, setWhatsappCampaigns,
    automations, setAutomations,
    pendingApprovals, setPendingApprovals,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export const useCrm = () => useContext(CrmContext);

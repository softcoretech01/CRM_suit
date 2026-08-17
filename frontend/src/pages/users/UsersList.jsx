import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, UserCell, EmptyState, Field, Section } from '../../components/common/Ui';
import { Drawer, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { MiniStat } from '../../components/common/PageParts';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, statusTone, colorFor } from '../../utils/format';
import { roles } from '../../data/mockData';

const DEPARTMENTS = ['Sales', 'Marketing', 'Support', 'Accounts', 'Management', 'IT'];
const BRANCHES = ['Coimbatore HQ', 'Chennai Branch', 'Bengaluru Branch'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

const emptyForm = {
  name: '', department: 'Sales', designation: '', branch: 'Coimbatore HQ', joining: '',
  username: '', email: '', mobile: '', password: '', confirm: '',
  role: 'Sales Executive', manager: '', status: 'Active',
  education: '', address: '', aadhar: '', age: '', gender: '',
  profilePic: '', signature: '',
};

export default function UsersList() {
  const crm = useCrm();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [fDept, setFDept] = useState('');
  const [fRole, setFRole] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fBranch, setFBranch] = useState('');
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const rows = useMemo(() => crm.users.filter((u) =>
    (!fDept || u.department === fDept) &&
    (!fRole || u.role === fRole) &&
    (!fStatus || u.status === fStatus) &&
    (!fBranch || u.branch === fBranch)
  ), [crm.users, fDept, fRole, fStatus, fBranch]);

  const kpis = useMemo(() => {
    const total = crm.users.length;
    const active = crm.users.filter((u) => u.status === 'Active').length;
    const inactive = total - active;
    const depts = new Set(crm.users.map((u) => u.department)).size;
    return { total, active, inactive, depts };
  }, [crm.users]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDrawer(true); };
  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({ ...emptyForm, ...u, password: '', confirm: '' });
    setDrawer(true);
  };

  const save = () => {
    if (!form.name.trim()) { toast.error('Name required', 'Please enter the employee name.'); return; }
    if (!form.email.trim()) { toast.error('Email required', 'Please enter a login email.'); return; }
    if (!editingId && !form.password) { toast.error('Password required', 'Please set a login password.'); return; }
    if ((form.password || form.confirm) && form.password !== form.confirm) {
      toast.error('Passwords do not match', 'Please re-enter matching passwords.');
      return;
    }
    const payload = {
      name: form.name, department: form.department, designation: form.designation, branch: form.branch,
      email: form.email, mobile: form.mobile, role: form.role, manager: form.manager,
      joining: form.joining, status: form.status, color: colorFor(form.name),
    };
    if (editingId) {
      crm.updateUser(editingId, payload);
      toast.success('User updated', `${payload.name} was saved.`);
    } else {
      const rec = crm.addUser(payload);
      toast.success('User added', `${rec.name} was created (${rec.id}).`);
    }
    setDrawer(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleStatus = (u) => {
    const next = u.status === 'Active' ? 'Inactive' : 'Active';
    crm.updateUser(u.id, { status: next });
    toast.success(`User ${next === 'Active' ? 'activated' : 'deactivated'}`, `${u.name} is now ${next}.`);
  };

  const doDelete = (u) => {
    crm.deleteUser(u.id);
    toast.success('User deleted', `${u.name} was removed.`);
  };

  const columns = [
    { key: 'id', label: 'User ID', className: 'mono', sortable: true, width: '100px' },
    {
      key: 'name', label: 'Employee', sortable: true, accessor: (r) => r.name,
      render: (r) => <span className="fw-6 text-dark">{r.name}</span>,
    },
    { key: 'department', label: 'Department', sortable: true, render: (r) => <Badge tone="tone-gray">{r.department}</Badge> },
    { key: 'branch', label: 'Branch', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (r) => <Badge tone="tone-indigo">{r.role}</Badge> },
    { key: 'manager', label: 'Reporting Manager', sortable: true, render: (r) => r.manager || '—' },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    {
      key: 'actions', label: 'Action', width: '150px',
      render: (r) => (
        <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <ActionIconButton type="view" onClick={() => setViewUser(r)} />
          <ActionIconButton type="edit" onClick={() => openEdit(r)} />
          <ActionIconButton type="status" isActive={r.status === 'Active'} onClick={() => toggleStatus(r)} />
          <ActionIconButton type="delete" onClick={() => setConfirm(r)} />
        </div>
      ),
    },
  ];

  const filters = (
    <>
      <select className="form-select form-select-sm" style={{ width: 150 }} value={fDept} onChange={(e) => setFDept(e.target.value)}>
        <option value="">All Departments</option>
        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 160 }} value={fRole} onChange={(e) => setFRole(e.target.value)}>
        <option value="">All Roles</option>
        {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 170 }} value={fBranch} onChange={(e) => setFBranch(e.target.value)}>
        <option value="">All Branches</option>
        {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 130 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
        <option value="">All Status</option>
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </>
  );

  return (
    <div className="page">
      <PageHeader
        title="User Management"
        subtitle="Manage employees, logins and access"
        icon="bi-people-fill"
        actions={
          <>
            <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-person-plus" /> Add User</button>
          </>
        }
      />



      <DataTable
        compact={true}
        columns={columns}
        rows={rows}
        keyField="id"
        loading={loading}
        searchPlaceholder="Search users, email, role..."
        searchKeys={['name', 'id', 'email', 'role', 'department', 'mobile']}
        filters={filters}
        empty={<EmptyState icon="bi-people" title="No users found" message="Try adjusting filters, or add a new user." action={<button className="btn btn-primary" onClick={openAdd}><i className="bi bi-person-plus" /> Add User</button>} />}
      />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={editingId ? 'Edit User' : 'Add User'}
        subtitle={editingId ? `Update ${form.id || ''}` : 'Create a new employee login'}
        icon="bi-person-badge"
        width={600}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg" /> Save User</button>
          </>
        }
      >
        <Section title="Employee Information" icon="bi-person-vcard">
          <div className="row">
            <Field label="Employee Name" required col={6}>
              <input className="form-control" value={form.name} onChange={set('name')} placeholder="e.g. Arun Kumar" />
            </Field>
            <Field label="Age" col={3}>
              <input type="number" className="form-control" value={form.age} onChange={set('age')} placeholder="Age" />
            </Field>
            <Field label="Gender" col={3}>
              <select className="form-select" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Department" col={6}>
              <select className="form-select" value={form.department} onChange={set('department')}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Designation" col={6}>
              <input className="form-control" value={form.designation} onChange={set('designation')} placeholder="e.g. Sales Executive" />
            </Field>
            <Field label="Branch" col={6}>
              <select className="form-select" value={form.branch} onChange={set('branch')}>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Joining Date" col={6}>
              <input type="date" className="form-control" value={form.joining} onChange={set('joining')} />
            </Field>
          </div>
        </Section>

        <Section title="Login Information" icon="bi-key">
          <div className="row">
            <Field label="Username" col={6}>
              <input className="form-control" value={form.username} onChange={set('username')} placeholder="username" />
            </Field>
            <Field label="Email" required col={6}>
              <input type="email" className="form-control" value={form.email} onChange={set('email')} placeholder="name@techspire.in" />
            </Field>
            <Field label="Mobile" col={12}>
              <input className="form-control" value={form.mobile} onChange={set('mobile')} placeholder="+91 98430 12345" />
            </Field>
            <Field label="Password" required={!editingId} col={6} hint={editingId ? 'Leave blank to keep current' : ''}>
              <input type="password" className="form-control" value={form.password} onChange={set('password')} placeholder="••••••••" />
            </Field>
            <Field label="Confirm Password" required={!editingId} col={6} error={(form.password || form.confirm) && form.password !== form.confirm ? 'Passwords do not match' : ''}>
              <input type="password" className="form-control" value={form.confirm} onChange={set('confirm')} placeholder="••••••••" />
            </Field>
          </div>
        </Section>

        <Section title="Access" icon="bi-shield-check">
          <div className="row">
            <Field label="Role" col={6}>
              <select className="form-select" value={form.role} onChange={set('role')}>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Reporting Manager" col={6}>
              <select className="form-select" value={form.manager} onChange={set('manager')}>
                <option value="">— None —</option>
                {crm.users.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </Field>
            <Field label="Status" col={6}>
              <select className="form-select" value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Personal Details" icon="bi-person-lines-fill">
          <div className="row">
            <Field label="Education / Degree" col={6}>
              <input className="form-control" value={form.education} onChange={set('education')} placeholder="e.g. B.Tech Computer Science" />
            </Field>
            <Field label="Aadhar Number" col={6}>
              <input className="form-control" value={form.aadhar} onChange={set('aadhar')} placeholder="XXXX XXXX XXXX" />
            </Field>
            <Field label="Residential Address" col={12}>
              <textarea className="form-control" rows={2} value={form.address} onChange={set('address')} placeholder="Full address..." />
            </Field>
          </div>
        </Section>


      </Drawer>

      <Drawer
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="User Details"
        subtitle={viewUser?.name || ''}
        icon="bi-person-badge"
        width={500}
      >
        {viewUser && (
          <div className="p-3">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div className="avatar avatar-xl tone-blue">
                {viewUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="mb-1">{viewUser.name}</h4>
                <div className="text-muted-c fs-13 mb-2">{viewUser.designation} · {viewUser.department}</div>
                <Badge tone={statusTone(viewUser.status)} dot>{viewUser.status}</Badge>
              </div>
            </div>

            <Section title="Contact Info" icon="bi-envelope">
              <div className="row g-3">
                <div className="col-12">
                  <div className="fs-12 text-muted-c mb-1">Email Address</div>
                  <div className="fw-6">{viewUser.email}</div>
                </div>
                <div className="col-12 mt-3">
                  <div className="fs-12 text-muted-c mb-1">Mobile Number</div>
                  <div className="fw-6 mono">{viewUser.mobile || '—'}</div>
                </div>
              </div>
            </Section>

            <Section title="Personal Details" icon="bi-person-lines-fill">
              <div className="row g-3">
                <div className="col-6">
                  <div className="fs-12 text-muted-c mb-1">Age</div>
                  <div className="fw-6">{viewUser.age || '—'}</div>
                </div>
                <div className="col-6">
                  <div className="fs-12 text-muted-c mb-1">Gender</div>
                  <div className="fw-6">{viewUser.gender || '—'}</div>
                </div>
                <div className="col-12 mt-3">
                  <div className="fs-12 text-muted-c mb-1">Education</div>
                  <div className="fw-6">{viewUser.education || '—'}</div>
                </div>
                <div className="col-12 mt-3">
                  <div className="fs-12 text-muted-c mb-1">Aadhar Number</div>
                  <div className="fw-6 mono">{viewUser.aadhar || '—'}</div>
                </div>
                <div className="col-12 mt-3">
                  <div className="fs-12 text-muted-c mb-1">Residential Address</div>
                  <div className="fw-6">{viewUser.address || '—'}</div>
                </div>
              </div>
            </Section>

            <Section title="Employment Details" icon="bi-briefcase">
              <div className="row g-3">
                <div className="col-6">
                  <div className="fs-12 text-muted-c mb-1">Employee ID</div>
                  <div className="fw-6 mono">{viewUser.id}</div>
                </div>
                <div className="col-6">
                  <div className="fs-12 text-muted-c mb-1">Branch</div>
                  <div className="fw-6">{viewUser.branch}</div>
                </div>
                <div className="col-6 mt-3">
                  <div className="fs-12 text-muted-c mb-1">Role</div>
                  <div className="fw-6">{viewUser.role}</div>
                </div>
                <div className="col-6 mt-3">
                  <div className="fs-12 text-muted-c mb-1">Reporting Manager</div>
                  <div className="fw-6">{viewUser.manager || '—'}</div>
                </div>
              </div>
            </Section>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && doDelete(confirm)}
        title="Delete User?"
        message={confirm ? `This will permanently remove ${confirm.name} (${confirm.id}).` : ''}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}

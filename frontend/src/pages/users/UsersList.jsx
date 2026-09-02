import { useState, useEffect, useMemo, useRef } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, UserCell, EmptyState, Field, Section } from '../../components/common/Ui';
import { Drawer, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { ImageCropperModal } from '../../components/common/ImageCropperModal';
import { MiniStat } from '../../components/common/PageParts';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, statusTone, colorFor } from '../../utils/format';

const STATUS_OPTIONS = ['Active', 'Inactive'];

const emptyForm = {
  name: '', companyId: '', department: '', designation: '', joining: '',
  username: '', email: '', mobile: '', password: '', confirm: '', currentPassword: '',
  role: 'Sales Executive', status: 'Active',
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
  const [viewUser, setViewUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const profilePicInputRef = useRef(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleProfilePicSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
    if (profilePicInputRef.current) profilePicInputRef.current.value = '';
  };

  const handleProfilePicCrop = async (croppedFile) => {
    setUploadingPic(true);
    const formData = new FormData();
    formData.append('file', croppedFile);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/admin/users/upload-profile-pic', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.profile_pic) {
        setForm((f) => ({ ...f, profile_pic: data.profile_pic, profilePic: data.profile_pic }));
        toast.success('Photo uploaded', 'Profile picture uploaded successfully.');
      }
    } catch (err) {
      toast.error('Upload failed', err.message || 'Could not upload profile picture');
    } finally {
      setUploadingPic(false);
      if (profilePicInputRef.current) profilePicInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const rows = useMemo(() => crm.users.filter((u) =>
    (!fDept || (u.department && u.department.toLowerCase().includes(fDept.toLowerCase()))) &&
    (!fRole || u.role === fRole) &&
    (!fStatus || u.status === fStatus)
  ), [crm.users, fDept, fRole, fStatus]);

  const kpis = useMemo(() => {
    const total = crm.users.length;
    const active = crm.users.filter((u) => u.status === 'Active').length;
    const inactive = total - active;
    const depts = new Set(crm.users.map((u) => u.department)).size;
    return { total, active, inactive, depts };
  }, [crm.users]);

  const openAdd = () => {
    setEditingId(null);
    setShowPassword(false);
    // Default to a real role that exists in the backend so the role lookup succeeds
    setForm({ ...emptyForm, role: crm.roles[0]?.name || '' });
    setDrawer(true);
  };
  const openEdit = (u) => {
    setEditingId(u.id);
    setShowPassword(false);
    setForm({ ...emptyForm, ...u, companyId: u.tenant_company_id || '', password: '', confirm: '', currentPassword: u.password_plain || '' });
    setDrawer(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name required', 'Please enter the employee name.'); return; }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) { toast.error('Valid email required', 'Please enter a valid login email (e.g. name@techspire.in).'); return; }
    
    if (!editingId && !form.password) { toast.error('Password required', 'Please set a login password.'); return; }
    if (!editingId && form.password.length < 8) {
      toast.error('Password too short', 'Password must be at least 8 characters.');
      return;
    }
    if ((form.password || form.confirm) && form.password !== form.confirm) {
      toast.error('Passwords do not match', 'Please re-enter matching passwords.');
      return;
    }
    if (!editingId && !form.role) { toast.error('Role required', 'Please select a role for this user.'); return; }
    
    const payload = {
      name: form.name, username: form.username, companyId: form.companyId, department: form.department, designation: form.designation,
      email: form.email, mobile: form.mobile, role: form.role,
      joining: form.joining, status: form.status, color: colorFor(form.name),
      password: form.password || '',
      profile_pic: form.profile_pic || form.profilePic || '',
    };
    try {
      if (editingId) {
        await crm.updateUser(editingId, payload);
        toast.success('User updated', `${payload.name} was saved.`);
      } else {
        const rec = await crm.addUser(payload);
        if (rec) toast.success('User added', `${rec.name} was created (${rec.id}).`);
      }
    } catch (err) {
      toast.error('Save failed', err?.message || 'Please check the details and try again.');
      return;
    }
    setDrawer(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleStatus = async (u) => {
    const next = u.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await crm.updateUser(u.id, { status: next });
      toast.success(`User ${next === 'Active' ? 'activated' : 'deactivated'}`, `${u.name} is now ${next}.`);
    } catch (err) {
      toast.error('Update failed', err?.message || 'Could not change status.');
    }
  };

  const doDelete = async (u) => {
    try {
      await crm.deleteUser(u.id);
      toast.success('User deleted', `${u.name} was removed.`);
      setConfirm(null);
    } catch (err) {
      toast.error('Delete failed', err?.message || 'Could not delete the user.');
    }
  };

  const columns = [
    { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
    {
      key: 'name', label: 'Employee', sortable: true, accessor: (r) => r.name,
      render: (r) => {
        const pic = r.profile_pic;
        return (
          <div className="d-flex align-items-center gap-2">
            {pic ? (
              <img src={pic.startsWith('http') ? pic : `${pic}`} alt={r.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
            ) : (
              <div className="avatar avatar-sm tone-blue" style={{ width: 28, height: 28, fontSize: 12, borderRadius: '50%' }}>
                {r.name?.charAt(0)}
              </div>
            )}
            <span className="fw-6 text-dark">{r.name}</span>
          </div>
        );
      },
    },
    {
      key: 'company_name', label: 'Company', sortable: true,
      render: (r) => {
        const comp = crm.adminCompanies?.find((c) => String(c.id) === String(r.tenant_company_id)) || crm.companies?.find((c) => String(c.id) === String(r.tenant_company_id));
        const name = r.company_name || comp?.name || '—';
        const logo = r.company_logo || comp?.logo_url;
        return (
          <div className="d-flex align-items-center gap-2">
            {logo ? (
              <img src={logo.startsWith('http') ? logo : `${logo}`} alt="Logo" style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4 }} />
            ) : (
              <i className="bi bi-building text-teal" />
            )}
            <Badge tone="tone-teal">{name}</Badge>
          </div>
        );
      }
    },
    { key: 'department', label: 'Department', sortable: true, render: (r) => <Badge tone="tone-gray">{r.department}</Badge> },
    { key: 'role', label: 'Role', sortable: true, render: (r) => <Badge tone="tone-indigo">{r.role}</Badge> },
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
      <input className="form-control form-control-sm" style={{ width: 150 }} placeholder="Filter Department..." value={fDept} onChange={(e) => setFDept(e.target.value)} />
      <select className="form-select form-select-sm" style={{ width: 160 }} value={fRole} onChange={(e) => setFRole(e.target.value)}>
        <option value="">All Roles</option>
        {crm.roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
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
        columns={columns}
        rows={rows}
        keyField="id"
        loading={loading}
        onRowClick={(r) => setViewUser(r)}
        searchPlaceholder="Search users, email, role..."
        searchKeys={['name', 'email', 'department', 'designation', 'role', 'company_name']}
        filters={filters}
        empty={<EmptyState icon="bi-people" title="No users found" message="Try adjusting filters, or add a new user." action={<button className="btn btn-primary" onClick={openAdd}><i className="bi bi-person-plus" /> Add User</button>} />}
      />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={editingId ? "Edit User" : "Add User"}
        subtitle={editingId ? `Editing ${form.name}` : "Create a new employee record"}
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
          <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
            <div className="avatar avatar-xl tone-blue position-relative" style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
              {(form.profile_pic || form.profilePic) ? (
                <img
                  src={(form.profile_pic || form.profilePic).startsWith('http') ? (form.profile_pic || form.profilePic) : `${form.profile_pic || form.profilePic}`}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 22, fontWeight: 700 }}>{form.name ? form.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <div>
              <div className="fw-6 fs-13 mb-1">Employee Profile Photo</div>
              <div className="fs-12 text-muted-c mb-2">Upload a profile picture for this employee.</div>
              <div className="d-flex align-items-center gap-3">
              <input type="file" ref={profilePicInputRef} onChange={handleProfilePicSelect} accept="image/*" style={{ display: 'none' }} />
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => profilePicInputRef.current?.click()} disabled={uploadingPic}>
                  <i className={`bi ${uploadingPic ? 'bi-arrow-repeat spin' : 'bi-camera'}`} /> {uploadingPic ? 'Uploading...' : 'Upload Photo'}
                </button>
                {(form.profile_pic || form.profilePic) && (
                  <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => setForm(f => ({ ...f, profile_pic: '', profilePic: '' }))}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>

          <div className="row">
            <Field label="Company" col={12}>
              <select className="form-select" value={form.companyId} onChange={set('companyId')}>
                <option value="">-- Use Default Company --</option>
                {crm.adminCompanies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Employee Name" required col={6}>
              <input className="form-control" value={form.name} onChange={set('name')} placeholder="e.g. Arun Kumar" />
            </Field>
            <Field label="Department" col={6}>
              <input className="form-control" value={form.department} onChange={set('department')} placeholder="e.g. Sales" />
            </Field>
            <Field label="Designation" col={6}>
              <input className="form-control" value={form.designation} onChange={set('designation')} placeholder="e.g. Sales Executive" />
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
            <Field label="Mobile" col={6}>
              <input className="form-control" value={form.mobile} onChange={set('mobile')} placeholder="+91 98430 12345" />
            </Field>
            <Field label={editingId ? "New Password" : "Password"} required={!editingId} col={6} hint={editingId ? 'Leave blank to keep current' : ''}>
              <div className="input-group">
                <input type={showPassword ? "text" : "password"} className="form-control" value={form.password} onChange={set('password')} placeholder={editingId ? "New password" : "Password"} autoComplete="new-password" />
                <button className="btn btn-outline-secondary bg-white text-muted" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`} />
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" required={!editingId} col={6} error={(form.password || form.confirm) && form.password !== form.confirm ? 'Passwords do not match' : ''}>
              <div className="input-group">
                <input type={showPassword ? "text" : "password"} className="form-control" value={form.confirm} onChange={set('confirm')} placeholder={editingId ? "Confirm new password" : "Confirm Password"} autoComplete="new-password" />
                <button className="btn btn-outline-secondary bg-white text-muted" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`} />
                </button>
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Access" icon="bi-shield-check">
          <div className="row">
            <Field label="Role" col={6}>
              <select className="form-select" value={form.role} onChange={set('role')}>
                {crm.roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Status" col={6}>
              <select className="form-select" value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
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
        {viewUser && (() => {
          const comp = crm.adminCompanies?.find((c) => String(c.id) === String(viewUser.tenant_company_id)) || crm.companies?.find((c) => String(c.id) === String(viewUser.tenant_company_id));
          const logo = viewUser.company_logo || comp?.logo_url;
          const companyName = viewUser.company_name || comp?.name || '—';

          return (
            <div className="p-3">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="position-relative">
                  {viewUser.profile_pic ? (
                    <div className="avatar avatar-xl" style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)' }}>
                      <img src={viewUser.profile_pic.startsWith('http') ? viewUser.profile_pic : `${viewUser.profile_pic}`} alt={viewUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div className="avatar avatar-xl tone-blue">
                      {viewUser.name.charAt(0)}
                    </div>
                  )}
                  {logo && (
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 2 }}>
                      <img src={logo.startsWith('http') ? logo : `${logo}`} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
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

              <Section title="Employment Details" icon="bi-briefcase">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="fs-12 text-muted-c mb-1">Company</div>
                    <div className="d-flex align-items-center gap-2 fw-6">
                      {logo ? (
                        <div style={{ width: 24, height: 24, borderRadius: 4, overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                          <img src={logo.startsWith('http') ? logo : `${logo}`} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <i className="bi bi-building text-primary" />
                      )}
                      <span>{companyName}</span>
                    </div>
                  </div>
                  <div className="col-6 mt-3">
                    <div className="fs-12 text-muted-c mb-1">Employee ID</div>
                    <div className="fw-6 mono">{viewUser.id}</div>
                  </div>
                  <div className="col-6 mt-3">
                    <div className="fs-12 text-muted-c mb-1">Role</div>
                    <div className="fw-6">{viewUser.role}</div>
                  </div>
                </div>
              </Section>
            </div>
          );
        })()}
      </Drawer>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && doDelete(confirm)}
        title="Delete User?"
        message={confirm ? `This will permanently remove ${confirm.name} (${confirm.id}).` : ''}
        confirmLabel="Delete User"
        tone="danger"
      />

      <ImageCropperModal 
        isOpen={isCropping}
        onClose={() => setIsCropping(false)}
        imageSrc={cropSrc}
        onCropCompleteAction={handleProfilePicCrop}
        aspectRatio={1}
      />
    </div>
  );
}

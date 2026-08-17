import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, Field, Section } from '../../components/common/Ui';
import { Modal, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { PORTALS } from '../../config/portals';

const blankMatrix = () => {
  const m = {};
  Object.values(PORTALS).forEach(p => {
    m[p.id] = {};
    p.nav.forEach(g => {
      g.items.forEach(i => m[p.id][i.label] = false);
    });
  });
  return m;
};

export default function Roles() {
  const { roles, addRole, updateRole, deleteRole } = useCrm();
  const toast = useToast();

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [nr, setNr] = useState({ name: '', description: '' });

  const openAdd = () => {
    setEditingId(null);
    setNr({ name: '', description: '' });
    setModal(true);
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setNr({ name: r.name, description: r.description || '' });
    setModal(true);
  };

  const saveRole = () => {
    if (!nr.name.trim()) { toast.error('Name required', 'Please enter a role name.'); return; }
    
    if (editingId) {
      updateRole(editingId, { name: nr.name, description: nr.description });
      toast.success('Role updated', 'Role details have been updated.');
    } else {
      let matrix = blankMatrix();
      addRole({ name: nr.name, description: nr.description, matrix });
      toast.success('Role created', `Proceed to permissions to configure the new role.`);
    }
    setModal(false);
    setEditingId(null);
    setNr({ name: '', description: '' });
  };

  const columns = [
    { key: 'name', label: 'Role Name', sortable: true, render: r => (
      <div className="d-flex align-items-center gap-2">
        <span style={{ width: 12, height: 12, borderRadius: 4, background: r.color, flexShrink: 0 }} />
        <span className="fw-7">{r.name}</span>
      </div>
    )},
    { key: 'description', label: 'Description', render: r => <span className="fs-13 text-muted-c">{r.description}</span> },
    { key: 'users', label: 'Assigned Users', sortable: true, render: r => <Badge tone="tone-gray">{r.users} users</Badge> },
    { key: 'actions', label: 'Action', width: '90px', render: r => (
      <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
        <ActionIconButton type="edit" onClick={() => handleEdit(r)} />
        <ActionIconButton type="delete" onClick={() => setConfirm(r)} />
      </div>
    ) },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Roles"
        subtitle="Manage user roles and their assignments"
        icon="bi-shield-lock-fill"
        actions={<button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg" /> New Role</button>}
      />

      <DataTable
        columns={columns}
        rows={roles}
        keyField="id"
        searchPlaceholder="Search roles by name..."
        searchKeys={['name', 'description']}
        pageSize={10}
      />

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? 'Edit Role' : 'Create New Role'}
        subtitle={editingId ? 'Update role details' : 'Define a role and start from a template'}
        icon={editingId ? 'bi-pencil' : 'bi-shield-plus'}
        width={520}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveRole}><i className="bi bi-check-lg" /> {editingId ? 'Save Changes' : 'Create Role'}</button>
          </>
        }
      >
        <Section title="Role Details" icon="bi-shield">
          <div className="row">
            <Field label="Role Name" required col={12}>
              <input className="form-control" value={nr.name} onChange={(e) => setNr((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. Regional Manager" />
            </Field>
            <Field label="Description" col={12}>
              <textarea className="form-control" rows={2} value={nr.description} onChange={(e) => setNr((s) => ({ ...s, description: e.target.value }))} placeholder="What can this role do?" />
            </Field>
          </div>
        </Section>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          deleteRole(confirm.id);
          toast.success('Role deleted', `${confirm.name} has been removed.`);
          setConfirm(null);
        }}
        title="Delete Role?"
        message={confirm ? `This will permanently remove the ${confirm.name} role.` : ''}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}

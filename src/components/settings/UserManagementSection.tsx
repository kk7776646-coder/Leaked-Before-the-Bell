import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  User,
  UserPlus,
  Shield,
  Key,
  Ban,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Lock,
  Loader,
  Search,
  Check,
  Power,
  Unlock,
} from 'lucide-react';
import { api, SafeUser, UserRole } from '../../services/api';

export const UserManagementSection: React.FC = () => {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOrganization, setNewOrganization] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('REVIEWER');

  // Selected User action modals / state
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [activeModal, setActiveModal] = useState<'edit-role' | 'reset-password' | null>(null);
  
  // Modal forms
  const [editRoleValue, setEditRoleValue] = useState<UserRole>('REVIEWER');
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to load user roster.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newPassword) {
      setFeedback({ type: 'error', message: 'Name, email and password are required.' });
      return;
    }

    setActionLoading('create');
    setFeedback(null);
    try {
      await api.createUser({
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        organization: newOrganization.trim() || undefined,
        role: newRole,
      });

      setFeedback({
        type: 'success',
        message: `Successfully provisioned ${newFullName} as ${newRole}.`,
      });

      // Clear form
      setNewFullName('');
      setNewEmail('');
      setNewOrganization('');
      setNewPassword('');
      setNewRole('REVIEWER');
      setShowCreateForm(false);
      
      await fetchUsers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to provision user.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (user: SafeUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setActionLoading(`status-${user.id}`);
    setFeedback(null);
    try {
      await api.updateUser(user.id, { status: nextStatus });
      setFeedback({
        type: 'success',
        message: `Successfully ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated/suspended'} user ${user.fullName}. All active sessions revoked.`,
      });
      await fetchUsers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update user status.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading('update-role');
    setFeedback(null);
    try {
      await api.updateUser(selectedUser.id, { role: editRoleValue });
      setFeedback({
        type: 'success',
        message: `Successfully promoted/demoted ${selectedUser.fullName} to ${editRoleValue}.`,
      });
      setActiveModal(null);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update user role.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !resetPasswordValue) return;

    setActionLoading('reset-password');
    setFeedback(null);
    try {
      await api.updateUser(selectedUser.id, { password: resetPasswordValue });
      setFeedback({
        type: 'success',
        message: `Successfully changed password for ${selectedUser.fullName}. Existing sessions revoked.`,
      });
      setActiveModal(null);
      setSelectedUser(null);
      setResetPasswordValue('');
      await fetchUsers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to reset password.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeSessions = async (user: SafeUser) => {
    setActionLoading(`revoke-${user.id}`);
    setFeedback(null);
    try {
      await api.revokeUserSessions(user.id);
      setFeedback({
        type: 'success',
        message: `Revoked all active sessions for ${user.fullName}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to revoke active sessions.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter roster based on search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.organization && u.organization.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards or Header Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            User Accounts & Permissions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control platform access, manage authorization roles, and audit security tokens.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 h-9"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision User</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400'
              : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30 text-rose-800 dark:text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          )}
          <span className="font-medium leading-normal">{feedback.message}</span>
        </div>
      )}

      {/* CREATE NEW USER FORM */}
      {showCreateForm && (
        <Card
          title="Provision New Authorized Account"
          subtitle="All new accounts must comply with the strict password complexity and background validation criteria."
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur Vance"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@exam-board.gov"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Organization / Regulatory Unit
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Exam Security Authority"
                    value={newOrganization}
                    onChange={(e) => setNewOrganization(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Initial Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Choose a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Security Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  <option value="VIEWER">Viewer (Read-only alerts, reports)</option>
                  <option value="REVIEWER">Reviewer (Triage alerts, comment, review queue)</option>
                  <option value="SECURITY_OFFICER">Security Officer (All triage + system settings read)</option>
                  <option value="ADMIN">Administrator (Full admin control, manage users)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateForm(false)}
                disabled={actionLoading === 'create'}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={actionLoading === 'create'}
                className="flex items-center gap-1.5"
              >
                {actionLoading === 'create' ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Provisioning...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create User</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* FILTER SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter user roster by name, email, or organization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {/* USER ROSTER TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <span>Retrieving authorized user accounts...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No authorized users matching filters were found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {u.organization || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Role Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setEditRoleValue(u.role);
                            setActiveModal('edit-role');
                          }}
                          title="Change user security role"
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs hover:border-blue-300 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setActiveModal('reset-password');
                          }}
                          title="Change user password"
                          className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs hover:border-amber-300 cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Revoke Sessions Button */}
                        <button
                          type="button"
                          onClick={() => handleRevokeSessions(u)}
                          disabled={actionLoading === `revoke-${u.id}`}
                          title="Instantly revoke all active sessions"
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs hover:border-rose-300 disabled:opacity-40 cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>

                        {/* Enable/Disable Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading === `status-${u.id}`}
                          title={u.status === 'ACTIVE' ? 'Suspend/Lockout User' : 'Unsuspend/Activate User'}
                          className={`p-1.5 rounded-lg border shadow-2xs cursor-pointer transition-all ${
                            u.status === 'ACTIVE'
                              ? 'text-emerald-600 hover:text-rose-600 hover:border-rose-300 dark:text-emerald-400'
                              : 'text-rose-600 hover:text-emerald-600 hover:border-emerald-300 dark:text-rose-400'
                          } bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* EDIT ROLE MODAL */}
      {activeModal === 'edit-role' && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Update Security Role
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Change permission model for <strong>{selectedUser.fullName}</strong> ({selectedUser.email}).
              </p>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Security Role
                </label>
                <select
                  value={editRoleValue}
                  onChange={(e) => setEditRoleValue(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="VIEWER">Viewer (Read-only alerts, reports)</option>
                  <option value="REVIEWER">Reviewer (Triage alerts, comment, review queue)</option>
                  <option value="SECURITY_OFFICER">Security Officer (All triage + system settings read)</option>
                  <option value="ADMIN">Administrator (Full admin control, manage users)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedUser(null);
                  }}
                  disabled={actionLoading === 'update-role'}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={actionLoading === 'update-role'}
                  className="flex items-center gap-1.5"
                >
                  {actionLoading === 'update-role' ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {activeModal === 'reset-password' && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Reset Account Password
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Establish a new authorized passcode credentials for <strong>{selectedUser.fullName}</strong>. Existing sessions will be terminated.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Provide a strong new password"
                    value={resetPasswordValue}
                    onChange={(e) => setResetPasswordValue(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedUser(null);
                    setResetPasswordValue('');
                  }}
                  disabled={actionLoading === 'reset-password'}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={actionLoading === 'reset-password'}
                  className="flex items-center gap-1.5"
                >
                  {actionLoading === 'reset-password' ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Key className="w-3.5 h-3.5" />
                  )}
                  <span>Change Password</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

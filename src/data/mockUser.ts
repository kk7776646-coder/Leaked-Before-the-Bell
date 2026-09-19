export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  avatarUrl?: string;
  initials: string;
}

export const mockCurrentUser: UserProfile = {
  id: 'usr_admin_01',
  name: 'Admin',
  role: 'Administrator',
  email: 'admin@example.com',
  status: 'Active',
  initials: 'AD',
};

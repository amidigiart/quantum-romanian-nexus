
import React from 'react';
import { UserProfile } from '@/components/UserProfile';
import { UserPreferencesSettings } from '@/components/UserPreferencesSettings';

export const UserSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <UserProfile />
      <UserPreferencesSettings />
    </div>
  );
};

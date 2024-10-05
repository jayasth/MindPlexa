'use client';

import { Suspense } from 'react';
import SettingsContent from '@/ui/settings/SettingsContent';

function SettingsWrapper() {
  return <SettingsContent />;
}

export default function Settings() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsWrapper />
    </Suspense>
  );
}

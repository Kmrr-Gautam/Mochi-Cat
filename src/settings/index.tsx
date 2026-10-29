// ============================================================
// Mochi – Settings App Entry Point
// ============================================================
import React from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsApp } from './SettingsApp';

const isOnboarding = window.location.pathname.includes('onboarding') ||
  document.getElementById('onboarding-root') !== null;

const rootEl = document.getElementById('settings-root') ||
  document.getElementById('onboarding-root');

if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<SettingsApp isOnboarding={isOnboarding} />);
}

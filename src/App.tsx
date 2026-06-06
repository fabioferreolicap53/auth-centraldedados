/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './pages/AuthScreen';
import { ResetPasswordScreen } from './pages/ResetPasswordScreen';
import { VerifyEmailScreen } from './pages/VerifyEmailScreen';
import { ConfirmEmailChangeScreen } from './pages/ConfirmEmailChangeScreen';
import { getStoredAuthTarget, getLoginUrlForApp } from './lib/authTarget';

const AUTH_ACTION_SEGMENTS = [
  'reset-password',
  'confirm-password-reset',
  'verify-email',
  'confirm-verification',
  'confirm-email-change',
];

const isAuthActionRoute = (value: string) => {
  const normalized = value.toLowerCase();
  return AUTH_ACTION_SEGMENTS.some((segment) => normalized.includes(segment));
};

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Se houver uma rota de ação (reset de senha, verificação de e-mail, etc)
  if (isAuthActionRoute(currentPath)) {
    if (currentPath.includes('reset-password') || currentPath.includes('confirm-password-reset')) {
      return <ResetPasswordScreen />;
    }
    if (currentPath.includes('verify-email') || currentPath.includes('confirm-verification')) {
      return <VerifyEmailScreen />;
    }
    if (currentPath.includes('confirm-email-change')) {
      return <ConfirmEmailChangeScreen />;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Se logado, tenta redirecionar para o app de origem ou mostra tela de sucesso
  const { appKey } = getStoredAuthTarget();
  const redirectUrl = getLoginUrlForApp(appKey);

  if (redirectUrl && redirectUrl !== '/') {
    window.location.href = redirectUrl;
    return null;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Autenticado com Sucesso</h1>
        <p className="text-gray-600 mb-8">
          Você está conectado como <span className="font-semibold">{user.email}</span>.
        </p>
        <button
          onClick={() => {
            const { logout } = useAuth();
            logout();
          }}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


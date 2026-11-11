import React from 'react';
import LoginPage from './LoginPage';

export interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: any) => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'TEACHER' | 'STUDENT' | 'SUPER_ADMIN';
}

/**
 * TeacherAuthModal - Directly reuses the canonical LoginPage component in modal mode.
 * Guarantees identical fields, labels, validation, visual design, and zero duplicate code.
 */
export default function TeacherAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  initialRole = 'TEACHER'
}: TeacherAuthModalProps) {
  if (!isOpen) return null;

  return (
    <LoginPage
      isModal={true}
      onClose={onClose}
      onLoginSuccess={onSuccess}
      initialRoleTab={initialRole}
      initialTeacherView={initialMode === 'register' ? 'REGISTER' : 'LOGIN'}
      initialStudentView={initialMode === 'register' ? 'REGISTER' : 'LOGIN'}
    />
  );
}

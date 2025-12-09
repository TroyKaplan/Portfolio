import React, { useState } from 'react';
import ErrorMessage from '../../shared/components/ErrorMessage';
import { updateEmail, changePassword } from '../api';
import axios from 'axios';

interface ProfileActionsProps {
  email: string | null;
  onEmailUpdate: (newEmail: string) => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ email, onEmailUpdate }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<{ message: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(newEmail)) {
      setError({ message: 'Please enter a valid email address' });
      return;
    }
    try {
      await updateEmail(newEmail);
      onEmailUpdate(newEmail);
      setShowEmailForm(false);
      setSuccess('Email updated successfully');
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({ message: error.response?.data?.message || 'Failed to update email' });
      } else if (error instanceof Error) {
        setError({ message: error.message });
      } else {
        setError({ message: 'An unexpected error occurred' });
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError({ message: 'Passwords do not match' });
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setShowPasswordForm(false);
      setSuccess('Password changed successfully');
      setError(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({ message: error.response?.data?.message || 'Failed to change password' });
      } else if (error instanceof Error) {
        setError({ message: error.message });
      } else {
        setError({ message: 'An unexpected error occurred' });
      }
    }
  };

  return (
    <div className="profile-actions">
      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}
      {success && <div className="success-message">{success}</div>}

      {!email && !showEmailForm && (
        <button 
          className="update-button"
          onClick={() => setShowEmailForm(true)}
        >
          Update Email
        </button>
      )}

      {showEmailForm && (
        <form onSubmit={handleEmailUpdate} className="update-form">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setShowEmailForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <button 
        className="change-password-button"
        onClick={() => setShowPasswordForm(true)}
      >
        Change Password
      </button>

      {showPasswordForm && (
        <form onSubmit={handlePasswordChange} className="update-form">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          <div className="form-actions">
            <button type="submit">Change Password</button>
            <button type="button" onClick={() => setShowPasswordForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileActions;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { VerificationCodePage } from './VerificationCodePage';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { AxiosError } from 'axios';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return;
    }

    setLoading(true);
    
    console.log(`[FORGOT] Sending verification code to: ${email}`);
    console.log(`[FORGOT] Email length:`, email.length);
    console.log(`[FORGOT] Email type:`, typeof email);
    
    try {
      // Send verification code to the user's email
      await authService.requestPasswordReset(email);
      console.log(`[FORGOT] Verification code sent successfully to: ${email}`);
      // Set showVerification to true to immediately show the verification code page
      setShowVerification(true);
      // We don't need isSubmitted anymore since we're showing the verification page directly
    } catch (error: any) {
      const err = error as  AxiosError<{message?: string}>
      console.error('[FORGOT] Password reset error:', err.response?.data || error.message);
      toast.error(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  // If we're showing the verification code page, render that instead
  if (showVerification) {
    return (
      <VerificationCodePage 
        email={email} 
      />
    );
  }

  // This is the old "check your email" view, but we don't need it anymore
  // since we immediately show the verification code page after sending the code

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          name="email"
          type="email"
          label="Email address"
          value={email}
          onChange={handleEmailChange}
          error={emailError}
          autoComplete="email"
          placeholder="Enter your email"
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Send verification code
        </Button>
      </form>

      <div className="text-center">
        <Link 
          to="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
};
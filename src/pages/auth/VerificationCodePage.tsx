import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { useUI } from '../../hooks/useUI';

interface VerificationCodePageProps {
  email: string;
}

export const VerificationCodePage: React.FC<VerificationCodePageProps> = ({ email}) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { theme, toggleTheme } = useUI();

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{1,4}$/.test(pasteData)) {
      const newCode = pasteData
        .split('')
        .concat(Array(4 - pasteData.length).fill(''))
        .slice(0, 4);
      setCode(newCode as string[]);
      // Focus last filled input
      const lastFilledIndex = pasteData.length - 1;
      if (lastFilledIndex >= 0 && inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all fields are filled
    if (code.some(digit => !digit)) {
      toast.error('Please enter the complete verification code');
      return;
    }

    const codeString = code.join('');
    setLoading(true);
    console.log(`[UI] Code array:`, code);
    console.log(`[UI] Code string:`, codeString);

    try {
      // Verify the code with the API
      await authService.verifyForgotPasswordOtp(email, codeString);
      console.log(`[UI] Code verification successful for ${codeString}`);
      toast.success('Code verification successful');

      // ✅ Redirect to Reset Password page
      navigate('/reset-password/verified', { state: { email } });
    } catch (error: any) {
      console.error(`[UI] Error type:`, typeof error);
      console.error(`[UI] Error keys:`, Object.keys(error));
      toast.error(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setResending(true);
    console.log(`[RESEND] Resending code to: ${email}`);

    try {
      // Send a new verification code
      await authService.resendOtp(email);
      setResendTimer(30);
      toast.success('Verification code resent successfully!');
      // Clear the previous code
      setCode(['', '', '', '']);
      // Focus the first input
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error(`[RESEND] Failed to resend code to ${email}:`, error);
      toast.error(error.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleUseDifferentEmail = () => {
    // Reset the form state and navigate back to the forgot password page
    setCode(['', '', '', '']);
    // Navigate back to the forgot password page with a flag to reset the form
    navigate('/forgot-password', { state: { resetForm: true } });
  };

  // Timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <div 
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="1.5" 
            stroke="currentColor" 
            className="h-5 w-5 text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? (
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" 
              />
            ) : (
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" 
              />
            )}
          </svg>
        </div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LMS Platform</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learning Management System</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Check your email</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We've sent a 4-digit code to <strong>{email}</strong>
              </p>
              {/* Demo hint for John Student */}
              {email === 'john.student@example.com' && (
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  Demo user: Use code <strong>1234</strong> to proceed
                </p>
              )}
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleInputChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ))}
                </div>
                {code.some(digit => !digit) && (
                  <p className="mt-2 text-sm text-red-600">Please enter all 4 digits</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={code.some(digit => !digit)}
              >
                Verify Code
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Didn’t receive the code?{' '}
                  <button
                    onClick={handleResendCode}
                    disabled={resendTimer > 0 || resending}
                    className={`font-medium ${
                      resendTimer > 0 || resending
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-500 dark:text-blue-400'
                    }`}
                  >
                    {resending
                      ? 'Resending...'
                      : `Resend code ${resendTimer > 0 ? `(${resendTimer}s)` : ''}`}
                  </button>
                </p>
                <p className="mt-2">
                  <button
                    onClick={handleUseDifferentEmail}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Use a different email
                  </button>
                </p>
              </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
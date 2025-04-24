import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Verify() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [signupData, setSignupData] = useState<any>(null);

  useEffect(() => {
    // Get signup data from session storage
    const data = sessionStorage.getItem('signupData');
    if (!data) {
      navigate('/signup');
      return;
    }
    setSignupData(JSON.parse(data));

    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete verification code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('verify_token', {
        p_email: signupData.email,
        p_token: code,
      });

      if (error) throw error;

      // Clear session storage
      sessionStorage.removeItem('signupData');

      toast.success('Verification successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('create_verification_token', {
        p_email: signupData.email,
        p_phone: signupData.phone,
      });

      if (error) throw error;

      toast.success('New verification code sent');
      setCountdown(30);
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 6-digit code sent to your email and phone
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1 flex justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={loading || countdown > 0}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                {countdown > 0 ? (
                  `Resend code in ${countdown}s`
                ) : (
                  'Resend verification code'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
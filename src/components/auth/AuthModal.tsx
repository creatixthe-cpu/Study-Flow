import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Sparkles, 
  LogOut, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { authService } from '../../services/firebase';
import { AuthUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onAuthSuccess?: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [authTab, setAuthTab] = useState<'google' | 'phone'>('google');
  
  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  // Countdown for OTP
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await authService.signInWithGoogle();
      setSuccessMessage(`Signed in as ${user.displayName || user.email}!`);
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setErrorMessage(err.message || 'Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMessage('Please enter a valid phone number with country code (e.g. +1 555 123 4567)');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setDemoCodeHint(null);

    try {
      // Initialize reCAPTCHA if in real Firebase mode
      const recaptchaVerifier = await authService.setupRecaptcha('recaptcha-container');
      const result = await authService.sendPhoneOtp(phoneNumber.trim(), recaptchaVerifier);
      
      setOtpSent(true);
      setResendTimer(45);
      if (result.demoCode) {
        setDemoCodeHint(result.demoCode);
      }
      setSuccessMessage('Verification code sent successfully!');
    } catch (err: any) {
      console.error('Phone OTP error:', err);
      setErrorMessage(err.message || 'Failed to send OTP code. Check your phone number format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the verification code received on your phone.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await authService.verifyPhoneOtp(otpCode.trim());
      setSuccessMessage('Phone number verified successfully!');
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setErrorMessage(err.message || 'Invalid code. Please re-check and try again.');
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setOtpSent(false);
      setOtpCode('');
      setPhoneNumber('');
      setDemoCodeHint(null);
      setSuccessMessage('Signed out successfully.');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage('Failed to sign out.');
      setIsLoading(false);
    }
  };

  const isFirebaseLive = authService.isFirebaseReady();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentUser ? 'Your Student Account' : 'Sign in to StudyFlow'}
    >
      <div className="space-y-5">
        {/* Invisible reCAPTCHA container for Firebase */}
        <div id="recaptcha-container" />

        {/* If user is ALREADY signed in */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-600/30 overflow-hidden">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <span>{(currentUser.displayName || 'S')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white truncate">
                    {currentUser.displayName || 'Authenticated Student'}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {currentUser.email || currentUser.phoneNumber || 'User ID: ' + currentUser.uid.slice(0, 8)}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-purple-300">
                  <ShieldCheck size={13} />
                  <span className="capitalize">Authenticated via {currentUser.providerId}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs sm:text-sm transition-all"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                Back to App
              </button>
            </div>
          </div>
        ) : (
          /* Sign-in Flow */
          <div className="space-y-4">
            {/* Mode selection tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('google');
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  authTab === 'google'
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Google Sign-In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab('phone');
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  authTab === 'phone'
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone size={14} />
                <span>Phone with OTP</span>
              </button>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Tab */}
            {authTab === 'google' && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Sign in seamlessly with your Google account to sync study sessions, planner milestones, and daily streaks.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {/* Official Google G SVG icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
                </button>
              </div>
            )}

            {/* Phone Tab */}
            {authTab === 'phone' && (
              <div className="space-y-4 py-1">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Mobile Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1 555 123 4567 or +91 9876543210"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500 font-mono placeholder:text-slate-500"
                        />
                        <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Include country code prefix (e.g. +1 for US/CA, +91 for India).
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                      <span>{isLoading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    {demoCodeHint && (
                      <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-200">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <Sparkles size={13} className="text-purple-400" />
                          <span>Simulated Sandbox OTP</span>
                        </div>
                        <span>Your test verification code is: </span>
                        <strong className="font-mono text-white text-sm bg-purple-900/60 px-2 py-0.5 rounded border border-purple-400/40">
                          {demoCodeHint}
                        </strong>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Enter 6-Digit Code
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                        >
                          Change Number
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          required
                          autoFocus
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-lg tracking-widest font-mono text-center focus:outline-none focus:border-purple-500"
                        />
                        <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                      <span>{isLoading ? 'Verifying...' : 'Verify & Sign In'}</span>
                      <CheckCircle2 size={16} />
                    </button>

                    <div className="flex items-center justify-center pt-2">
                      <button
                        type="button"
                        disabled={resendTimer > 0 || isLoading}
                        onClick={handleSendOtp}
                        className="text-xs text-slate-400 hover:text-white disabled:opacity-40 font-medium"
                      >
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP Code'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Privacy & Minimum Info Notice */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
              <span>Minimal data stored: Auth token & User ID</span>
              <button
                type="button"
                onClick={() => setShowConfigHelper(!showConfigHelper)}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
              >
                <Info size={12} />
                <span>Firebase setup info</span>
              </button>
            </div>

            {/* Firebase Config Helper Drawer */}
            {showConfigHelper && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Firebase Integration Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isFirebaseLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isFirebaseLive ? 'Production Firebase Active' : 'Sandbox Demo Mode Active'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  To connect your own Firebase project, configure your environment variables (in <code className="text-purple-300">.env</code> or AI Studio Secrets) with:
                  <br />
                  <code className="text-[10px] text-purple-300 block bg-black/40 p-1.5 rounded mt-1 overflow-x-auto">
                    VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID
                  </code>
                  And enable <strong>Google</strong> & <strong>Phone</strong> sign-in providers in Firebase Authentication Console.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

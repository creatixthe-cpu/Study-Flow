import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { AuthUser } from '../types';

// Clean string inputs (remove quotes, whitespace, trailing commas from injected secrets)
const clean = (val?: string): string => {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["']+|["',]+$/g, '').trim();
};

// Read config from Vite environment variables with user defaults
const metaEnv = (import.meta as any).env || {};
const rawApiKey = clean(metaEnv.VITE_FIREBASE_API_KEY) || "AIzaSyCyOs6YgUgfDd0yH656DMwJibwU7R_RzwE";
const rawAuthDomain = clean(metaEnv.VITE_FIREBASE_AUTH_DOMAIN) || "study-flow-6bcf0.firebaseapp.com";
const rawProjectId = clean(metaEnv.VITE_FIREBASE_PROJECT_ID) || "study-flow-6bcf0";
const rawStorageBucket = clean(metaEnv.VITE_FIREBASE_STORAGE_BUCKET) || "study-flow-6bcf0.firebasestorage.app";
const rawSenderId = clean(metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID) || "491693749742";
const rawAppId = clean(metaEnv.VITE_FIREBASE_APP_ID);
// If appId is missing or accidentally set to the G- measurementId, use the valid web appId
const validAppId = (rawAppId && !rawAppId.startsWith('G-')) 
  ? rawAppId 
  : "1:491693749742:web:daff988c8d379ed2984aff";
const rawMeasurementId = clean(metaEnv.VITE_FIREBASE_MEASUREMENT_ID) || "G-4BGNE952GJ";

export const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: rawAuthDomain,
  projectId: rawProjectId,
  storageBucket: rawStorageBucket,
  messagingSenderId: rawSenderId,
  appId: validAppId,
  measurementId: rawMeasurementId
};

const isConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId
);

export let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let analytics: Analytics | null = null;

if (isConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);

    // Initialize Analytics if supported in current browser environment
    if (typeof window !== 'undefined') {
      isAnalyticsSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch((err) => {
        console.debug('Firebase Analytics initialization notice:', err);
      });
    }
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

// Local storage key for fallback/persisted session
const LOCAL_AUTH_KEY = 'studyflow_auth_user';

function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    phoneNumber: user.phoneNumber,
    displayName: user.displayName || (user.phoneNumber ? `Student (${user.phoneNumber.slice(-4)})` : 'StudyFlow Student'),
    photoURL: user.photoURL,
    providerId: user.providerData?.[0]?.providerId || 'firebase',
  };
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];
  private confirmationResult: ConfirmationResult | null = null;
  private simulatedOtpCode: string = '123456';

  constructor() {
    // Attempt to load cached user if available
    try {
      const saved = localStorage.getItem(LOCAL_AUTH_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    if (auth) {
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          this.currentUser = mapFirebaseUser(firebaseUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(this.currentUser));
        } else {
          // If real firebase is active and user logged out
          if (this.currentUser?.providerId !== 'demo') {
            this.currentUser = null;
            localStorage.removeItem(LOCAL_AUTH_KEY);
          }
        }
        this.notifyListeners();
      });
    }
  }

  public isFirebaseReady(): boolean {
    return isConfigured && auth !== null;
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  // --- Google Sign-In ---
  public async signInWithGoogle(): Promise<AuthUser> {
    if (this.isFirebaseReady() && auth) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const user = mapFirebaseUser(result.user);
        this.currentUser = user;
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
        this.notifyListeners();
        return user;
      } catch (err: any) {
        console.error('Firebase Google Sign-In error:', err);
        if (err.code === 'auth/unauthorized-domain') {
          throw new Error(`Domain not authorized. Please add this preview domain to Firebase Console > Authentication > Settings > Authorized domains.`);
        } else if (err.code === 'auth/operation-not-allowed') {
          throw new Error('Google Sign-In is not enabled in Firebase Console. Go to Authentication > Sign-in method and enable Google.');
        } else if (err.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-in cancelled by closing the popup.');
        }
        throw err;
      }
    }

    // Demo/Sandbox fallback for preview and testing without pre-configured API keys
    const mockUser: AuthUser = {
      uid: 'google-demo-' + Date.now(),
      displayName: 'Alex Rivera (Google)',
      email: 'alex.rivera@campus.edu',
      phoneNumber: null,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      providerId: 'google.com',
    };
    this.currentUser = mockUser;
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockUser));
    this.notifyListeners();
    return mockUser;
  }

  // --- Phone OTP Sign-In ---
  public async setupRecaptcha(containerId: string): Promise<RecaptchaVerifier | null> {
    if (!this.isFirebaseReady() || !auth) return null;

    try {
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });
      return verifier;
    } catch (err) {
      console.warn('reCAPTCHA init warning:', err);
      return null;
    }
  }

  public async sendPhoneOtp(phoneNumber: string, appVerifier?: RecaptchaVerifier | null): Promise<{ confirmationNeeded: boolean; demoCode?: string }> {
    if (!phoneNumber || phoneNumber.length < 8) {
      throw new Error('Please enter a valid phone number with country code (e.g. +1 555 123 4567)');
    }

    if (this.isFirebaseReady() && auth && appVerifier) {
      try {
        this.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        return { confirmationNeeded: true };
      } catch (err: any) {
        console.error('Firebase Phone OTP error:', err);
        if (err.code === 'auth/operation-not-allowed') {
          throw new Error('Phone sign-in is not enabled in Firebase Console. Enable "Phone" under Authentication > Sign-in method.');
        } else if (err.code === 'auth/invalid-phone-number') {
          throw new Error('The phone number is formatted incorrectly. Please include country code (e.g. +1 555 123 4567 or +91 9876543210).');
        } else if (err.code === 'auth/too-many-requests') {
          throw new Error('Too many requests sent. Please wait a few moments or try again later.');
        }
        throw err;
      }
    }

    // Interactive Demo / Sandbox Mode
    this.simulatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.confirmationResult = {
      confirm: async (code: string) => {
        if (code !== this.simulatedOtpCode && code !== '123456') {
          throw new Error('Invalid verification code. Please check and try again.');
        }
        const user: AuthUser = {
          uid: 'phone-demo-' + Date.now(),
          displayName: `Student (${phoneNumber.slice(-4)})`,
          email: null,
          phoneNumber: phoneNumber,
          photoURL: null,
          providerId: 'phone',
        };
        this.currentUser = user;
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
        this.notifyListeners();
        return { user: user as unknown as FirebaseUser, providerId: 'phone', operationType: 'signIn' };
      }
    } as unknown as ConfirmationResult;

    return { 
      confirmationNeeded: true, 
      demoCode: this.simulatedOtpCode 
    };
  }

  public async verifyPhoneOtp(code: string): Promise<AuthUser> {
    if (!code || code.length < 4) {
      throw new Error('Please enter the complete verification code.');
    }

    if (!this.confirmationResult) {
      throw new Error('No OTP request found. Please request a new verification code.');
    }

    const result = await this.confirmationResult.confirm(code);
    const user: AuthUser = this.isFirebaseReady() 
      ? mapFirebaseUser(result.user) 
      : (result.user as unknown as AuthUser);

    this.currentUser = user;
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
    this.notifyListeners();
    return user;
  }

  // --- Sign Out ---
  public async signOut(): Promise<void> {
    if (this.isFirebaseReady() && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase signout error:', err);
      }
    }

    this.currentUser = null;
    this.confirmationResult = null;
    localStorage.removeItem(LOCAL_AUTH_KEY);
    this.notifyListeners();
  }
}

export const authService = new AuthService();

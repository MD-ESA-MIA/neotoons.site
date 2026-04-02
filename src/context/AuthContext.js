import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useClerk, useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
const AuthContext = createContext(undefined);
const toRole = (value) => {
    return value === 'owner' || value === 'admin' || value === 'member' ? value : 'member';
};
const toPlan = (value) => {
    return value === 'free' || value === 'pro' || value === 'studio' || value === 'premium' ? value : 'free';
};
const toUsername = (email, metadataUsername) => {
    if (metadataUsername && metadataUsername.trim()) {
        return metadataUsername.trim().toLowerCase();
    }
    const localPart = email.split('@')[0] || 'user';
    return localPart.toLowerCase().replace(/[^a-z0-9_]/g, '_');
};
const buildUser = (raw) => {
    const email = raw?.primaryEmailAddress?.emailAddress || raw?.emailAddresses?.[0]?.emailAddress || '';
    const fullName = raw?.fullName || raw?.firstName || 'Creator';
    const metadata = raw?.publicMetadata || {};
    const joined = raw?.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString();
    const lastSeen = raw?.lastSignInAt ? new Date(raw.lastSignInAt).toISOString() : new Date().toISOString();
    return {
        id: raw.id,
        name: fullName,
        displayName: metadata.displayName || fullName,
        username: toUsername(email, metadata.username || null),
        email,
        role: toRole(metadata.role),
        plan: toPlan(metadata.plan),
        credits: typeof metadata.credits === 'number' ? metadata.credits : 20,
        usage: typeof metadata.usage === 'number' ? metadata.usage : 0,
        joinedAt: joined.split('T')[0],
        createdAt: joined,
        lastActive: lastSeen,
        generationCount: typeof metadata.generationCount === 'number' ? metadata.generationCount : 0,
        avatar: raw.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || email || 'user')}`,
        followers: [],
        following: [],
        notificationSettings: { email: true, push: true, marketing: false },
        privacySettings: { profilePublic: true, showActivity: true },
    };
};
export const AuthProvider = ({ children }) => {
    const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
    const { getToken } = useClerkAuth();
    const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
    const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
    const { signOut } = useClerk();
    const [currentUser, setCurrentUser] = useState(null);
    const [isWorking, setIsWorking] = useState(false);
    const [requiresEmailVerification, setRequiresEmailVerification] = useState(false);
    const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
    const isLoading = !isUserLoaded || isWorking;
    useEffect(() => {
        if (!isUserLoaded) {
            return;
        }
        if (!isSignedIn || !user) {
            setCurrentUser(null);
            return;
        }
        try {
            setCurrentUser(buildUser(user));
        }
        catch (_error) {
            setCurrentUser(null);
        }
    }, [isUserLoaded, isSignedIn, user]);
    useEffect(() => {
        const syncClerkToken = async () => {
            if (!isUserLoaded || !isSignedIn) {
                localStorage.removeItem('neotoons_clerk_token');
                return;
            }
            try {
                const token = await getToken();
                if (token) {
                    localStorage.setItem('neotoons_clerk_token', token);
                }
            }
            catch (_error) {
                localStorage.removeItem('neotoons_clerk_token');
            }
        };
        void syncClerkToken();
    }, [isUserLoaded, isSignedIn, getToken]);
    const login = async (email, password) => {
        if (!isSignInLoaded) {
            throw new Error('Authentication is still loading. Please try again.');
        }
        setIsWorking(true);
        try {
            const attempt = await signIn.create({
                identifier: email,
                password,
            });
            if (attempt.status !== 'complete' || !attempt.createdSessionId) {
                throw new Error('Unable to complete sign in.');
            }
            await setActive?.({ session: attempt.createdSessionId });
            setRequiresEmailVerification(false);
            setPendingVerificationEmail(null);
        }
        finally {
            setIsWorking(false);
        }
    };
    const signup = async (name, email, password) => {
        if (!isSignUpLoaded) {
            throw new Error('Authentication is still loading. Please try again.');
        }
        setIsWorking(true);
        try {
            const username = `${name.toLowerCase().replace(/\s+/g, '_')}${Math.floor(Math.random() * 1000)}`;
            await signUp.create({
                emailAddress: email,
                password,
                unsafeMetadata: {
                    displayName: name,
                    username,
                    role: 'member',
                    plan: 'free',
                },
            });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerificationEmail(email);
            setRequiresEmailVerification(true);
        }
        finally {
            setIsWorking(false);
        }
    };
    const verifyEmailCode = async (code) => {
        if (!isSignUpLoaded) {
            throw new Error('Verification is still loading. Please try again.');
        }
        setIsWorking(true);
        try {
            const verification = await signUp.attemptEmailAddressVerification({ code });
            if (verification.status !== 'complete' || !verification.createdSessionId) {
                throw new Error('Invalid or expired verification code.');
            }
            await setActive?.({ session: verification.createdSessionId });
            setRequiresEmailVerification(false);
            setPendingVerificationEmail(null);
        }
        finally {
            setIsWorking(false);
        }
    };
    const logout = async () => {
        setIsWorking(true);
        try {
            await signOut();
        }
        finally {
            localStorage.removeItem('neotoons_clerk_token');
            setCurrentUser(null);
            setRequiresEmailVerification(false);
            setPendingVerificationEmail(null);
            setIsWorking(false);
        }
    };
    const updateCurrentUser = (userData) => {
        setCurrentUser(userData);
    };
    const isProOrStudio = currentUser?.plan === 'pro' || currentUser?.plan === 'studio';
    return (_jsx(AuthContext.Provider, { value: {
            currentUser,
            login,
            signup,
            verifyEmailCode,
            logout,
            updateCurrentUser,
            isLoading,
            isProOrStudio,
            requiresEmailVerification,
            pendingVerificationEmail,
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
const ProtectedAPIRoute = ({ children }) => {
    const { currentUser, isProOrStudio, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (!isLoading) {
            if (!currentUser) {
                toast.error('Please sign in to access the API');
                navigate('/login', {
                    state: {
                        from: location.pathname,
                        message: 'Please sign in to access the API'
                    }
                });
            }
            else if (!isProOrStudio) {
                toast.error('Upgrade to Pro or Studio to access the API');
                navigate('/pricing', {
                    state: {
                        from: location.pathname,
                        message: 'Upgrade to Pro or Studio to access the API'
                    }
                });
            }
        }
    }, [currentUser, isProOrStudio, isLoading, navigate, location]);
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-bg flex items-center justify-center", children: _jsx("div", { className: "w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" }) }));
    }
    if (!currentUser || !isProOrStudio) {
        return null;
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedAPIRoute;

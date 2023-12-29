import { Navigate } from 'react-router-dom';

export const AuthGuard = ({token, children}: any) => {
    if (!token) {
        // prop drilling because auth guard is passed in app.tsx
        return <Navigate to="/login" replace />;
    }
    return children;
};
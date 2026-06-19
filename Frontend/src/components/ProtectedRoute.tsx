import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute() {

    const { token, loading } = useApp() as unknown as { token: string | null; loading: boolean };
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-dark-900">Loading...
        </div>
    }
    if (!token) {
        return <Navigate to="/login" replace />
    }
    return <Outlet />;
}

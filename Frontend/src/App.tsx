import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";
import History from "./pages/History";
import RankTracker from "./pages/RankTracker";
import RankDetail from "./pages/RankDetail";
import { Toaster } from "react-hot-toast";
import { useApp } from "./context/AppContext";

export default function App() {
    const { token, loading } = useApp() as unknown as { token: string | null; loading: boolean };
    const location = useLocation();




    const hideNavbar = ["/login", "/register"].includes(location.pathname);

    return (
        <>
            <Toaster />
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />

                {/* Block manual access to login/register when authenticated */}
                <Route path="/login" element={loading ? <div /> : token ? <Navigate to="/dashboard" replace /> : <Login state="login" />} />
                <Route path="/register" element={loading ? <div /> : token ? <Navigate to="/dashboard" replace /> : <Login state="register" />} />






                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analyze" element={<Analyze />} />
                    <Route path="/report/:id" element={<Report />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/rank-tracker" element={<RankTracker />} />
                    <Route path="/rank/:id" element={<RankDetail />} />
                </Route>
            </Routes>
        </>
    );
}

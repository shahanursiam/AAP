import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';

import { Dashboard } from './pages/Dashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

import { Samples } from './pages/Samples';
import { Scan } from './pages/Scan';
import { Inventory } from './pages/Inventory';
import { Movements } from './pages/Movements';
import { Settings } from './pages/Settings';
import { InvoiceList } from './pages/InvoiceList';
import { CreateInvoice } from './pages/CreateInvoice';
import { InvoiceDetails } from './pages/InvoiceDetails';
import { MerchandiserDashboard } from './pages/MerchandiserDashboard';
import { ApprovalDashboard } from './pages/ApprovalDashboard';
import { TrackingManager } from './pages/TrackingManager';
import { Reports } from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/samples" element={<Samples />} />
            <Route path="/merchandiser" element={<MerchandiserDashboard />} />
            <Route path="/approvals" element={<ApprovalDashboard />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/movements" element={<Movements />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/new" element={<CreateInvoice />} />
            <Route path="/invoices/:id" element={<InvoiceDetails />} />
            <Route path="/invoices/:id" element={<InvoiceDetails />} />
            <Route path="/tracking" element={<TrackingManager />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<div className="p-8 text-center text-gray-500">Page not found or under construction</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

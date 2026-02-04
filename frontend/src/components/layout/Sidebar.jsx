import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import {
    LayoutDashboard,
    Shirt,
    ArrowRightLeft,
    Warehouse,
    BarChart3,
    Settings,
    LogOut,
    ScanBarcode,
    FileText,
    Briefcase,
    ShieldCheck,
    Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Merchandiser', path: '/merchandiser' },
    { icon: Shirt, label: 'Samples', path: '/samples' },
    { icon: ScanBarcode, label: 'Scan', path: '/scan' },
    { icon: Package, label: 'Tracking', path: '/tracking' }, 
    { icon: Warehouse, label: 'Inventory', path: '/inventory' },
    { icon: ArrowRightLeft, label: 'Movements', path: '/movements' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: ShieldCheck, label: 'Approvals', path: '/approvals' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth(); // Get user


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0 lg:static",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-50">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <span className="font-bold text-gray-800 text-lg tracking-tight">SampleTrack</span>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-hide">
                    {menuItems.filter(item => {
                        // Only show 'Merchandiser' link to Admin
                        if (item.label === 'Merchandiser' && user?.role !== 'admin') {
                            return false;
                        }
                        if (item.label === 'Approvals' && user?.role !== 'admin') {
                            return false;
                        }
                        return true;
                    }).map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "text-indigo-600 bg-indigo-50"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                <Icon className={cn("w-5 h-5 mr-3", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                                {item.label}
                            </Link>
                        )
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
}

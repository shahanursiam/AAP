import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '../ui/Button';

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Sidebar */}
            <div className="print:hidden">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between print:hidden">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 mr-2 lg:hidden text-gray-500 hover:bg-gray-100 rounded-md"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Global Search - Hidden on mobile for now */}
                        <div className="hidden md:flex items-center relative max-w-md">
                            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search styles, PO, barcode..."
                                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all hover:bg-gray-100 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="flex items-center pl-2 sm:pl-4 border-l border-gray-200">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                                JD
                            </div>
                            <div className="hidden sm:block ml-3">
                                <p className="text-sm font-medium text-gray-700">John Doe</p>
                                <p className="text-xs text-gray-500">Merchandiser</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto print:overflow-visible print:h-auto print:block">
                    <div className="max-w-7xl mx-auto print:max-w-none">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

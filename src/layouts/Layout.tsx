import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <main className="flex-1 overflow-auto w-full relative">
                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                    <div className="font-bold text-lg text-indigo-900">HS Learning Center</div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'shadow-lg rounded-lg border border-gray-100',
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#334155',
                    },
                }}
            />
        </div>
    );
};

export default Layout;

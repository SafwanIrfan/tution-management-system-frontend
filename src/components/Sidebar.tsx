import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users,
    CalendarCheck,
    CreditCard,
    FileText,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    X
} from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Students', path: '/students', icon: Users },
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'Fees', path: '/fees', icon: CreditCard },
        { name: 'Reports', path: '/reports', icon: FileText },
    ];

    return (
        <div
            className={cn(
                "fixed inset-y-0 left-0 z-30 bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col md:relative",
                collapsed ? "md:w-20" : "md:w-64",
                "w-64", // Fixed width on mobile
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
        >
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className={cn("flex items-center gap-2 overflow-hidden whitespace-nowrap", collapsed && "md:justify-center md:w-full")}>
                    <div className="bg-indigo-600 p-2 rounded-lg text-white shrink-0">
                        <GraduationCap size={24} />
                    </div>
                    {(!collapsed || isOpen) && (
                        <span className={cn("font-bold text-xl text-indigo-900 tracking-tight", collapsed && "md:hidden")}>TuitionMS</span>
                    )}
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Desktop Collapse Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors"
                title={collapsed ? "Expand" : "Collapse"}
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose?.()} // Close sidebar on mobile nav click
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group whitespace-nowrap",
                            isActive
                                ? "bg-indigo-50 text-indigo-600 font-medium shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                            collapsed && "md:justify-center md:px-2"
                        )}
                    >
                        <item.icon size={22} className={cn("shrink-0", collapsed ? "md:mx-auto" : "")} />
                        {(!collapsed || isOpen) && <span className={cn(collapsed && "md:hidden")}>{item.name}</span>}

                        {/* Tooltip for collapsed state (Desktop only) */}
                        {collapsed && (
                            <div className="hidden md:block absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                {item.name}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                {(!collapsed || isOpen) && (
                    <div className={cn("bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl", collapsed && "md:hidden")}>
                        <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">Teacher Panel</p>
                        <p className="text-sm text-gray-600">Logged in as Admin</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;

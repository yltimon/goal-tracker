"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Target, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logoutUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Goals", href: "/dashboard/goals", icon: Target },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <Target className="w-6 h-6 mr-2" />
                    <span className="text-xl font-bold tracking-tight">Goal Tracker</span>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? "bg-gray-100 text-black"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-black" : "text-gray-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium uppercase mr-3">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-black truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logoutUser}
                        className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3 text-gray-400" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="py-8 px-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

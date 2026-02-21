"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
    const { user, logoutUser } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-black mb-1">Settings</h1>
                <p className="text-gray-500">Manage your account and preferences.</p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* Profile Section */}
                <section className="card">
                    <h2 className="text-lg font-bold text-black mb-6 flex items-center">
                        <User className="w-5 h-5 mr-2 text-gray-400" />
                        Profile Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                                {user.name}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                {user.email}
                            </div>
                        </div>
                    </div>
                </section>

                

                {/* Danger Zone */}
                <section className="card border-red-100">
                    <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
                    <p className="text-sm text-gray-500 mb-6 tracking-tight">
                        Once you sign out, you will need your credentials to access your data again.
                    </p>

                    <button
                        onClick={logoutUser}
                        className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out of Account
                    </button>
                </section>
            </div>
        </div>
    );
}

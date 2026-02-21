"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Target, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Analytics {
    totalGoals: number;
    completedGoals: number;
    averageProgress: number;
    byCategory: { Category: string; count: number }[];
}

interface Goal {
    GoalID: number;
    GoalName: string;
    Category: string;
    TargetValue: number;
    CurrentValue: number;
    Deadline: string;
    progress: number;
    daysRemaining: number;
}

export default function DashboardOverview() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [recentGoals, setRecentGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            const [analyticsRes, goalsRes] = await Promise.all([
                api.get("/analytics"),
                api.get("/goals")
            ]);

            setAnalytics(analyticsRes.data);
            // Show only top 3 goals ending soonest
            setRecentGoals(goalsRes.data.slice(0, 3));
        } catch (err: any) {
            setError("Failed to load dashboard data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-red-200 bg-red-50 text-red-600 flex items-center p-4">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-black mb-1">
                    Welcome back, {user?.name.split(' ')[0]}
                </h1>
                <p className="text-gray-500">Here's an overview of your progress today.</p>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="flex items-center text-gray-500 mb-4">
                        <Target className="w-5 h-5 mr-2 text-gray-400" />
                        <h2 className="text-sm font-medium">Total Goals</h2>
                    </div>
                    <p className="text-3xl font-bold text-black">{analytics?.totalGoals || 0}</p>
                </div>

                <div className="card">
                    <div className="flex items-center text-gray-500 mb-4">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-gray-400" />
                        <h2 className="text-sm font-medium">Completed</h2>
                    </div>
                    <p className="text-3xl font-bold text-black">{analytics?.completedGoals || 0}</p>
                </div>

                <div className="card">
                    <div className="flex items-center text-gray-500 mb-4">
                        <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
                        <h2 className="text-sm font-medium">Average Progress</h2>
                    </div>
                    <div className="flex items-end">
                        <p className="text-3xl font-bold text-black">
                            {Math.round(analytics?.averageProgress || 0)}
                        </p>
                        <span className="text-lg font-medium text-gray-500 ml-1 mb-1">%</span>
                    </div>
                </div>
            </div>

            {/* Recent Goals */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight text-black">Active Goals</h2>
                    <Link href="/dashboard/goals" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                        View all
                    </Link>
                </div>

                {recentGoals.length === 0 ? (
                    <div className="card flex flex-col items-center justify-center p-12 text-center text-gray-500">
                        <Target className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="mb-4">You haven't set any goals yet.</p>
                        <Link href="/dashboard/goals" className="btn-primary">
                            Create your first goal
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentGoals.map((goal) => (
                            <Link key={goal.GoalID} href="/dashboard/goals" className="block group">
                                <div className="card hover:border-black transition-colors h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="uppercase tracking-wider text-xs font-semibold text-gray-500">
                                            {goal.Category}
                                        </div>
                                        {goal.daysRemaining < 0 ? (
                                            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                                Overdue
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-gray-200 transition-colors">
                                                {goal.daysRemaining} days left
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-black mb-1 line-clamp-1">{goal.GoalName}</h3>
                                    <div className="mt-auto pt-6">
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <span className="text-gray-900">{Math.round(goal.progress)}%</span>
                                            <span className="text-gray-500">{goal.CurrentValue} / {goal.TargetValue}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-black h-1.5 rounded-full"
                                                style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

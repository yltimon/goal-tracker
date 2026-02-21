"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Target, X, Check, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

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

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    // Form states
    const [goalName, setGoalName] = useState("");
    const [category, setCategory] = useState("personal");
    const [targetValue, setTargetValue] = useState("");
    const [deadline, setDeadline] = useState("");
    const [progressValue, setProgressValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchGoals = async () => {
        try {
            const response = await api.get("/goals");
            setGoals(response.data);
        } catch (err) {
            setError("Failed to fetch goals");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post("/goals", {
                goalName,
                category,
                targetValue: parseFloat(targetValue),
                deadline
            });
            setIsAddModalOpen(false);
            resetAddForm();
            fetchGoals();
        } catch (err) {
            alert("Failed to create goal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGoal) return;

        setIsSubmitting(true);
        try {
            await api.post(`/goals/${selectedGoal.GoalID}/progress`, {
                value: parseFloat(progressValue)
            });
            setSelectedGoal(null);
            setProgressValue("");
            fetchGoals();
        } catch (err) {
            alert("Failed to update progress");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAddForm = () => {
        setGoalName("");
        setCategory("personal");
        setTargetValue("");
        setDeadline("");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black mb-1">My Goals</h1>
                    <p className="text-gray-500">Track and manage your objectives.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                </button>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">
                    {error}
                </div>
            ) : goals.length === 0 ? (
                <div className="card flex flex-col items-center justify-center p-16 text-center text-gray-500">
                    <Target className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-black mb-2">No goals found</h3>
                    <p className="mb-6">You haven't set any goals yet. Start tracking your progress today.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-secondary"
                    >
                        Create your first goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        const isCompleted = goal.progress >= 100;
                        const daysLeft = differenceInDays(new Date(goal.Deadline), new Date());

                        return (
                            <div key={goal.GoalID} className="card flex flex-col h-full border hover:border-black transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="uppercase text-xs font-semibold text-gray-500 tracking-wider">
                                        {goal.Category}
                                    </span>
                                    {isCompleted ? (
                                        <span className="flex items-center text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                            <Check className="w-3 h-3 mr-1" />
                                            Completed
                                        </span>
                                    ) : daysLeft < 0 ? (
                                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                                            Overdue
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                            {daysLeft} days left
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-black mb-1 line-clamp-1" title={goal.GoalName}>
                                    {goal.GoalName}
                                </h3>

                                <p className="text-sm text-gray-500 mb-6 flex items-center">
                                    Due {format(new Date(goal.Deadline), 'MMM d, yyyy')}
                                </p>

                                <div className="mt-auto">
                                    <div className="flex justify-between text-sm font-medium mb-2">
                                        <span className="text-black">{Math.round(goal.progress)}%</span>
                                        <span className="text-gray-500">{goal.CurrentValue} / {goal.TargetValue}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-black' : 'bg-gray-800'}`}
                                            style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                                        ></div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedGoal(goal)}
                                        disabled={isCompleted}
                                        className={`nav-button w-full flex justify-center py-2 text-sm font-medium rounded-md border ${isCompleted
                                                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border-gray-300 text-black hover:bg-gray-50'
                                            }`}
                                    >
                                        {isCompleted ? 'Goal Achieved' : 'Update Progress'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Goal Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-black">Add New Goal</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddGoal} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                                <input
                                    type="text"
                                    value={goalName}
                                    onChange={(e) => setGoalName(e.target.value)}
                                    className="input-field"
                                    placeholder="E.g., Read 10 books"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="personal">Personal</option>
                                    <option value="academic">Academic</option>
                                    <option value="professional">Professional</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value (Number)</label>
                                <input
                                    type="number"
                                    value={targetValue}
                                    onChange={(e) => setTargetValue(e.target.value)}
                                    min="1"
                                    step="0.1"
                                    className="input-field"
                                    placeholder="10"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 btn-secondary py-2">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-2 flex justify-center">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Goal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Progress Modal */}
            {selectedGoal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-black">Log Progress</h2>
                            <button onClick={() => setSelectedGoal(null)} className="text-gray-400 hover:text-black transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProgress} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-4 tracking-tight">
                                    Logging progress for <span className="font-semibold text-black">{selectedGoal.GoalName}</span>
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Value to add</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={progressValue}
                                        onChange={(e) => setProgressValue(e.target.value)}
                                        min="0.1"
                                        step="0.1"
                                        className="input-field pr-16"
                                        placeholder="E.g., 1"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-gray-500 font-medium">
                                        / {selectedGoal.TargetValue}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Current: {selectedGoal.CurrentValue} (Remaining: {selectedGoal.TargetValue - selectedGoal.CurrentValue})
                                </p>
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-2.5 flex justify-center">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log Progress"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

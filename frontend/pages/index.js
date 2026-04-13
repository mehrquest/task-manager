import { useEffect, useState, useCallback } from "react";
import Pusher from "pusher-js";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import Navbar from "../components/Navbar";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import axios from "axios";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [showSharedOnly, setShowSharedOnly] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [viewMode, setViewMode] = useState("tasks");
  const [theme, setTheme] = useState("light");

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  // Sync theme with document element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [API_URL]);

  // Load email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) setUserEmail(savedEmail);
    fetchNotifications();
  }, [fetchNotifications]);

  // Save email to localStorage when it changes
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
  }, [userEmail]);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = `${API_URL}/tasks`;
      if (showSharedOnly && userEmail) {
        url = `${API_URL}/tasks/shared?email=${userEmail}`;
      }
      const res = await axios.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [showSharedOnly, userEmail, API_URL]);

  useEffect(() => {
    fetchTasks();
    
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("tasks");

    channel.bind("taskUpdated", fetchTasks);
    channel.bind("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 10));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [fetchTasks]);

  const analytics = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "Pending").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-slate-950 font-sans selection:bg-blue-200 transition-colors duration-300">
      <Navbar 
        userEmail={userEmail} 
        setUserEmail={setUserEmail} 
        showSharedOnly={showSharedOnly} 
        setShowSharedOnly={setShowSharedOnly} 
        notifications={notifications}
        setNotifications={setNotifications}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-10">

        {viewMode === "tasks" ? (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Projects Overview</h1>
                <p className="text-gray-500 dark:text-slate-400 font-medium text-lg">Track your progress and manage your daily flow.</p>
              </div>
              <div className="flex gap-3">
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Live Sync Active</span>
                 </div>
              </div>
            </div>

            {/* Analytics Cards (Quick View) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 flex items-center justify-between group cursor-default transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Total Tasks</p>
                  <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.total}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 flex items-center justify-between group cursor-default transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Pending</p>
                  <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.pending}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/40 flex items-center justify-center text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 flex items-center justify-between group cursor-default transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">In Progress</p>
                  <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.inProgress}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 flex items-center justify-between group cursor-default transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Completed</p>
                  <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.completed}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Form Wrapper */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <TaskForm fetchTasks={fetchTasks} editingTask={editingTask} setEditingTask={setEditingTask} />
              </div>

              {/* Right Column: Pinterest Grid */}
              <div className="lg:col-span-8">
                {isLoading ? (
                  <div className="flex justify-center p-20">
                     <svg className="animate-spin h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
                ) : (
                  <TaskList tasks={tasks} fetchTasks={fetchTasks} onEdit={setEditingTask} />
                )}
              </div>
            </div>
          </>
        ) : (
          <AnalyticsDashboard />
        )}
      </main>
    </div>
  );
}
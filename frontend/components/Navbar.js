import React, { useState } from "react";
import axios from "axios";

export default function Navbar({
  userEmail,
  setUserEmail,
  showSharedOnly,
  setShowSharedOnly,
  notifications,
  setNotifications,
  viewMode,
  setViewMode,
  theme,
  setTheme
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`);
      setNotifications(
        notifications.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between">

        {/* LOGO + MODE SWITCH */}
        <div className="flex items-center gap-6">

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setViewMode("tasks")}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
              TaskFlow
            </span>
          </div>

          {/* VIEW TOGGLE */}
          <div className="hidden md:flex items-center gap-1 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700">
            <button
              onClick={() => setViewMode("tasks")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === "tasks"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
            >
              Tasks
            </button>

            <button
              onClick={() => setViewMode("analytics")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === "analytics"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end">

          {/* EMAIL */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 max-w-[200px] md:max-w-xs w-full transition-colors">
            <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>

            <input
              type="email"
              placeholder="Set your email..."
              value={userEmail || ""}
              onChange={(e) => setUserEmail(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none w-full text-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative">
            {/* THEME TOGGLE */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            {/* SHARED FILTER */}
            <button
              onClick={() => setShowSharedOnly(!showSharedOnly)}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showSharedOnly
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
                : "bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
            >
              {showSharedOnly ? "Shared Only" : "All Tasks"}
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>

                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 font-bold text-gray-900 dark:text-white">
                    Notifications
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-400 text-sm text-center">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => markAsRead(notif._id)}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${!notif.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                        >
                          <p className={`text-sm ${!notif.read ? "font-bold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                            {notif.message}
                          </p>
                          <span className="text-xs text-gray-400">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER BADGE */}
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs ring-2 ring-white dark:ring-slate-800">
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : "ME"}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
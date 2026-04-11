import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import axios from 'axios';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6']; // Green, Yellow, Blue

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, trendsRes] = await Promise.all([
          axios.get(`${API_URL}/analytics/overview`),
          axios.get(`${API_URL}/analytics/trends`)
        ]);
        setOverview(overviewRes.data);
        setTrends(trendsRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="flex justify-center items-center h-96">
      <svg className="animate-spin h-10 w-10 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>
  );

  const pieData = overview ? [
    { name: 'Completed', value: overview.completedTasks },
    { name: 'Pending', value: overview.pendingTasks },
    { name: 'In Progress', value: overview.inProgressTasks },
  ].filter(d => d.value > 0) : [];

  const completionRate = overview?.totalTasks > 0 
    ? Math.round((overview.completedTasks / overview.totalTasks) * 100) 
    : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)] transition-all duration-500">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Tasks</p>
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{overview?.totalTasks || 0}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all duration-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)] transition-all duration-500">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Completion Rate</p>
            <h3 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{completionRate}%</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)] transition-all duration-500 lg:col-span-1 md:col-span-2">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status</p>
            <h3 className="text-4xl font-extrabold text-green-500 dark:text-green-400">{overview?.completedTasks || 0} Done</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/40 flex items-center justify-center text-green-500 dark:text-green-400 group-hover:bg-green-500 dark:group-hover:bg-green-400 group-hover:text-white transition-all duration-300">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
             <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
             Status Distribution
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
             <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
             Weekly Trends
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis 
                   dataKey="week" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#64748b', fontSize: 12 }} 
                   dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                   itemStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completedCount" 
                  name="Completed Tasks"
                  stroke="#6366f1" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 4, stroke: '#6366f1', fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

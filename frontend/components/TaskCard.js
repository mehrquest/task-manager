import axios from 'axios';
import { useState } from 'react';

export default function TaskCard({ task, fetchTasks, onEdit }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/tasks/${task._id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = task.status === "Completed" ? "Pending" : task.status === "Pending" ? "In Progress" : "Completed";
    try {
      await axios.put(`${API_URL}/tasks/${task._id}`, { 
        title: task.title,
        description: task.description,
        status: newStatus,
        dueDate: task.dueDate
      });

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const statusConfigs = {
    "Completed": { bg: "bg-green-50 dark:bg-green-900/40", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800", dot: "bg-green-500" },
    "Pending": { bg: "bg-yellow-50 dark:bg-yellow-900/40", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800", dot: "bg-yellow-500" },
    "In Progress": { bg: "bg-blue-50 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800", dot: "bg-blue-500" },
  };
  
  const status = statusConfigs[task.status] || { bg: "bg-gray-50 dark:bg-slate-800", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-slate-700", dot: "bg-gray-500" };

  return (
    <div className={`break-inside-avoid mb-6 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)] hover:-translate-y-1.5 group ${isDeleting ? 'opacity-50 scale-95' : ''}`}>
      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{task.title}</h3>
        <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${status.bg} ${status.text} ${status.border} shadow-sm`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}></span>
          {task.status}
        </span>
      </div>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50 font-medium">
        {task.description || "No description provided."}
      </p>
      
      <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50 dark:border-slate-800/50">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "No Limit"}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-1.5 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => {
              const email = prompt("Enter email of the person you want to share this task with:");
              if (email) {
                axios.put(`${API_URL}/tasks/${task._id}/share`, { email })
                  .then(() => alert("Task shared successfully!"))
                  .catch(err => alert("Failed to share task: " + err.message));
              }
            }}
            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
            title="Share Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
          <button 
            onClick={handleToggleStatus}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            title="Cycle Status"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button 
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
            title="Edit Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
            disabled={isDeleting}
            title="Delete Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";

export default function TaskForm({ fetchTasks, editingTask, setEditingTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setStatus(editingTask.status || "Pending");
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : "");
    }
  }, [editingTask]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await axios.put(`${API_URL}/tasks/${editingTask._id}`, { title, description, status, dueDate });
        setEditingTask(null);
      } else {
        await axios.post(`${API_URL}/tasks`, { title, description, status, dueDate });
      }
      
      setTitle(""); setDescription(""); setStatus("Pending"); setDueDate("");
      fetchTasks();
    } catch (err) {
      console.error("Failed to save task", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTitle(""); setDescription(""); setStatus("Pending"); setDueDate("");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-slate-800 overflow-hidden relative transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      
      <div className="flex items-center justify-between mb-6 pt-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {editingTask ? "✨ Edit Task" : "✨ Create Task"}
        </h2>
        {editingTask && (
          <button onClick={cancelEdit} className="text-sm font-medium text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Cancel</button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400 uppercase mb-2">Title</label>
          <input 
            type="text" 
            placeholder="e.g. Design the landing page" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400 uppercase mb-2">Description</label>
          <textarea 
            placeholder="Add context or acceptance criteria..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows="3"
            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400 uppercase mb-2">Status</label>
            <div className="relative">
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 appearance-none font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <option value="Pending" className="dark:bg-slate-800">Pending</option>
                <option value="In Progress" className="dark:bg-slate-800">In Progress</option>
                <option value="Completed" className="dark:bg-slate-800">Completed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400 uppercase mb-2">Due Date</label>
            <input 
              type="date" 
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 font-medium text-gray-700 dark:text-gray-200 cursor-text"
            />
          </div>
        </div>
        
        <div className="pt-3">
          <button 
            type="submit" 
            disabled={isSubmitting || !title.trim()}
            className="w-full px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-blue-600 dark:to-indigo-600 hover:from-black hover:to-gray-900 dark:hover:from-blue-500 dark:hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            ) : editingTask ? (
              <>Save Changes</>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Add Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
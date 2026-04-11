import TaskCard from "./TaskCard";

export default function TaskList({ tasks, fetchTasks, onEdit }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-dashed border-gray-300 rounded-3xl">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No tasks yet</h3>
        <p className="text-gray-500 font-medium">Create a task to get started on your projects.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 md:columns-2 xl:columns-3 gap-6">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} fetchTasks={fetchTasks} onEdit={onEdit} />
      ))}
    </div>
  );
}
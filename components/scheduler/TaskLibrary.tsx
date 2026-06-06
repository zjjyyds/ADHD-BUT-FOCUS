import React, { useState } from 'react';
import { RandomTask } from '../../types';

interface TaskLibraryProps {
  tasks: RandomTask[];
  setTasks: React.Dispatch<React.SetStateAction<RandomTask[]>>;
}

export default function TaskLibrary({ tasks, setTasks }: TaskLibraryProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [...prev, { id: crypto.randomUUID(), title: newTaskTitle.trim() }]);
    setNewTaskTitle('');
  };

  const startEdit = (task: RandomTask) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = () => {
    if (!editTitle.trim()) return;
    setTasks(prev => prev.map(t => t.id === editingId ? { ...t, title: editTitle.trim() } : t));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mx-2 mb-4">Task Library (Pool)</h2>
        <form onSubmit={handleAddTask} className="flex gap-2 relative">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Inject New Task..."
            className="flex-1 w-full pl-4 pr-20 py-3 font-mono bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c24127]/20 focus:border-[#c24127] transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-lg hover:bg-slate-200 transition-colors"
          >
            [ Add ]
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="font-mono text-xs font-bold text-slate-300 tracking-widest">[ LIBRARY EMPTY ]</div>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="group relative flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all gap-1.5">
              {editingId === task.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    className="flex-1 px-3 py-1.5 bg-white border border-[#c24127]/30 rounded-lg focus:outline-none focus:border-[#c24127] text-sm"
                  />
                  <button onClick={saveEdit} title="Save" className="p-1 px-2 text-xs font-bold bg-green-100 text-green-700 rounded-md transition-colors">SAVE</button>
                  <button onClick={cancelEdit} title="Cancel" className="p-1 px-2 text-xs font-bold bg-slate-200 text-slate-600 rounded-md transition-colors">ESC</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Queued</span>
                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(task)} className="text-[10px] font-bold tracking-widest text-slate-400 hover:text-slate-600 uppercase">[ Edit ]</button>
                        <button onClick={() => deleteTask(task.id)} className="text-[10px] font-bold tracking-widest text-slate-400 hover:text-red-500 uppercase">[ Del ]</button>
                     </div>
                  </div>
                  <p className="text-sm font-medium text-slate-700 break-words leading-relaxed">{task.title}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

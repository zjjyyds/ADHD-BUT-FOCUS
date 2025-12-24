import React, { useState } from 'react';
import { Check, Plus, Trash2, Circle } from 'lucide-react';
import { TodoItem } from '../types';

interface TodoListProps {
  todos: TodoItem[];
  onUpdate: (todos: TodoItem[]) => void;
  readOnly?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdate, readOnly = false }) => {
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const item: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
      completed: false
    };
    
    onUpdate([item, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    if (readOnly) return;
    const newTodos = todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    // Sort: incomplete first, then completed
    onUpdate(newTodos.sort((a, b) => Number(a.completed) - Number(b.completed)));
  };

  const deleteTodo = (id: string) => {
    if (readOnly) return;
    onUpdate(todos.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
           <Check className="text-emerald-500" size={24} /> 待办清单
        </h2>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {todos.filter(t => !t.completed).length} 待完成
        </span>
      </div>

      {/* Input Area */}
      {!readOnly && (
        <div className="p-6 pb-2">
          <form onSubmit={handleAdd} className="relative group">
             <input
               type="text"
               value={newTodo}
               onChange={(e) => setNewTodo(e.target.value)}
               placeholder="添加新任务..."
               className="w-full bg-slate-50 border-none rounded-2xl pl-5 pr-12 py-4 text-base font-semibold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-sm"
             />
             <button 
               type="submit"
               disabled={!newTodo.trim()}
               className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all active:scale-95"
             >
               <Plus size={18} />
             </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {todos.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 pb-20">
             <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
               <Check size={32} />
             </div>
             <p className="text-sm font-semibold">暂无待办事项</p>
          </div>
        )}
        
        {todos.map(todo => (
          <div 
            key={todo.id}
            className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300
              ${todo.completed 
                ? 'bg-slate-50/50 border-transparent opacity-60' 
                : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100'
              }`}
          >
            <button 
              onClick={() => toggleTodo(todo.id)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${todo.completed 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-300 text-transparent hover:border-emerald-400'
                }`}
            >
              <Check size={14} strokeWidth={3} />
            </button>
            
            <span 
              className={`flex-1 text-sm font-semibold transition-all cursor-pointer select-none
                ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.text}
            </span>

            {!readOnly && (
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
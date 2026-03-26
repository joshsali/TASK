/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  Plus, 
  Calendar, 
  Flag, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  GripVertical, 
  Filter, 
  Layout, 
  Clock, 
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type Priority = 'low' | 'medium' | 'high';
type Category = 'School' | 'Work' | 'Personal';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  deadline: string;
  createdAt: number;
}

const CATEGORIES: Category[] = ['School', 'Work', 'Personal'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('Personal');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');

  // Fetch initial tasks from a public API to satisfy exam requirements
  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
        if (!response.ok) throw new Error('Failed to fetch initial tasks');
        const data = await response.json();
        
        const mappedTasks: Task[] = data.map((item: any, index: number) => ({
          id: `initial-${item.id}`,
          title: item.title,
          completed: item.completed,
          category: CATEGORIES[index % CATEGORIES.length],
          priority: PRIORITIES[index % PRIORITIES.length],
          deadline: new Date(Date.now() + 86400000 * (index + 1)).toISOString().split('T')[0],
          createdAt: Date.now() - index * 1000,
        }));
        
        setTasks(mappedTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTasks();
  }, []);

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      completed: false,
      category: newTaskCategory,
      priority: newTaskPriority,
      deadline: newTaskDeadline || new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDeadline('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => filterCategory === 'All' || t.category === filterCategory);
  }, [tasks, filterCategory]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    return { completed, pending, highPriority };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {stats.pending} Pending
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {stats.completed} Done
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-zinc-400">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Ongoing</span>
            </div>
            <p className="text-3xl font-black">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-zinc-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Completed</span>
            </div>
            <p className="text-3xl font-black text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-zinc-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Urgent</span>
            </div>
            <p className="text-3xl font-black text-red-500">{stats.highPriority}</p>
          </div>
        </div>

        {/* Add Task Form */}
        <section className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm mb-8">
          <form onSubmit={addTask} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-zinc-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-50 rounded-2xl text-lg font-medium transition-all outline-none border border-zinc-100 focus:border-blue-200"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-zinc-400" />
                <select 
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as Category)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-600 outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-zinc-400" />
                <select 
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-600 outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <input 
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-600 outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                />
              </div>
            </div>
          </form>
        </section>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-200/50 rounded-xl mr-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filter</span>
          </div>
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat as any)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Loading your workflow...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group bg-white rounded-2xl border ${
                              snapshot.isDragging ? 'border-blue-400 shadow-2xl scale-[1.02]' : 'border-zinc-200'
                            } p-4 transition-all duration-200 flex items-center gap-4`}
                          >
                            <div {...provided.dragHandleProps} className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-5 h-5" />
                            </div>

                            <button 
                              onClick={() => toggleTask(task.id)}
                              className={`flex-shrink-0 transition-colors ${
                                task.completed ? 'text-green-500' : 'text-zinc-300 hover:text-blue-500'
                              }`}
                            >
                              {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                  task.category === 'Work' ? 'bg-purple-100 text-purple-600' :
                                  task.category === 'School' ? 'bg-orange-100 text-orange-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {task.category}
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-zinc-100 text-zinc-500'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                              <h3 className={`font-bold text-sm truncate transition-all ${
                                task.completed ? 'text-zinc-400 line-through' : 'text-zinc-900'
                              }`}>
                                {task.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-zinc-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-zinc-200">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">All caught up!</h3>
            <p className="text-zinc-400 text-sm mt-1">No tasks found in this category.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-zinc-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <p>© 2026 TaskFlow Productivity</p>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react'
import { X, Save, MessageSquare, Link as LinkIcon, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'

const API_URL = '/api'

export default function TaskModal({ task, tasks, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    progress: 0,
    due_date: '',
    estimated_hours: '',
    actual_hours: ''
  })
  
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [dependencies, setDependencies] = useState([])
  const [selectedDependency, setSelectedDependency] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee: task.assignee || '',
        progress: task.progress || 0,
        due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
        estimated_hours: task.estimated_hours || '',
        actual_hours: task.actual_hours || ''
      })
      setNotes(task.notes || [])
      setDependencies(task.dependencies || [])
    }
  }, [task])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = task ? `${API_URL}/tasks/${task.id}` : `${API_URL}/tasks`
      const method = task ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !task) return
    
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, author: formData.assignee || 'Manager' })
      })
      
      if (res.ok) {
        const note = await res.json()
        setNotes([note, ...notes])
        setNewNote('')
        onSave()
      }
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const handleAddDependency = async () => {
    if (!selectedDependency || !task) return
    
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depends_on_task_id: selectedDependency, type: 'blocks' })
      })
      
      if (res.ok) {
        const dep = await res.json()
        setDependencies([dep, ...dependencies])
        setSelectedDependency('')
        onSave()
      }
    } catch (error) {
      console.error('Error adding dependency:', error)
    }
  }

  const handleDeleteDependency = async (depId) => {
    if (!task) return
    
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}/dependencies?depId=${depId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setDependencies(dependencies.filter(d => d.id !== depId))
        onSave()
      }
    } catch (error) {
      console.error('Error deleting dependency:', error)
    }
  }

  const handleDeleteTask = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return
    
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const availableTasks = tasks.filter(t => t.id !== task?.id)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <div className="flex items-center space-x-2">
            {task && (
              <button
                onClick={handleDeleteTask}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Developer name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Actual Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.actual_hours}
                onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {task && (
            <>
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <LinkIcon className="w-5 h-5" />
                  <span>Dependencies</span>
                </h3>
                
                <div className="space-y-2 mb-4">
                  {dependencies.map(dep => (
                    <div key={dep.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <span className="text-sm text-slate-700">
                        Blocks: {dep.depends_on_title || 'Unknown'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDependency(dep.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <select
                    value={selectedDependency}
                    onChange={(e) => setSelectedDependency(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select task to depend on...</option>
                    {availableTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddDependency}
                    disabled={!selectedDependency}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Notes</span>
                </h3>
                
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {notes.map(note => (
                    <div key={note.id} className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600">{note.author}</span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(note.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{note.content}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

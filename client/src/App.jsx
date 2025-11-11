import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import KanbanBoard from './components/KanbanBoard'
import TaskModal from './components/TaskModal'
import StatsPanel from './components/StatsPanel'
import ActivityFeed from './components/ActivityFeed'
import ConflictsPanel from './components/ConflictsPanel'
import { Plus, Activity, AlertTriangle, BarChart3 } from 'lucide-react'

const API_URL = '/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [conflicts, setConflicts] = useState([])
  const [activities, setActivities] = useState([])
  const [showStats, setShowStats] = useState(false)
  const [showActivity, setShowActivity] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchConflicts()
    fetchActivities()
    const interval = setInterval(() => {
      fetchTasks()
      fetchConflicts()
      fetchActivities()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`)
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchConflicts = async () => {
    try {
      const res = await fetch(`${API_URL}/conflicts`)
      const data = await res.json()
      setConflicts(data)
    } catch (error) {
      console.error('Error fetching conflicts:', error)
    }
  }

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${API_URL}/activity`)
      const data = await res.json()
      setActivities(data)
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId

    try {
      const res = await fetch(`${API_URL}/tasks/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        fetchTasks()
        fetchActivities()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleCreateTask = () => {
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleTaskSaved = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
    fetchTasks()
    fetchConflicts()
    fetchActivities()
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">TaskFlow</h1>
                <p className="text-sm text-slate-500">Modern Task Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {conflicts.length > 0 && (
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className="relative btn-secondary flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute -top-1 -right-1">
                    {conflicts.length}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => setShowStats(!showStats)}
                className="btn-secondary flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Stats</span>
              </button>
              
              <button
                onClick={() => setShowActivity(!showActivity)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Activity</span>
              </button>
              
              <button onClick={handleCreateTask} className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`lg:col-span-${showStats || showActivity ? '3' : '4'} transition-all`}>
            <KanbanBoard
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onDragEnd={handleDragEnd}
            />
          </div>
          
          {showStats && (
            <div className="lg:col-span-1">
              <StatsPanel tasks={tasks} />
            </div>
          )}
          
          {showActivity && (
            <div className="lg:col-span-1">
              <ActivityFeed activities={activities} />
            </div>
          )}
        </div>
        
        {conflicts.length > 0 && (
          <div className="mt-6">
            <ConflictsPanel conflicts={conflicts} />
          </div>
        )}
      </main>

      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          tasks={tasks}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTask(null)
          }}
          onSave={handleTaskSaved}
        />
      )}
    </div>
  )
}

export default App

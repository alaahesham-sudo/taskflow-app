import { Clock, User, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
}

export default function TaskCard({ task, onClick }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
  const hasBlockers = task.blockers && task.blockers.length > 0

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-slate-900 flex-1 group-hover:text-primary-600 transition-colors">
          {task.title}
        </h3>
        {hasBlockers && (
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 ml-2" />
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[task.priority] || priorityColors.medium}`}>
            {task.priority}
          </span>
          {task.assignee && (
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
          )}
        </div>
      </div>
      
      {task.progress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs">
        {task.due_date && (
          <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
            <Clock className="w-3 h-3" />
            <span>{format(new Date(task.due_date), 'MMM d')}</span>
          </div>
        )}
        {task.estimated_hours && (
          <div className="text-slate-500">
            {task.estimated_hours}h est.
          </div>
        )}
      </div>
      
      {task.dependencies && task.dependencies.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Depends on: {task.dependencies.length} task(s)
          </div>
        </div>
      )}
    </div>
  )
}

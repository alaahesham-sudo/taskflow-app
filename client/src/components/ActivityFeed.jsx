import { Activity, User, CheckCircle2, MessageSquare, Link as LinkIcon } from 'lucide-react'
import { format } from 'date-fns'

const actionIcons = {
  created: CheckCircle2,
  status_changed: Activity,
  note_added: MessageSquare,
  dependency_added: LinkIcon
}

const actionColors = {
  created: 'text-green-600 bg-green-50',
  status_changed: 'text-blue-600 bg-blue-50',
  note_added: 'text-purple-600 bg-purple-50',
  dependency_added: 'text-orange-600 bg-orange-50'
}

export default function ActivityFeed({ activities }) {
  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-slate-600" />
        <h2 className="text-xl font-bold text-slate-900">Activity Feed</h2>
      </div>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No activity yet</p>
        ) : (
          activities.map(activity => {
            const Icon = actionIcons[activity.action] || Activity
            const colorClass = actionColors[activity.action] || 'text-slate-600 bg-slate-50'
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{activity.user || activity.user_name || 'Manager'}</span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{activity.details || activity.action}</p>
                  {activity.task_title && (
                    <p className="text-xs text-slate-500 mt-1">Task: {activity.task_title}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

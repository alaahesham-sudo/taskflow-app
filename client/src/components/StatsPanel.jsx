import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, CheckCircle2 } from 'lucide-react'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444']

export default function StatsPanel({ tasks }) {
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    review: tasks.filter(t => t.status === 'review').length
  }

  const priorityData = [
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length }
  ]

  const statusData = [
    { name: 'Done', value: stats.done, color: '#10b981' },
    { name: 'Review', value: stats.review, color: '#f59e0b' },
    { name: 'In Progress', value: stats.inProgress, color: '#0ea5e9' },
    { name: 'To Do', value: stats.todo, color: '#94a3b8' }
  ]

  const completionRate = stats.total > 0 ? ((stats.done / stats.total) * 100).toFixed(1) : 0
  const avgProgress = tasks.length > 0 
    ? (tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length).toFixed(1)
    : 0

  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 text-primary-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Completion</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{completionRate}%</div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 text-slate-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Avg Progress</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{avgProgress}%</div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Tasks by Priority</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-2 pt-4 border-t border-slate-200">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Total Tasks</span>
          <span className="font-semibold">{stats.total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Done</span>
          <span className="font-semibold text-green-600">{stats.done}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">In Progress</span>
          <span className="font-semibold text-blue-600">{stats.inProgress}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">To Do</span>
          <span className="font-semibold text-slate-600">{stats.todo}</span>
        </div>
      </div>
    </div>
  )
}

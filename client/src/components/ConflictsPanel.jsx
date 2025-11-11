import { AlertTriangle } from 'lucide-react'

export default function ConflictsPanel({ conflicts }) {
  if (conflicts.length === 0) return null

  return (
    <div className="card border-2 border-amber-200 bg-amber-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">Task Conflicts Detected</h2>
        </div>
        <span className="bg-amber-600 text-white text-sm font-medium px-3 py-1 rounded-full">
          {conflicts.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {conflicts.map((conflict, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-amber-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 mb-1">
                  <span className="text-amber-600">"{conflict.task1_title}"</span> is blocking
                </p>
                <p className="text-sm text-slate-700">
                  but <span className="font-medium">"{conflict.task2_title}"</span> is not completed yet
                </p>
                <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500">
                  <span>Status: {conflict.task1_status} ? {conflict.task2_status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-4 text-sm text-amber-700">
        ?? These tasks have dependency conflicts. Consider resolving them to avoid blocking work.
      </p>
    </div>
  )
}

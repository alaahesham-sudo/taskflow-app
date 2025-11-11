import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import TaskCard from './TaskCard'

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-amber-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
]

export default function KanbanBoard({ tasks, onTaskClick, onDragEnd }) {
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id)
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} rounded-t-lg px-4 py-3 border-b-2 border-slate-300`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-700">{column.title}</h2>
                  <span className="bg-white text-slate-600 text-sm font-medium px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[400px] p-3 rounded-b-lg ${
                      snapshot.isDraggingOver ? 'bg-slate-50' : 'bg-slate-50/50'
                    } transition-colors`}
                  >
                    <div className="space-y-3">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'opacity-50' : ''}
                            >
                              <TaskCard task={task} onClick={() => onTaskClick(task)} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

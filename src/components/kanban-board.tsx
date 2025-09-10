import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners, DragOverEvent, useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useState } from "react"
import { Task } from "@/types/task"
import { TaskCard } from "./task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ListTodo, Clock, CheckCircle } from "lucide-react"

interface KanbanBoardProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
}

export function KanbanBoard({ tasks, onUpdateTask, onDeleteTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const todoTasks = tasks.filter(task => task.status === 'todo')
  const inProgressTasks = tasks.filter(task => task.status === 'inProgress')
  const doneTasks = tasks.filter(task => task.status === 'done')

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(task => task.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (!over) {
      setDragOverColumn(null)
      return
    }

    const overId = over.id as string
    let columnId: string | null = null
    
    if (overId === 'todo-column' || overId === 'todo') {
      columnId = 'todo'
    } else if (overId === 'inProgress-column' || overId === 'inProgress') {
      columnId = 'inProgress'
    } else if (overId === 'done-column' || overId === 'done') {
      columnId = 'done'
    }
    
    setDragOverColumn(columnId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    console.log('Drag ended:', { active: active.id, over: over?.id })
    setActiveTask(null)
    setDragOverColumn(null)

    if (!over) {
      console.log('No drop target found')
      return
    }

    const taskId = active.id as string
    const overId = over.id as string

    // Determine the new status based on the drop zone
    let newStatus: Task['status']
    if (overId === 'todo-column' || overId === 'todo' || todoTasks.some(task => task.id === overId)) {
      newStatus = 'todo'
    } else if (overId === 'inProgress-column' || overId === 'inProgress' || inProgressTasks.some(task => task.id === overId)) {
      newStatus = 'inProgress'
    } else if (overId === 'done-column' || overId === 'done' || doneTasks.some(task => task.id === overId)) {
      newStatus = 'done'
    } else {
      console.log('Unknown drop zone:', overId)
      return
    }

    const task = tasks.find(t => t.id === taskId)
    console.log('Moving task:', { taskId, from: task?.status, to: newStatus })
    if (task && task.status !== newStatus) {
      onUpdateTask(taskId, { status: newStatus })
    }
  }

  const handleUpdateProgress = (taskId: string, progress: number) => {
    onUpdateTask(taskId, { progress })
  }

  const getColumnIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <ListTodo className="w-5 h-5" />
      case 'inProgress':
        return <Clock className="w-5 h-5" />
      case 'done':
        return <CheckCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'text-gray-600 dark:text-gray-400'
      case 'inProgress':
        return 'text-blue-600 dark:text-blue-400'
      case 'done':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600'
    }
  }

  const KanbanColumn = ({ 
    status, 
    title, 
    tasks, 
    count 
  }: { 
    status: string
    title: string
    tasks: Task[]
    count: number 
  }) => {
    const { setNodeRef } = useDroppable({
      id: status,
    })

    return (
      <div className="flex-1">
        <Card className="shadow-medium" id={`${status}-column`}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center justify-between text-lg ${getColumnColor(status)}`}>
              <div className="flex items-center gap-2">
                {getColumnIcon(status)}
                {title}
              </div>
              <Badge variant="secondary" className="ml-2">
                {count}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div
                ref={setNodeRef}
                id={status}
                className="min-h-[400px] space-y-3 scrollbar-hide overflow-y-auto max-h-[70vh] transition-colors duration-200 rounded-lg p-2"
                style={{
                  background: dragOverColumn === status ? 'hsl(var(--primary) / 0.1)' : 'transparent'
                }}
              >
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={onDeleteTask}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
              {tasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed border-muted rounded-lg transition-colors hover:border-primary/50">
                  Drop tasks here
                </div>
              )}
            </div>
          </SortableContext>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`transition-all duration-200 ${dragOverColumn === 'todo' ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}>
          <KanbanColumn
            status="todo"
            title="To Do"
            tasks={todoTasks}
            count={todoTasks.length}
          />
        </div>
        <div className={`transition-all duration-200 ${dragOverColumn === 'inProgress' ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}>
          <KanbanColumn
            status="inProgress"
            title="In Progress"
            tasks={inProgressTasks}
            count={inProgressTasks.length}
          />
        </div>
        <div className={`transition-all duration-200 ${dragOverColumn === 'done' ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}>
          <KanbanColumn
            status="done"
            title="Done"
            tasks={doneTasks}
            count={doneTasks.length}
          />
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onDelete={() => {}}
            onUpdateProgress={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
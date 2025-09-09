import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core"
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Determine the new status based on the drop zone
    let newStatus: Task['status']
    if (overId === 'todo' || todoTasks.some(task => task.id === overId)) {
      newStatus = 'todo'
    } else if (overId === 'inProgress' || inProgressTasks.some(task => task.id === overId)) {
      newStatus = 'inProgress'
    } else if (overId === 'done' || doneTasks.some(task => task.id === overId)) {
      newStatus = 'done'
    } else {
      return
    }

    const task = tasks.find(t => t.id === taskId)
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
  }) => (
    <Card className="flex-1 shadow-medium">
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
            id={status}
            className="min-h-[400px] space-y-3 scrollbar-hide overflow-y-auto max-h-[70vh]"
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
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed border-muted rounded-lg">
                Drop tasks here
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <KanbanColumn
          status="todo"
          title="To Do"
          tasks={todoTasks}
          count={todoTasks.length}
        />
        <KanbanColumn
          status="inProgress"
          title="In Progress"
          tasks={inProgressTasks}
          count={inProgressTasks.length}
        />
        <KanbanColumn
          status="done"
          title="Done"
          tasks={doneTasks}
          count={doneTasks.length}
        />
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
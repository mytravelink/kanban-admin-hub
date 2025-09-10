import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Task } from "@/types/task"
import { Trash2, Calendar, User, GripVertical } from "lucide-react"

interface TaskCardProps {
  task: Task
  onDelete: (id: string) => void
  onUpdateProgress: (id: string, progress: number) => void
}

export function TaskCard({ task, onDelete, onUpdateProgress }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'inProgress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`mb-3 transition-smooth hover:shadow-medium ${
        sortableIsDragging ? 'shadow-strong cursor-grabbing' : 'shadow-soft cursor-grab'
      }`}
    >
      <CardContent className="p-4" {...listeners}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="ml-2 p-1 hover:bg-muted rounded">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {task.assignee}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {formatDate(task.dueDate)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
            <Slider
              value={[task.progress]}
              onValueChange={(value) => onUpdateProgress(task.id, value[0])}
              onPointerDown={(e) => e.stopPropagation()}
              max={100}
              step={10}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Badge className={getStatusColor(task.status)}>
              {task.status === 'inProgress' ? 'In Progress' : 
               task.status === 'todo' ? 'To Do' : 'Done'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
import { useState } from "react"
import { Task } from "@/types/task"
import { TaskForm } from "./task-form"
import { KanbanBoard } from "./kanban-board"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { LogOut, BarChart3 } from "lucide-react"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [])
  const { toast } = useToast()

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTasks(prevTasks => [...prevTasks, newTask])
    toast({
      title: "Task created",
      description: `"${newTask.title}" has been added to your board.`,
    })
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
    if (task) {
      toast({
        title: "Task deleted",
        description: `"${task.title}" has been removed from your board.`,
        variant: "destructive",
      })
    }
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'done').length
    const inProgress = tasks.filter(task => task.status === 'inProgress').length
    const todo = tasks.filter(task => task.status === 'todo').length
    
    return { total, completed, inProgress, todo }
  }

  const stats = getTaskStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-medium">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Task Manager</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Todo: {stats.todo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>In Progress: {stats.inProgress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Done: {stats.completed}</span>
                </div>
              </div>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="transition-smooth"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Task Form */}
        <TaskForm onAddTask={addTask} />

        {/* Stats Cards - Mobile */}
        <div className="grid grid-cols-2 sm:hidden gap-4">
          <div className="bg-card p-4 rounded-lg border shadow-soft">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-card p-4 rounded-lg border shadow-soft">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard
          tasks={tasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground">Create your first task to get started!</p>
          </div>
        )}
      </main>
    </div>
  )
}
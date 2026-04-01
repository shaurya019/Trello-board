import { useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import './App.css'
import { BOARD_COLUMNS, INITIAL_TASKS, updateTaskStatus } from './mockApi'

function moveTask(tasks, taskId, nextStatus) {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, status: nextStatus } : task,
  )
}

function removePendingTask(taskIds, taskId) {
  return taskIds.filter((id) => id !== taskId)
}

function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [pendingTaskIds, setPendingTaskIds] = useState([])
  const [toasts, setToasts] = useState([])
  const pendingMovesRef = useRef(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? null

  function showToast(message) {
    const id = crypto.randomUUID()

    setToasts((currentToasts) => [...currentToasts, { id, message }])

    window.setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id),
      )
    }, 4200)
  }

  async function handleMove(taskId, nextStatus) {
    const task = tasks.find((item) => item.id === taskId)

    if (!task || task.status === nextStatus) {
      return
    }

    const previousStatus = task.status
    const mutationId = `${taskId}-${Date.now()}-${Math.random()}`

    pendingMovesRef.current.set(taskId, mutationId)
    setPendingTaskIds((currentTaskIds) =>
      currentTaskIds.includes(taskId)
        ? currentTaskIds
        : [...currentTaskIds, taskId],
    )
    setTasks((currentTasks) => moveTask(currentTasks, taskId, nextStatus))

    try {
      await updateTaskStatus(taskId, nextStatus)

      if (pendingMovesRef.current.get(taskId) !== mutationId) {
        return
      }

      pendingMovesRef.current.delete(taskId)
      setPendingTaskIds((currentTaskIds) =>
        removePendingTask(currentTaskIds, taskId),
      )
    } catch (error) {
      if (pendingMovesRef.current.get(taskId) !== mutationId) {
        return
      }

      pendingMovesRef.current.delete(taskId)
      setPendingTaskIds((currentTaskIds) =>
        removePendingTask(currentTaskIds, taskId),
      )
      setTasks((currentTasks) => moveTask(currentTasks, taskId, previousStatus))
      showToast(
        `Couldn't move "${task.title}" to ${
          BOARD_COLUMNS.find((column) => column.id === nextStatus)?.title
        }. The board rolled back to keep things consistent.`,
      )
      console.error(error)
    }
  }

  function handleDragStart(event) {
    setActiveTaskId(event.active.id)
  }

  function handleDragEnd(event) {
    const { active, over } = event

    setActiveTaskId(null)

    if (!over) {
      return
    }

    handleMove(active.id, over.id)
  }

  function handleDragCancel() {
    setActiveTaskId(null)
  }

  return (
    <div className="board-shell">
      <header className="hero">
        <p className="eyebrow">Optimistic UI demo</p>
        <h1>Kanban board with instant moves and safe rollback</h1>
        <p className="hero-copy">
          Drag a task into a new lane and the card moves immediately. A mock API
          responds after 1.5 seconds and intentionally fails 20% of the time, so
          we can prove the rollback experience feels smooth.
        </p>
      </header>

      <section className="status-banner" aria-label="Board behavior summary">
        <div>
          <strong>Optimistic first:</strong> UI updates on drop, not on server
          response.
        </div>
        <div>
          <strong>Failure aware:</strong> a random API error returns the task to
          its original column and shows a toast.
        </div>
      </section>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main className="board" aria-label="Kanban board">
          {BOARD_COLUMNS.map((column) => (
            <StatusColumn
              key={column.id}
              column={column}
              tasks={tasks.filter((task) => task.status === column.id)}
              pendingTaskIds={pendingTaskIds}
              onMove={handleMove}
            />
          ))}
        </main>

        <DragOverlay>
          {activeTask ? <TaskPreview task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusColumn({ column, tasks, pendingTaskIds, onMove }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <section
      ref={setNodeRef}
      className={`column ${isOver ? 'column--over' : ''}`}
      style={{ '--column-accent': column.color }}
    >
      <div className="column-header">
        <div>
          <p className="column-label">{column.title}</p>
          <h2>{column.subtitle}</h2>
        </div>
        <span className="column-count">{tasks.length}</span>
      </div>

      <div className="column-body">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isPending={pendingTaskIds.includes(task.id)}
            onMove={onMove}
          />
        ))}
        {tasks.length === 0 ? (
          <div className="empty-state">Drop a card here to update its status.</div>
        ) : null}
      </div>
    </section>
  )
}

function TaskCard({ task, isPending, onMove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`card ${isDragging ? 'card--dragging' : ''} ${
        isPending ? 'card--pending' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <TaskPreview task={task} isPending={isPending} />
      <div className="card-actions" aria-label={`Move ${task.title} with buttons`}>
        {BOARD_COLUMNS.filter((column) => column.id !== task.status).map((column) => (
          <button
            key={column.id}
            type="button"
            className="move-button"
            onClick={() => onMove(task.id, column.id)}
          >
            Move to {column.title}
          </button>
        ))}
      </div>
    </article>
  )
}

function TaskPreview({ task, isPending = false, isDragging = false }) {
  return (
    <div className={`card-preview ${isDragging ? 'card-preview--overlay' : ''}`}>
      <div className="card-topline">
        <span className="task-badge">{task.tag}</span>
        {isPending ? <span className="sync-badge">Syncing...</span> : null}
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="card-footer">
        <span>{task.owner}</span>
        <span>{task.estimate}</span>
      </div>
    </div>
  )
}

export default App

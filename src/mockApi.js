export const BOARD_COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    subtitle: 'Ready to start',
    color: '#ffbf69',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    subtitle: 'Currently moving',
    color: '#52b788',
  },
  {
    id: 'done',
    title: 'Done',
    subtitle: 'Wrapped and shipped',
    color: '#4d96ff',
  },
]

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Draft onboarding checklist',
    description: 'Capture the first-run steps for new workspace members.',
    status: 'todo',
    owner: 'Maya',
    estimate: '2 pts',
    tag: 'Docs',
  },
  {
    id: 'task-2',
    title: 'QA the billing settings page',
    description: 'Review edge states before this week’s release window.',
    status: 'todo',
    owner: 'Noah',
    estimate: '3 pts',
    tag: 'QA',
  },
  {
    id: 'task-3',
    title: 'Refine marketing hero copy',
    description: 'Shorten the headline and make the CTA more direct.',
    status: 'in-progress',
    owner: 'Ava',
    estimate: '1 pt',
    tag: 'Content',
  },
  {
    id: 'task-4',
    title: 'Audit analytics events',
    description: 'Confirm the new funnel emits payloads in the right order.',
    status: 'in-progress',
    owner: 'Liam',
    estimate: '5 pts',
    tag: 'Data',
  },
  {
    id: 'task-5',
    title: 'Publish release notes',
    description: 'Summarize the latest fixes and link the relevant tickets.',
    status: 'done',
    owner: 'Emma',
    estimate: '1 pt',
    tag: 'Ops',
  },
]

function sleep(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })
}

export async function updateTaskStatus(taskId, nextStatus) {
  await sleep(1500)

  if (Math.random() < 0.2) {
    throw new Error(`Mock API failed while moving ${taskId} to ${nextStatus}.`)
  }

  return {
    taskId,
    status: nextStatus,
  }
}

# Kanban Board with Optimistic Updates

A small React + Vite project that recreates a Trello-style board with optimistic drag-and-drop updates, a mock API delay, and automatic rollback when the fake backend fails.

## Features

- Three columns: `To Do`, `In Progress`, and `Done`
- Drag-and-drop task movement powered by `dnd-kit`
- Instant optimistic UI updates when a card is dropped
- Mock API with a fixed `1.5s` delay
- Random `20%` failure rate to simulate server errors
- Rollback to the original column on failure
- Toast notification explaining when a move fails
- Mobile-friendly responsive layout

## Tech Stack

- React
- Vite
- `@dnd-kit/core`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL shown by Vite in your browser.

## Build for Production

```bash
npm run build
```

## How the Optimistic Flow Works

1. A user drags a card into a new column.
2. The UI updates immediately without waiting for the API.
3. A mock API call waits `1500ms`.
4. The API succeeds `80%` of the time and fails `20%` of the time.
5. If the request fails, the task snaps back to its previous column and a toast message appears.

## Project Structure

```text
src/
  App.jsx       Main board UI and optimistic state management
  App.css       Component-level styling
  index.css     Global layout and theme styles
  mockApi.js    Mock task data and delayed API simulation
```

## Notes

- The failure rate is intentionally random so the rollback behavior can be tested repeatedly.
- Each move is tracked so stale API responses do not overwrite newer task moves.

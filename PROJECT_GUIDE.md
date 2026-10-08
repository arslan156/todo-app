# Todo App Project Guide

This guide explains the main frontend and backend files, how a task travels
through the app, and how to run the project with MongoDB Compass.

## 1. Architecture at a glance

The project has three parts:

1. **React frontend** in `frontend/` renders the pages and task interface.
2. **Express API** in `backend/` handles authentication, tasks, notes, chat, and
   mailbox data.
3. **MongoDB** stores accounts, tasks, notes, direct messages, and mailbox
   messages. The default local database name is `todo`.

The normal data path is:

```text
Browser UI
  -> frontend/src/services/api.js (Axios clients)
  -> backend/src/app.js (middleware and route mounts)
  -> backend/src/features/<feature>/routes.js
  -> backend/src/features/<feature>/<model>.js
  -> MongoDB
```

The frontend uses Create React App. Its package is `frontend/package.json`;
`frontend/src/index.js` remains the CRA entry point.

The source now follows feature ownership: app bootstrapping and state live in
`app/`, each user-facing domain lives in `features/`, reusable page chrome is
in `shared/`, API clients are in `services/`, and global styles are in
`styles/`. The Express API groups each domain's routes and models together
under `backend/src/features/`; configuration and the server bootstrap are
separate.

## 2. Project map

### Frontend

| Folder or file | Purpose |
| --- | --- |
| `frontend/src/index.js` | CRA entry point; mounts React, Redux Provider, and the app. |
| `frontend/src/app/App.js` | Application route table and signed-in state restoration. |
| `frontend/src/app/store/` | Redux store and authentication state. |
| `frontend/src/features/auth/` | Sign-up/sign-in screens and account state hook. |
| `frontend/src/features/home/`, `about/` | Public landing and about pages. |
| `frontend/src/features/tasks/` | Todo workspace shell, task list/editor, dashboard, calendar, task hook, filters, and date/reminder utilities. |
| `frontend/src/features/notes/` | MongoDB-backed Notes workspace with tag/favourite filters, colored cards, and add/edit/delete actions. Imports prior browser-saved notes when the account has no notes in MongoDB yet. |
| `frontend/src/features/chat/` | Direct-message workspace; starts chats by registered account email and loads/sends messages through the API. |
| `frontend/src/features/mailbox/` | Account-backed demo mailbox with folders, categories, search, message actions, and compose/draft flow. Sent messages are not delivered externally. |
| `frontend/src/features/profile/` | Profile screen shown inside the workspace shell. |
| `frontend/src/shared/layout/` | Reusable site navigation and footer. |
| `frontend/src/shared/assets/` | Shared image and logo assets. |
| `frontend/src/services/api.js` | Axios clients for API feature prefixes. |
| `frontend/src/styles/` | Global CSS, app CSS, and shared visual utilities. |
| `frontend/src/features/tasks/dateUtils.test.js` | Tests for local date formatting and due-date status classification. |

### Backend

| Folder or file | Purpose |
| --- | --- |
| `backend/app.js` | Compatibility entry point that starts the reorganized server. |
| `backend/server.js` | Compatibility entry point retained for older start commands. |
| `backend/src/app.js` | Creates the Express app, installs middleware, and mounts feature routes. |
| `backend/src/server.js` | Connects to MongoDB and starts the HTTP server. |
| `backend/src/config/database.js` | Connects Mongoose using `MONGODB_URI` or the default local `todo` database. |
| `backend/src/features/auth/` | Account model and authentication routes. |
| `backend/src/features/tasks/` | Task model and CRUD API routes. |
| `backend/src/features/notes/` | Note model and CRUD/import API routes. |
| `backend/src/features/chat/` | Conversation/message models and direct-message API routes. |
| `backend/src/features/mailbox/` | Account-owned mailbox message model and mailbox API routes. |
| `backend/package.json` | Backend dependencies and start command. |

## 3. How the frontend starts and routes

1. `index.js` mounts React, Redux, and global styles.
2. `app/App.js` wraps the app in `BrowserRouter`.
3. The route table sends `/todo`, `/todo/dashboard`, `/todo/notes`,
   `/todo/mailbox`, `/todo/chat`, and `/todo/profile` to `TodoDashboard`.
4. The dashboard reads the current route and renders the corresponding view
   inside its shared application shell. Calendar mode is managed by dashboard
   state and renders `CalendarView`.

The Todo shell uses the device's dynamic viewport height. On narrow screens
the main navigation starts collapsed, task filters open as a dismissible
drawer, and Notes and Mailbox switch from side-by-side panels to compact
stacked/mobile-navigation layouts. The mailbox message rows also simplify at
phone and tablet widths; Chat already switches between its conversation list
and a selected thread on mobile.

Workspace form controls share the `workspace-input` styling from
`frontend/src/styles/index.css` for consistent sizing, borders, text color, and focus
states across task, Notes, Chat, and Mailbox inputs. Notes uses Nunito
typography, lightly tinted cards, and restrained entrance/hover motion.

The Redux store in `app/store/` only tracks whether the app is signed in. Task
contents are managed by `features/tasks/hooks/useTasks.js`, not Redux.

## 4. Sign-up and sign-in flow

The auth Axios client in `frontend/src/services/api.js` uses `/api/v1`:

- `POST /api/v1/register` sends email, username, and password.
- `POST /api/v1/signin` sends email-or-username and password.

The backend checks required fields, hashes registration passwords with
`bcrypt`, and compares hashes during sign-in. It omits the password from the
successful sign-in response.

On successful sign-in, the frontend stores the returned user object in
`localStorage` under `loggedInUser` and the MongoDB user ID in
`sessionStorage` under `id`. `useTasks` uses that ID to load and scope tasks.
Logout clears both values and updates the Redux flag.

Signed-in users are automatically logged out after 15 minutes without
mouse, keyboard, touch, or scroll activity. The app checks elapsed time when
the browser tab resumes, so sleep/background throttling does not extend an
inactive session.

### Form migration preparation (Phase 1)

`features/auth/authSchemas.js` defines `loginSchema` and `registerSchema`
using the already-installed Zod dependency. They preserve the existing
sign-in behavior (the identifier can be an email or username) and sign-up
checks (email format, 3-30 character username pattern, and an eight-character
minimum password). The schemas are groundwork only: the current Sign In and
Sign Up pages do not use them yet.

The current form state and Phase 2 destination are:

| Current page | Current form-related state | Phase 2 destination |
| --- | --- | --- |
| `features/auth/SignIn.jsx` | `inputs.email`, `inputs.password` | React Hook Form values validated by `loginSchema`. |
| `features/auth/SignIn.jsx` | `remember` | React Hook Form checkbox value, included in the existing sign-in request. |
| `features/auth/SignIn.jsx` | `submitting` | React Hook Form submission state for pending UI and button disabling. |
| `features/auth/SignIn.jsx` | `error` | Display server/auth errors returned through the `useAuth` submission operation. |
| `features/auth/SignIn.jsx` | `showPassword`, `notice` | Keep as UI/query-string state; they are not form values. |
| `features/auth/Signup.jsx` | `inputs.email`, `inputs.username`, `inputs.password` | React Hook Form values validated by `registerSchema`. |
| `features/auth/Signup.jsx` | `submitting` | React Hook Form submission state for pending UI and button disabling. |
| `features/auth/Signup.jsx` | `error` | Display server/auth errors returned through the `useAuth` submission operation. |
| `features/auth/Signup.jsx` | `showPassword` | Keep as UI-only state; it is not a form value. |

The existing Axios clients in `services/api.js` already centralize base URLs,
credentials, and session-expiry handling; there is no separate API hook today.
Sign In and Sign Up currently call `authApi` directly, while `useAuth` handles
session access and logout. In Phase 2, each page will use
`useForm({ resolver: zodResolver(loginSchema|registerSchema) })`, submit with
`handleSubmit`, and call authentication operations exposed by `useAuth`.
Those operations will keep using the existing `authApi` client rather than
introducing a second Axios/API system.

Redux currently stores only the `isLoggedIn` flag (its `user` field is not
populated by the current reducers). `useAuth` separately reads the signed-in
user from the existing session storage helpers. This phase leaves that
working behavior unchanged; Phase 2 should preserve the existing sources of
truth unless a separate state migration is explicitly approved. Forgot and
Reset Password forms are not part of the Sign In/Sign Up migration.

## 5. Task lifecycle and API

The task Axios client in `frontend/src/services/api.js` uses `/api/v2`. The
backend implementation is in `backend/src/features/tasks/`. The current API routes are:

| Method | Endpoint | Effect |
| --- | --- | --- |
| `GET` | `/api/v2/getTasks/:userId?page=1&limit=10&search=...&filter=inbox&tag=...&priority=...` | Searches and filters in MongoDB, sorts, and returns one page plus pagination metadata. |
| `POST` | `/api/v2/addTask` | Creates a task and adds its ID to the user's `list` references. |
| `PUT` | `/api/v2/updateTask/:taskId` | Updates supported task fields for that user. |
| `DELETE` | `/api/v2/deleteTask/:taskId` | Permanently deletes a task and removes its user reference. |

The supported task fields are:

```text
title, description, assignee, tag, priority, dueDate,
done, starred, trashed
```

`TaskModal` creates or edits the task form. `TodoDashboard` passes save and
action callbacks to `TaskItem`. Those callbacks call `useTasks`, which sends
the request to the backend and updates in-memory task state when successful.
Moving a task to Trash only sets `trashed: true`; permanent deletion and Empty
Trash call the delete endpoint.

The task list sends its page, page size, debounced search, and active filters
to the API. Search is case-insensitive across task title, description, assignee,
tag, priority, and due date; the server applies the existing priority/date
ordering before skipping and limiting results. Responses include `tasks` and a
`pagination` object with `page`, `limit`, `totalItems`, and `totalPages`.
Search waits 400 ms after typing, filter/search changes return to page 1, and
stale requests are cancelled or ignored. The task list has numbered page
controls and selectable page sizes (5, 10, 20, or 50), plus loading, empty,
error, and retry states. The top-bar search suggestions use the same server
results. The existing full task data remains available for dashboard and
calendar summaries.
`CalendarView` groups all
non-trashed tasks with a due date by date and presents a calendar and agenda.

## 6. Notes and API

Notes use a separate MongoDB `notes` collection. Each note belongs to one
account through its `owner` field; note reads, updates, and deletes are scoped
to that owner. The frontend notes API uses `/api/v3`; its routes and model are grouped under
`backend/src/features/notes/`:

| Method | Endpoint | Effect |
| --- | --- | --- |
| `GET` | `/api/v3/getNotes/:userId` | Reads the account's notes, newest update first. |
| `POST` | `/api/v3/addNote` | Creates a note for the supplied account. |
| `POST` | `/api/v3/importNotes` | Imports browser-saved notes only when the account has no MongoDB notes yet. |
| `PUT` | `/api/v3/updateNote/:id` | Updates a supported note field for its owner. |
| `DELETE` | `/api/v3/deleteNote/:id` | Deletes a note belonging to the supplied account. |

Supported fields are `title`, `body`, `tag`, `favourite`, and `color`. On first
load for an account with no database notes, `NotesView.jsx` sends that
account's previous `todolist.notes.v1.<userId>` browser notes through the
import endpoint. MongoDB is then the source of truth; note changes require a
working backend connection.

## 7. Chat and API

Chat uses MongoDB collections for `conversations` and `messages`. A direct
conversation stores the two participant references and a small last-message
preview; messages are stored as separate documents so conversation history
does not grow an unbounded array. A user starts a conversation by entering the
email address of another registered account.

The Chat Axios client uses `/api/v4`; its routes and models are grouped under
`backend/src/features/chat/`:

| Method | Endpoint | Effect |
| --- | --- | --- |
| `GET` | `/api/v4/conversations/:userId` | Lists direct conversations for the supplied account. |
| `POST` | `/api/v4/conversations` | Finds or creates a direct conversation from `userId` and `recipientEmail`. |
| `GET` | `/api/v4/conversations/:conversationId/messages?userId=:userId` | Reads up to 100 recent messages and marks incoming messages read. |
| `POST` | `/api/v4/conversations/:conversationId/messages` | Saves a message from a conversation member. |

The browser refreshes the conversation list every 10 seconds and the selected
conversation's most recent messages every 4 seconds while Chat is open. This is
polling, not a WebSocket/push connection. Messages are visible only to the
conversation's members through these route checks. As with the task and Notes
APIs, the current development app trusts the client-supplied user ID; this is
not production authentication.

## 8. Mailbox and API

The demo mailbox stores each message as an individual MongoDB document scoped
to the account owner. On first load, the frontend imports the existing
browser-saved demo mailbox only when that account has no mailbox messages yet.
Folders, drafts, stars, read state, and message actions are persisted through
the `/api/v5` routes. Saving to Sent does not deliver email; there is no Gmail,
Outlook, or other external email integration.

The mailbox API supports loading messages by user, one-time import, creating
and updating messages, bulk message updates, and bulk deletion. Like the other
development APIs, it currently trusts a client-supplied user ID and is not
production authentication.

| Method | Endpoint | Effect |
| --- | --- | --- |
| `GET` | `/api/v5/messages/:userId` | Loads the account's messages, newest first. |
| `POST` | `/api/v5/messages/import` | Imports legacy browser messages only while the MongoDB mailbox is empty. |
| `POST` | `/api/v5/messages` | Creates a draft or an in-app Sent message. |
| `PUT` | `/api/v5/messages/:id` | Updates a mailbox message belonging to that account. |
| `PATCH` | `/api/v5/messages/bulk` | Updates folder/read/star state for selected account messages. |
| `DELETE` | `/api/v5/messages/bulk` | Permanently deletes selected account messages. |

## 9. Due dates and notifications

Due dates are saved as `YYYY-MM-DD` strings. `dateUtils.js` formats dates in
the user's local timezone and classifies them as overdue, today, or upcoming.
The calendar and task rows use that status for their labels and colors.

While the app is open, `useTasks` checks active tasks every 30 seconds. For a
task due today or overdue, it creates an in-app notification once for that
task and due-date value. Notifications themselves are currently stored in
browser `localStorage` by `notificationUtils.js`; they are not stored in
MongoDB and do not arrive while the app is closed.

## 10. Browser storage and one-time task import

The frontend currently uses these browser keys:

| Key | Data |
| --- | --- |
| `loggedInUser` | Current account object returned by the backend (password excluded). |
| Session key `id` | Current MongoDB user ID. Cleared when the browser session ends or the user logs out. |
| `lastSessionActivity` | Timestamp used to enforce the 15-minute inactivity logout across tabs and browser sleep. |
| `todolist.tasks.v1` | Local task cache and legacy task source for one-time import. |
| `todolist.tasks.imported.v1` | Device-level flag indicating that the local tasks have been imported. |
| `todolist.reminders.v1` | Task/date pairs already notified by this browser. |
| `todolist.notifications.v1` | In-app notification list and read state. |
| `todolist.theme.v1` | Light/dark theme preference. |
| `todolist.notes.v1.<userId>` | Legacy note data used for one-time import to MongoDB. |
| `todolist.mailbox.v1.<userId>` | Legacy mailbox source imported once per account when its MongoDB mailbox is empty. |

When a signed-in user has no MongoDB tasks and the device import flag is not
set, `useTasks` attempts to send the locally saved tasks to that user's
account, then sets the import flag. This is a one-time device-level import,
not a separate import for every account.

## 11. MongoDB and Compass

The backend connects to:

```text
mongodb://127.0.0.1:27017/todo
```

unless `MONGODB_URI` is set in the backend environment. In MongoDB Compass,
connect to `mongodb://127.0.0.1:27017`. Open the `todo` database and inspect:

- `users` — account records. Passwords are bcrypt hashes.
- `lists` — task records. Each document contains a `user` reference.
- `notes` — note records. Each document contains an `owner` reference.
- `conversations` — direct-message member pairs and last-message previews.
- `messages` — individual chat messages, conversation reference, sender, and read receipts.
- `mailboxmessages` — individual account-owned demo mailbox messages and folder state.

Mongoose adds `createdAt` and `updatedAt` to task, note, and mailbox message
documents because their schemas enable timestamps.

## 11. Run locally

Prerequisites: Node.js, npm, and a MongoDB server running locally (or a valid
MongoDB connection URI).

Start the backend in one terminal:

```powershell
cd backend
npm start
```

The backend waits for a successful MongoDB connection before listening on
port `1000` by default.

Start the frontend in a second terminal:

```powershell
cd frontend
npm start
```

The frontend defaults to `http://localhost:1000/api`. To use a different API
base URL, configure `REACT_APP_API_URL` in the frontend environment (the value
is the URL prefix before `/v1` through `/v5`).

Use the app to sign up, sign in, then add tasks. MongoDB Compass can inspect
those records while both the backend and MongoDB are running.

## 12. Important security note

The current task, Notes, Chat, and Mailbox endpoints accept a user ID from the browser
and use it to scope database operations. They do **not** verify a signed
session or authentication token. This is suitable only for local learning/development:
before deploying publicly, add server-verified authentication and authorize
each request from that verified identity rather than trusting a client-supplied
user ID. Also configure CORS for the intended frontend origin instead of
allowing all origins.

## 13. Where to change common behavior

- **Add a task field:** update the form in
  `frontend/src/features/tasks/TaskModal.jsx`, task defaults or normalization
  in `frontend/src/features/tasks/hooks/useTasks.js`, the `taskFields`
  allowlist in `backend/src/features/tasks/routes.js`, and the schema in
  `backend/src/features/tasks/list.js`.
- **Add a note field:** update `frontend/src/features/notes/NotesView.jsx`, the
  allowed note fields in `backend/src/features/notes/routes.js`, and the
  schema in `backend/src/features/notes/note.js`.
- **Add a filter:** update filter state/logic and sidebar wiring in
  `frontend/src/features/tasks/TodoDashboard.jsx`, then add its button in
  `frontend/src/features/tasks/TodoSidebar.jsx`.
- **Change calendar presentation:** edit
  `frontend/src/features/tasks/CalendarView.jsx`; keep shared date logic in
  `frontend/src/features/tasks/dateUtils.js`.
- **Change auth fields or validation:** update both the signup/sign-in forms
  under `frontend/src/features/auth/` and
  `backend/src/features/auth/routes.js`; do not store plaintext passwords.
- **Change MongoDB location:** set `MONGODB_URI` for the backend rather than
  editing a connection string into source code.

import React, { useEffect, useMemo, useState } from "react";
import { notesApi } from "../../services/api";
import useUrlState from "../../shared/hooks/useUrlState";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { addNotification } from "../tasks/notificationUtils";
import {
  FiMoreVertical,
  FiPlus,
  FiStar,
  FiTrash2,
  FiX,
  FiAlertTriangle,
  FiSearch,
} from "react-icons/fi";
import { TbDiamond, TbNotes, TbNote } from "react-icons/tb";

const TAGS = [
  { id: "personal", label: "Personal", color: "#4361ee" },
  { id: "work", label: "Work", color: "#e9a23b" },
  { id: "social", label: "Social", color: "#2693e6" },
];

const NOTE_COLORS = [
  { id: "blue", card: "bg-[#edf2ff]", border: "border-[#c7d2fe]", outline: "#8298ff" },
  { id: "white", card: "bg-white", border: "border-[#e5e7eb]", outline: "#9ca3af" },
  { id: "amber", card: "bg-[#fff8eb]", border: "border-[#ffe2ae]", outline: "#f0ad45" },
  { id: "sky", card: "bg-[#eaf7ff]", border: "border-[#bce6ff]", outline: "#38a9ef" },
  { id: "green", card: "bg-[#effaf3]", border: "border-[#c7ecd3]", outline: "#58b879" },
];

const STORAGE_PREFIX = "todolist.notes.v1";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

const loadNotes = (storageKey) => {
  try {
    const storedNotes = localStorage.getItem(storageKey);
    if (!storedNotes) return { notes: [], error: "" };

    const parsedNotes = JSON.parse(storedNotes);
    if (
      !Array.isArray(parsedNotes) ||
      parsedNotes.some(
        (note) =>
          !note ||
          typeof note.id !== "string" ||
          typeof note.title !== "string" ||
          typeof note.body !== "string"
      )
    ) {
      return {
        notes: [],
        error: "Saved notes could not be read because their data is invalid.",
      };
    }

    return { notes: parsedNotes, error: "" };
  } catch {
    return {
      notes: [],
      error: "Saved notes could not be loaded from this browser.",
    };
  }
};

const normalizeNote = (note) => ({
  ...note,
  id: note._id || note.id,
  title: note.title ?? "",
  body: note.body ?? "",
  tag: note.tag ?? "personal",
  favourite: Boolean(note.favourite),
  color: note.color ?? "white",
  createdAt: note.createdAt ?? new Date().toISOString(),
  updatedAt: note.updatedAt ?? note.createdAt ?? new Date().toISOString(),
});

const apiError = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

function NoteEditor({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title || "");
  const [body, setBody] = useState(note?.body || "");
  const [tag, setTag] = useState(note?.tag || "personal");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (!cleanTitle) {
      setError("Add a title before saving this note.");
      return;
    }

    setSaving(true);
    try {
      const result = await onSave({
        ...note,
        title: cleanTitle,
        body: cleanBody,
        tag,
      });
      if (!result?.success) {
        setError(result?.error || "Unable to save this note.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-2xl sm:max-h-[88dvh] sm:p-5"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#172033]">
              {note ? "Edit note" : "Add new note"}
            </h2>
            <p className="mt-1 text-sm text-[#8490a5]">
              Keep an idea or detail close at hand.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close note editor"
            className="rounded-full p-2 text-[#8490a5] hover:bg-[#f2f4f8]"
          >
            <FiX size={18} />
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-3 text-sm text-rose-600">
            {error}
          </p>
        )}

        <label className="mb-4 block text-sm font-medium text-[#3b4563]">
          Title
          <input
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your note a title"
            className="workspace-input mt-1.5 h-10 w-full rounded-lg px-3 text-sm"
          />
        </label>

        <label className="mb-4 block text-sm font-medium text-[#3b4563]">
          Note
          <textarea
            rows={4}
            maxLength={4000}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write your note..."
            className="workspace-input mt-1.5 max-h-[35dvh] w-full resize-y p-3 text-sm leading-6"
          />
        </label>

        <label className="mb-4 block text-sm font-medium text-[#3b4563]">
          Tag
          <select
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className="workspace-input mt-1.5 h-10 w-full rounded-lg px-3 text-sm"
          >
            {TAGS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#64748b] hover:bg-[#f2f4f8]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#4361ee] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3451d1]"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner />
                Saving...
              </span>
            ) : (
              "Save note"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NotesView({ user }) {
  const userId = sessionStorage.getItem("id") || user?._id || user?.id;
  const storageKey = `${STORAGE_PREFIX}.${userId || "local"}`;
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [storageError, setStorageError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedFilter, setSelectedFilter] = useUrlState("filter", "all");
  const [selectedTag, setSelectedTag] = useUrlState("tag", null);
  const [editorNote, setEditorNote] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [notePendingDelete, setNotePendingDelete] = useState(null);
  const [deletingNote, setDeletingNote] = useState(false);
  const [updatingNoteId, setUpdatingNoteId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const author = user?.username || user?.name || user?.email || "You";

  useEffect(() => {
    let active = true;

    if (!userId) {
      setNotes([]);
      setLoading(false);
      setStorageError("Sign in to load and save notes to your account.");
      return () => {
        active = false;
      };
    }

    const fetchNotes = async () => {
      setLoading(true);
      setStorageError("");

      try {
        const response = await notesApi.get(`/getNotes/${userId}`);
        let loadedNotes = Array.isArray(response.data.notes)
          ? response.data.notes.map(normalizeNote)
          : [];

        if (loadedNotes.length === 0) {
          const legacyData = loadNotes(storageKey);
          if (legacyData.error) {
            throw new Error(legacyData.error);
          }

          const legacyNotes = legacyData.notes.map((note) => ({
            title: note.title,
            body: note.body,
            tag: TAGS.some((option) => option.id === note.tag)
              ? note.tag
              : "personal",
            favourite: Boolean(note.favourite),
            color: NOTE_COLORS.some((option) => option.id === note.color)
              ? note.color
              : "white",
          }));

          if (legacyNotes.length > 0) {
            const importResponse = await notesApi.post("/importNotes", {
              userId,
              notes: legacyNotes,
            });
            loadedNotes = Array.isArray(importResponse.data.notes)
              ? importResponse.data.notes.map(normalizeNote)
              : [];
          }
        }

        if (active) {
          setNotes(loadedNotes);
        }
      } catch (error) {
        if (active) {
          setStorageError(
            apiError(error, "Unable to load notes from the server.")
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchNotes();

    return () => {
      active = false;
    };
  }, [userId, storageKey, reloadKey]);

  const visibleNotes = useMemo(
    () =>
      notes
        .filter((note) =>
          selectedFilter === "favourites" ? note.favourite : true
        )
        .filter((note) => !selectedTag || note.tag === selectedTag)
        .filter((note) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            note.title?.toLowerCase().includes(q) ||
            note.body?.toLowerCase().includes(q)
          );
        })
        .sort(
          (first, second) =>
            new Date(second.updatedAt || second.createdAt).getTime() -
            new Date(first.updatedAt || first.createdAt).getTime()
        ),
    [notes, selectedFilter, selectedTag, searchQuery]
  );

  const saveNote = async (noteData) => {
    if (!userId) {
      return { success: false, error: "Sign in before saving notes." };
    }

    const payload = {
      title: noteData.title,
      body: noteData.body,
      tag: noteData.tag,
      favourite: Boolean(noteData.favourite),
      color:
        noteData.color ||
        NOTE_COLORS[notes.length % NOTE_COLORS.length].id,
      userId,
    };

    try {
      const response = noteData.id
        ? await notesApi.put(`/updateNote/${noteData.id}`, payload)
        : await notesApi.post("/addNote", payload);
      const savedNote = normalizeNote(response.data.note);

      setNotes((currentNotes) =>
        noteData.id
          ? currentNotes.map((note) =>
              note.id === savedNote.id ? savedNote : note
            )
          : [savedNote, ...currentNotes]
      );
      setStorageError("");
      setEditorOpen(false);
      setEditorNote(null);
      addNotification({
        title: noteData.id ? "Note updated" : "Note added",
        message: `"${savedNote.title}" has been ${noteData.id ? "updated" : "added"}.`,
        type: "note",
      });
      return { success: true };
    } catch (error) {
      const message = apiError(error, "Unable to save this note.");
      setStorageError(message);
      addNotification({
        title: "Unable to save note",
        message,
        type: "note",
        variant: "error",
      });
      return { success: false, error: message };
    }
  };

  const updateNote = async (noteId, changes) => {
    if (!userId) return;

    setUpdatingNoteId(noteId);
    try {
      const { data } = await notesApi.put(`/updateNote/${noteId}`, {
        ...changes,
        userId,
      });
      const savedNote = normalizeNote(data.note);
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === savedNote.id ? savedNote : note
        )
      );
      setStorageError("");
      addNotification({
        title: "Note updated",
        message: `"${savedNote.title}" has been updated.`,
        type: "note",
      });
      return true;
    } catch (error) {
      const message = apiError(error, "Unable to update this note.");
      setStorageError(message);
      addNotification({
        title: "Unable to update note",
        message,
        type: "note",
        variant: "error",
      });
      return false;
    } finally {
      setUpdatingNoteId(null);
    }
  };

  const toggleFavourite = async (note) => {
    await updateNote(note.id, { favourite: !note.favourite });
  };

  const deleteNote = async (noteId) => {
    if (!userId) return;

    setDeletingNote(true);
    try {
      await notesApi.delete(`/deleteNote/${noteId}`, { data: { userId } });
      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== noteId)
      );
      setStorageError("");
      setNotePendingDelete(null);
      addNotification({
        title: "Note deleted",
        message: "The note was permanently deleted.",
        type: "note",
      });
    } catch (error) {
      const message = apiError(error, "Unable to delete this note.");
      setStorageError(message);
      addNotification({
        title: "Unable to delete note",
        message,
        type: "note",
        variant: "error",
      });
    } finally {
      setDeletingNote(false);
      setOpenMenu(null);
    }
  };

  const tagCount = (tagId) => notes.filter((note) => note.tag === tagId).length;

  return (
    <div className="notes-view flex min-h-0 flex-1 flex-col gap-3 overflow-hidden bg-[#f7f8fa] p-2.5 sm:p-4 md:flex-row">
      <aside className="flex max-h-[34vh] w-full shrink-0 flex-col overflow-hidden rounded-xl border border-[#e8ebf2] bg-white p-3 shadow-[0_2px_8px_rgba(20,35,70,0.03)] sm:p-4 md:h-full md:max-h-none md:w-[250px]">
        <div className="flex shrink-0 items-center gap-3 border-b border-[#e8ebf2] pb-3">
          <TbNote size={23} className="text-[#3b4563]" />
          <h1 className="text-xl font-medium text-[#172033]">Notes</h1>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-[#e8ebf2] py-1 md:block md:space-y-1">
          <button
            type="button"
            onClick={() => {
              setSelectedFilter("all");
              setSelectedTag(null);
            }}
            aria-current={
              selectedFilter === "all" && !selectedTag ? "page" : undefined
            }
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition sm:px-3 sm:text-sm md:w-full md:flex-none md:gap-3 ${
              selectedFilter === "all" && !selectedTag
                ? "bg-[#f0f1f3] font-medium text-[#4361ee]"
                : "text-[#3b4563] hover:bg-[#f7f8fc]"
            }`}
          >
            <TbNotes size={19} />
            <span className="truncate">All Notes</span>
            <span className="ml-auto text-xs text-[#8490a5]">{notes.length}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedFilter("favourites");
              setSelectedTag(null);
            }}
            aria-current={selectedFilter === "favourites" ? "page" : undefined}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition sm:px-3 sm:text-sm md:w-full md:flex-none md:gap-3 ${
              selectedFilter === "favourites"
                ? "bg-[#f0f1f3] font-medium text-[#4361ee]"
                : "text-[#3b4563] hover:bg-[#f7f8fc]"
            }`}
          >
            <FiStar size={19} />
            <span className="truncate">Favourites</span>
            <span className="ml-auto text-xs text-[#8490a5]">
              {notes.filter((note) => note.favourite).length}
            </span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto py-2 md:overflow-y-auto md:overflow-x-hidden">
          <p className="mb-2 hidden px-1 text-sm text-[#8490a5] md:block">Tags</p>
          <div className="flex min-w-max gap-2 md:block md:min-w-0 md:space-y-1">
            {TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  setSelectedFilter("all");
                  setSelectedTag((current) =>
                    current === tag.id ? null : tag.id
                  );
                }}
                aria-pressed={selectedTag === tag.id}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition hover:bg-[#f7f8fc] sm:text-sm md:w-full md:gap-3 md:py-2.5 ${
                  selectedTag === tag.id ? "bg-[#f7f8fc] font-medium" : ""
                }`}
                style={{ color: tag.color }}
              >
                <TbDiamond size={17} fill="currentColor" />
                <span>{tag.label}</span>
                <span className="ml-auto text-xs opacity-70">
                  {tagCount(tag.id)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!userId || loading}
          onClick={() => {
            setEditorNote(null);
            setEditorOpen(true);
          }}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#4361ee] px-4 text-sm font-medium text-white shadow-[0_8px_18px_-8px_#4361ee] transition hover:bg-[#3451d1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiPlus size={19} />
          Add New Note
        </button>
      </aside>

      <section className="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-xl border border-[#e8ebf2] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_8px_rgba(20,35,70,0.03)]">
        <div className="p-3 sm:p-5">
          {/* Notes Top Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {selectedFilter === "favourites"
                  ? "Favourite Notes"
                  : selectedTag
                  ? `${selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1)} Notes`
                  : "All Notes"}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {visibleNotes.length} {visibleNotes.length === 1 ? "note" : "notes"} shown
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
              />
            </div>
          </div>
        {storageError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>{storageError}</span>
              {userId && (
                <button
                  type="button"
                  onClick={() => setReloadKey((current) => current + 1)}
                  className="font-medium underline underline-offset-2"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-full items-center justify-center px-4 py-16 text-sm text-[#8490a5]">
            Loading your notes...
          </div>
        ) : visibleNotes.length === 0 && storageError ? (
          <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f2] text-[#e11d48]">
              <TbNotes size={23} />
            </span>
            <h2 className="text-base font-semibold text-[#172033]">
              {userId ? "Notes are unavailable" : "Sign in to access Notes"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-[#8490a5]">
              {userId
                ? "Check your connection to the backend, then try again."
                : "Sign in to load and save your notes to MongoDB."}
            </p>
          </div>
        ) : visibleNotes.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4361ee]">
              <TbNotes size={23} />
            </span>
            <h2 className="text-base font-semibold text-[#172033]">
              {selectedFilter === "favourites"
                ? "No favourite notes yet"
                : selectedTag
                ? `No ${TAGS.find((tag) => tag.id === selectedTag)?.label} notes yet`
                : "No notes yet"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-[#8490a5]">
              {selectedFilter === "favourites"
                ? "Mark a note as a favourite and it will appear here."
                : "Add a note to keep useful details and ideas in one place."}
            </p>
            {selectedFilter !== "favourites" && (
              <button
                type="button"
                onClick={() => setEditorOpen(true)}
                disabled={!userId || loading}
                className="mt-4 rounded-lg bg-[#4361ee] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3451d1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:gap-5">
            {visibleNotes.map((note, index) => {
              const color =
                NOTE_COLORS.find((option) => option.id === note.color) ||
                NOTE_COLORS[1];
              const tag = TAGS.find((option) => option.id === note.tag);
              return (
                <article
                  key={note.id}
                  className={`note-card-outline relative grid aspect-square min-h-0 w-full grid-rows-[auto_auto_minmax(0,1fr)_auto] rounded-[10px] border p-4 shadow-[0_1px_3px_rgba(17,24,39,0.10)] sm:p-5 ${color.card} ${color.border}`}
                  style={{
                    "--note-outline": color.outline,
                    animationDelay: `${Math.min(index, 8) * 45}ms`,
                  }}
                >
                  <div className="mb-3 flex min-h-0 items-start gap-3 pr-7 text-left">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#dbe4f0] text-xs font-semibold text-[#3b4563] shadow-sm">
                      {getInitials(note.author || author)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-semibold text-[#111827]">
                        {note.author || author}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-[#8792a2]">
                        {formatDate(note.updatedAt || note.createdAt)}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditorNote(note);
                      setEditorOpen(true);
                    }}
                    className="mb-2 block w-full justify-self-stretch line-clamp-2 overflow-hidden text-left text-[17px] font-semibold leading-6 text-[#111827] hover:text-[#4361ee]"
                  >
                    {note.title}
                  </button>
                  <p
                    title={note.body || undefined}
                    className="note-card-description mb-3 min-h-0 w-full text-left text-base leading-6 text-[#8792a2]"
                  >
                    {note.body || "No details added."}
                  </p>

                  <div className="mt-auto flex min-h-8 items-center justify-between">
                    <TbDiamond
                      size={18}
                      fill="currentColor"
                      className="shrink-0"
                      style={{ color: tag?.color || "#94a3b8" }}
                      aria-label={`${tag?.label || "Untagged"} tag`}
                      title={tag?.label || "Untagged"}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNotePendingDelete(note)}
                        aria-label={`Delete ${note.title}`}
                        title="Delete note"
                        className="rounded p-1.5 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <FiTrash2 size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavourite(note)}
                                        disabled={updatingNoteId === note.id}
                        aria-label={
                          note.favourite
                            ? `Remove ${note.title} from favourites`
                            : `Add ${note.title} to favourites`
                        }
                        aria-pressed={Boolean(note.favourite)}
                        title={note.favourite ? "Unfavourite" : "Favourite"}
                        className={`rounded p-1.5 transition hover:bg-amber-50 ${
                          note.favourite
                            ? "text-amber-500"
                            : "text-amber-500 hover:text-amber-600"
                        }`}
                      >
                        {updatingNoteId === note.id ? (
                          <LoadingSpinner className="h-[18px] w-[18px]" />
                        ) : (
                          <FiStar
                            size={18}
                            fill={note.favourite ? "currentColor" : "none"}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="absolute right-3 top-3">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu((current) =>
                          current === note.id ? null : note.id
                        )
                      }
                      aria-label={`More actions for ${note.title}`}
                      aria-expanded={openMenu === note.id}
                      className="rounded-full p-1 text-[#7890c5] transition hover:bg-white/70"
                    >
                      <FiMoreVertical size={18} />
                    </button>
                    {openMenu === note.id && (
                      <div className="absolute right-0 top-8 z-10 w-32 rounded-lg border border-[#e5e7eb] bg-white p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setEditorNote(note);
                            setEditorOpen(true);
                            setOpenMenu(null);
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-[#3b4563] hover:bg-[#f4f6f8]"
                        >
                          Edit note
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNotePendingDelete(note);
                            setOpenMenu(null);
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                        >
                          Delete note
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </div>
      </section>

      {editorOpen && (
        <NoteEditor
          note={editorNote}
          onClose={() => {
            setEditorOpen(false);
            setEditorNote(null);
          }}
          onSave={saveNote}
        />
      )}
      {notePendingDelete && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingNote) {
              setNotePendingDelete(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-note-title"
            aria-describedby="delete-note-description"
            className="w-full max-w-sm rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <FiAlertTriangle size={20} />
              </span>
              <div>
                <h2 id="delete-note-title" className="text-base font-semibold text-[#172033]">
                  Delete this note?
                </h2>
                <p id="delete-note-description" className="mt-1 text-sm leading-5 text-[#64748b]">
                  “{notePendingDelete.title}” will be permanently deleted. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deletingNote}
                onClick={() => setNotePendingDelete(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#64748b] hover:bg-[#f2f4f8] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingNote}
                onClick={() => deleteNote(notePendingDelete.id)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
              >
                {deletingNote ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner />
                    Deleting...
                  </span>
                ) : (
                  "Delete note"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

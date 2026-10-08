import React, { useCallback, useEffect, useMemo, useState } from "react";
import { chatApi } from "../../services/api";
import useUrlState from "../../shared/hooks/useUrlState";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { addNotification } from "../tasks/notificationUtils";
import {
  FiArrowLeft,
  FiMessageCircle,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiX,
} from "react-icons/fi";

const getUserId = () => sessionStorage.getItem("id");

const getOtherParticipant = (conversation, userId) =>
  conversation.participants?.find(
    (participant) => String(participant._id) !== String(userId)
  );

const displayName = (participant) =>
  participant?.username || participant?.email || "Unknown user";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

function NewConversationDialog({ onClose, onStart }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const recipientEmail = email.trim();
    if (!recipientEmail) {
      setError("Enter the email address of a registered account.");
      return;
    }

    setStarting(true);
    setError("");
    try {
      await onStart(recipientEmail);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to start a conversation.";
      setError(message);
      addNotification({
        title: "Unable to start conversation",
        message,
        type: "chat",
        variant: "error",
      });
    } finally {
      setStarting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !starting) onClose();
      }}
    >
      <form
        onSubmit={submit}
        aria-labelledby="new-chat-title"
        className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="new-chat-title" className="text-lg font-semibold text-[#172033]">
              Start a conversation
            </h2>
            <p className="mt-1 text-sm text-[#8490a3]">
              Enter the email address registered to the account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={starting}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-[#8490a3] hover:bg-[#f3f5f8]"
          >
            <FiX size={18} />
          </button>
        </div>

        <label
          htmlFor="chat-recipient-email"
          className="mb-2 block text-sm font-medium text-[#3b4563]"
        >
          Account email
        </label>
        <input
          id="chat-recipient-email"
          type="email"
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className="workspace-input w-full rounded-lg px-3 py-2.5 text-sm"
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={starting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#64748b] hover:bg-[#f3f5f8]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={starting}
            className="rounded-lg bg-[#4361ee] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3452df] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner />
                Starting...
              </span>
            ) : (
              "Start chat"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChatView() {
  const userId = getUserId();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useUrlState(
    "conversation",
    ""
  );
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);

  const refreshConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await chatApi.get(`/conversations/${userId}`);
      const nextConversations = response.data.conversations || [];
      setConversations(nextConversations);
      setError("");
      // Auto-selection should not add a Back-button step.
      setSelectedConversationId(
        (currentId) =>
          currentId &&
          nextConversations.some(
            (conversation) => conversation._id === currentId
          )
            ? currentId
            : nextConversations[0]?._id || "",
        { replace: true }
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  }, [userId]);

  const refreshMessages = useCallback(
    async (showLoading = false, signal) => {
      if (!userId || !selectedConversationId) {
        setMessages([]);
        return;
      }
      if (showLoading) setLoadingMessages(true);
      try {
        const response = await chatApi.get(
          `/conversations/${selectedConversationId}/messages`,
          { params: { userId, limit: 100 }, signal }
        );
        setMessages(response.data.messages || []);
      } catch (requestError) {
        if (requestError.code !== "ERR_CANCELED") {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load messages."
          );
        }
      } finally {
        if (showLoading && signal?.aborted !== true) setLoadingMessages(false);
      }
    },
    [selectedConversationId, userId]
  );

  useEffect(() => {
    refreshConversations();
    const intervalId = window.setInterval(refreshConversations, 10000);
    return () => window.clearInterval(intervalId);
  }, [refreshConversations]);

  useEffect(() => {
    const controller = new AbortController();
    refreshMessages(true, controller.signal);
    const intervalId = window.setInterval(
      () => refreshMessages(false, controller.signal),
      4000
    );
    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [refreshMessages]);

  const selectedConversation = conversations.find(
    (conversation) => conversation._id === selectedConversationId
  );
  const selectedParticipant = selectedConversation
    ? getOtherParticipant(selectedConversation, userId)
    : null;

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const participant = getOtherParticipant(conversation, userId);
      return `${participant?.username || ""} ${participant?.email || ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [conversations, search, userId]);

  const startConversation = async (recipientEmail) => {
    const response = await chatApi.post("/conversations", {
      userId,
      recipientEmail,
    });
    const conversation = response.data.conversation;
    setConversations((current) => [
      conversation,
      ...current.filter((item) => item._id !== conversation._id),
    ]);
    setSelectedConversationId(conversation._id);
    setMessages([]);
    setShowNewConversation(false);
    addNotification({
      title: "Conversation started",
      message: "Your new conversation is ready.",
      type: "chat",
    });
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selectedConversationId || sending) return;

    setSending(true);
    setError("");
    try {
      const response = await chatApi.post(
        `/conversations/${selectedConversationId}/messages`,
        { userId, text }
      );
      setMessages((current) => [...current, response.data.message]);
      setDraft("");
      refreshConversations();
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to send message.";
      setError(
        message
      );
      addNotification({
        title: "Unable to send message",
        message,
        type: "chat",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  if (!userId) {
    return (
      <div className="chat-view flex h-full min-h-0 flex-col items-center justify-center p-6 text-center">
        <FiMessageCircle size={36} className="mb-3 text-[#4361ee]" />
        <h1 className="text-lg font-semibold text-[#172033]">Sign in to use Chat</h1>
        <p className="mt-2 max-w-sm text-sm text-[#8490a3]">
          Conversations are connected to registered Todo app accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-view flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={`w-full shrink-0 flex-col border-r border-[#e5e9f0] bg-white md:flex md:w-[310px] ${
            selectedConversationId ? "hidden" : "flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#edf0f5] px-4 py-3 sm:px-5 sm:py-5">
            <div>
              <h1 className="text-xl font-semibold text-[#172033]">Chat</h1>
              <p className="mt-1 text-xs text-[#8490a3]">
                Direct messages with Todo accounts
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewConversation(true)}
              title="Start a conversation"
              aria-label="Start a conversation"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4361ee] text-white transition hover:bg-[#3452df]"
            >
              <FiPlus size={19} />
            </button>
          </div>

          <label className="relative mx-3 my-3 block sm:mx-4 sm:my-4">
            <FiSearch
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              className="workspace-input w-full bg-[#f8f9fb] py-2.5 pl-9 pr-3 text-sm"
            />
          </label>

          {error && (
            <div role="alert" className="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingConversations ? (
              <p className="px-5 py-8 text-center text-sm text-[#8490a3]">
                Loading conversations...
              </p>
            ) : filteredConversations.length ? (
              filteredConversations.map((conversation) => {
                const participant = getOtherParticipant(conversation, userId);
                const active = conversation._id === selectedConversationId;
                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation._id)}
                    className={`flex w-full items-start gap-3 border-b border-[#f0f2f6] px-4 py-4 text-left transition ${
                      active ? "bg-[#eef1ff]" : "hover:bg-[#f8f9fb]"
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6ebff] text-sm font-semibold text-[#4361ee]">
                      {displayName(participant).slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-[#263248]">
                          {displayName(participant)}
                        </span>
                        <span className="shrink-0 text-[11px] text-[#9aa4b2]">
                          {formatTime(conversation.lastMessage?.sentAt)}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#8490a3]">
                        {conversation.lastMessage?.text || "Start a conversation"}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-10 text-center">
                <FiMessageCircle size={25} className="mx-auto mb-2 text-[#aab4c3]" />
                <p className="text-sm font-medium text-[#536176]">
                  {search ? "No matching conversations" : "No conversations yet"}
                </p>
                <p className="mt-1 text-xs text-[#8490a3]">
                  Start a chat using a registered account email.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section
          className={`min-w-0 flex-1 flex-col bg-[#fbfcfe] ${
            selectedConversationId ? "flex" : "hidden md:flex"
          }`}
          aria-label="Conversation"
        >
          {selectedConversation ? (
            <>
              <header className="flex items-center gap-3 border-b border-[#e5e9f0] bg-white px-4 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setSelectedConversationId("")}
                  aria-label="Back to conversations"
                  className="rounded-lg p-2 text-[#64748b] hover:bg-[#f3f5f8] md:hidden"
                >
                  <FiArrowLeft size={18} />
                </button>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6ebff] text-sm font-semibold text-[#4361ee]">
                  {displayName(selectedParticipant).slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-[#263248]">
                    {displayName(selectedParticipant)}
                  </h2>
                  <p className="truncate text-xs text-[#8490a3]">
                    {selectedParticipant?.email || "Todo account"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refreshMessages(true)}
                  aria-label="Refresh messages"
                  title="Refresh messages"
                  className="ml-auto rounded-lg p-2 text-[#8490a3] hover:bg-[#f3f5f8] hover:text-[#4361ee]"
                >
                  <FiRefreshCw size={16} />
                </button>
              </header>

              {error && (
                <div role="alert" className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 sm:mx-6">
                  {error}
                </div>
              )}

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
                {loadingMessages ? (
                  <p className="py-8 text-center text-sm text-[#8490a3]">
                    Loading messages...
                  </p>
                ) : messages.length ? (
                  messages.map((message) => {
                    const ownMessage =
                      String(message.sender?._id || message.sender) ===
                      String(userId);
                    return (
                      <div
                        key={message._id}
                        className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                            ownMessage
                              ? "rounded-br-md bg-[#4361ee] text-white"
                              : "rounded-bl-md border border-[#e5e9f0] bg-white text-[#263248]"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.text}
                          </p>
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              ownMessage ? "text-white/70" : "text-[#9aa4b2]"
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef1ff] text-[#4361ee]">
                      <FiMessageCircle size={24} />
                    </span>
                    <h3 className="text-sm font-semibold text-[#3b4563]">
                      Your conversation starts here
                    </h3>
                    <p className="mt-1 text-xs text-[#8490a3]">
                      Send a message to {displayName(selectedParticipant)}.
                    </p>
                  </div>
                )}
              </div>

              <form
                onSubmit={sendMessage}
                className="border-t border-[#e5e9f0] bg-white p-3 sm:p-4"
              >
                <div className="flex items-end gap-2 rounded-xl border border-[#e5e9f0] bg-[#f8f9fb] p-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        event.currentTarget.form.requestSubmit();
                      }
                    }}
                    maxLength={5000}
                    rows={1}
                    placeholder="Write a message..."
                    aria-label="Write a message"
                    className="workspace-input max-h-32 min-h-10 flex-1 resize-y bg-white px-2 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    aria-label="Send message"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4361ee] text-white transition hover:bg-[#3452df] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {sending ? (
                      <LoadingSpinner />
                    ) : (
                      <FiSend size={17} />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 px-1 text-[10px] text-[#9aa4b2]">
                  Enter to send · Shift+Enter for a new line
                </p>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef1ff] text-[#4361ee]">
                <FiMessageCircle size={29} />
              </span>
              <h2 className="text-lg font-semibold text-[#263248]">Your messages</h2>
              <p className="mt-2 max-w-sm text-sm text-[#8490a3]">
                Choose a conversation or start a new one with another registered account.
              </p>
              <button
                type="button"
                onClick={() => setShowNewConversation(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#4361ee] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3452df]"
              >
                <FiPlus size={16} />
                Start a conversation
              </button>
            </div>
          )}
        </section>
      </div>

      {showNewConversation && (
        <NewConversationDialog
          onClose={() => setShowNewConversation(false)}
          onStart={startConversation}
        />
      )}
    </div>
  );
}

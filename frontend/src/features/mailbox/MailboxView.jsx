import React, { useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { mailboxApi } from "../../services/api";
import useUrlState from "../../shared/hooks/useUrlState";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { addNotification } from "../tasks/notificationUtils";
import {
  FiArchive,
  FiAlertCircle,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiHelpCircle,
  FiInbox,
  FiMail,
  FiMenu,
  FiMoreVertical,
  FiPaperclip,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiSettings,
  FiStar,
  FiTrash2,
  FiTag,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  TbArrowBackUp,
  TbArrowForwardUp,
  TbBookmark,
  TbBriefcase,
  TbPrinter,
} from "react-icons/tb";

const STORAGE_PREFIX = "todolist.mailbox.v1";
const PAGE_SIZE = 10;

const categories = [
  { id: "personal", label: "Personal", color: "#5270ff", icon: FiUser },
  { id: "work", label: "Work", color: "#c99700", icon: TbBriefcase },
  { id: "social", label: "Social", color: "#00a85a", icon: FiUsers },
  { id: "private", label: "Private", color: "#f04452", icon: FiTag },
];

const demoMessages = [
  {
    sender: "Laurie Fox",
    address: "laurie@example.test",
    subject: "Promotion Page",
    preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    body: "Hi there,\n\nThe promotion page is ready for a quick review. I have attached the latest draft and added the requested copy updates.\n\nLet me know what you would change.\n\nThanks,\nLaurie",
    category: "personal",
    starred: true,
    unread: true,
    attachment: true,
  },
  {
    sender: "Andy King",
    address: "andy@example.test",
    subject: "Hosting Payment Reminder",
    preview: "Lorem ipsum dolor sit amet, please review the renewal date.",
    body: "Hello,\n\nA reminder that the hosting plan is coming up for renewal. Please check the billing details when you have a moment.\n\nRegards,\nAndy",
    category: "work",
    starred: false,
    unread: false,
    attachment: false,
  },
  {
    sender: "Kristen Beck",
    address: "kristen@example.test",
    subject: "Verification Link",
    preview: "Lorem ipsum dolor sit amet, use the link to verify your account.",
    body: "Hi,\n\nYour account is ready. Use the verification link in the attached instructions to complete setup.\n\nBest,\nKristen",
    category: "private",
    starred: false,
    unread: true,
    attachment: false,
  },
  {
    sender: "Christian",
    address: "christian@example.test",
    subject: "New Updates",
    preview: "Lorem ipsum dolor sit amet, here are the latest team updates.",
    body: "Hello team,\n\nHere is a short round-up of the latest updates. The notes are ready for review and the next check-in is on the calendar.\n\nCheers,\nChristian",
    category: "work",
    starred: false,
    unread: false,
    attachment: true,
  },
  {
    sender: "Roxanne",
    address: "roxanne@example.test",
    subject: "Schedular Alert",
    preview: "Lorem ipsum dolor sit amet, your weekly schedule is ready.",
    body: "Hi,\n\nYour schedule for this week is ready. Please check the upcoming dates and let me know if anything needs to move.\n\nThanks,\nRoxanne",
    category: "personal",
    starred: false,
    unread: true,
    attachment: false,
  },
  {
    sender: "Nia Hill",
    address: "nia@example.test",
    subject: "Motion UI Kit",
    preview: "A few design details for the new interface are attached.",
    body: "Hi,\n\nI have put together a few options for the motion UI kit. The attached reference includes the timings and interaction states.\n\nNia",
    category: "work",
    starred: true,
    unread: false,
    attachment: true,
  },
  {
    sender: "Max Smith",
    address: "max@example.test",
    subject: "Meeting Notes",
    preview: "Sharing a recap and the action items from our meeting.",
    body: "Hello,\n\nThanks for the discussion today. I have captured the action items and owners in the attached recap.\n\nMax",
    category: "social",
    starred: false,
    unread: false,
    attachment: true,
  },
  {
    sender: "John Doe",
    address: "john@example.test",
    subject: "Travel Details",
    preview: "Here are the details for next week's trip.",
    body: "Hi,\n\nThe travel details are all confirmed. Please let me know if you need anything else before next week.\n\nJohn",
    category: "personal",
    starred: false,
    unread: false,
    attachment: false,
  },
  {
    sender: "Karena Courtliff",
    address: "karena@example.test",
    subject: "Community Update",
    preview: "A few highlights from the community this month.",
    body: "Hello,\n\nHere are this month's community highlights. Thank you for taking part and sharing your feedback.\n\nKarena",
    category: "social",
    starred: false,
    unread: true,
    attachment: false,
  },
  {
    sender: "Kia Jain",
    address: "kia@example.test",
    subject: "Download Documents",
    preview: "The requested documents are ready to download.",
    body: "Hi,\n\nI have prepared the requested documents. Please review them and get back to me if you need a different format.\n\nKia",
    category: "private",
    starred: false,
    unread: false,
    attachment: true,
  },
  {
    sender: "Sam Wilson",
    address: "sam@example.test",
    subject: "Project Check-in",
    preview: "Can we confirm the goals for our next check-in?",
    body: "Hi,\n\nCould you confirm the goals for the next check-in? I want to make sure we leave enough time to review the open questions.\n\nSam",
    category: "work",
    starred: false,
    unread: false,
    attachment: false,
  },
  {
    sender: "Maya Chen",
    address: "maya@example.test",
    subject: "Weekend Plans",
    preview: "Are we still on for Saturday afternoon?",
    body: "Hey,\n\nAre we still on for Saturday afternoon? Let me know what time works for you.\n\nMaya",
    category: "social",
    starred: false,
    unread: false,
    attachment: false,
  },
];

const folderOptions = [
  { id: "inbox", label: "Inbox", icon: FiInbox },
  { id: "marked", label: "Starred", icon: FiStar },
  { id: "important", label: "Important", icon: TbBookmark },
  { id: "sent", label: "Sent", icon: FiSend },
  { id: "spam", label: "Spam", icon: FiAlertCircle },
  { id: "drafts", label: "Drafts", icon: FiMail },
  { id: "trash", label: "Trash", icon: FiTrash2 },
];

const normalizeMailboxMessage = (message) => ({
  ...message,
  id: message._id || message.id,
  createdAt: message.createdAt
    ? new Date(message.createdAt).toISOString()
    : new Date().toISOString(),
  updatedAt: message.updatedAt
    ? new Date(message.updatedAt).toISOString()
    : new Date().toISOString(),
});

const mailboxError = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const makeDemoMessages = () => {
  const now = Date.now();
  const additionalSenders = [
    "Taylor Reed",
    "Morgan Lee",
    "Alex Rivera",
    "Jamie Park",
    "Robin Bell",
    "Casey Brooks",
    "Avery Scott",
    "Drew Carter",
    "Riley James",
    "Cameron Blake",
    "Jordan Lane",
    "Skylar West",
  ];
  const allInboxMessages = [
    ...demoMessages,
    ...additionalSenders.map((sender, index) => ({
      sender,
      address: `${sender.toLowerCase().replace(/\s+/g, ".")}@example.test`,
      subject: [
        "Weekly Project Update",
        "Design Review",
        "Account Information",
        "Team Check-in",
      ][index % 4],
      preview: "A quick update with the details and next steps.",
      body: `Hello,\n\nHere is a quick update for you. Please review the details and let me know if anything needs to change.\n\nThanks,\n${sender}`,
      category: categories[index % categories.length].id,
      starred: index % 6 === 0,
      unread: index % 4 === 0,
      attachment: index % 3 === 0,
    })),
  ];
  const inbox = allInboxMessages.map((message, index) => ({
    ...message,
    id: `demo-${index + 1}`,
    folder: "inbox",
    sentByMe: false,
    createdAt: new Date(now - index * 3_600_000).toISOString(),
  }));
  const drafts = [
    {
      id: "draft-demo-1",
      to: "team@example.test",
      sender: "You",
      address: "you@local.demo",
      subject: "Planning for next week",
      preview: "A draft message waiting to be finished.",
      body: "Hello team,\n\nHere is the outline for next week.",
      category: "work",
      starred: false,
      unread: false,
      attachment: false,
      folder: "drafts",
      sentByMe: true,
      createdAt: new Date(now - 2 * 86_400_000).toISOString(),
    },
    {
      id: "draft-demo-2",
      to: "",
      sender: "You",
      address: "you@local.demo",
      subject: "Weekend notes",
      preview: "A draft message waiting to be finished.",
      body: "",
      category: "personal",
      starred: false,
      unread: false,
      attachment: false,
      folder: "drafts",
      sentByMe: true,
      createdAt: new Date(now - 86_400_000).toISOString(),
    },
  ];

  return [...inbox, ...drafts];
};

const storageKeyFor = (user) =>
  `${STORAGE_PREFIX}.${sessionStorage.getItem("id") || user?._id || "local"}`;

const loadMailbox = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { messages: makeDemoMessages(), error: "" };

    const messages = JSON.parse(raw);
    if (
      !Array.isArray(messages) ||
      messages.some(
        (message) =>
          !message ||
          typeof message.id !== "string" ||
          typeof message.folder !== "string" ||
          typeof message.subject !== "string"
      )
    ) {
      return {
        messages: [],
        error: "Saved mailbox data is invalid and could not be loaded.",
      };
    }

    return { messages, error: "" };
  } catch {
    return {
      messages: [],
      error: "Saved mailbox data could not be loaded from this browser.",
    };
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const initialsFor = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

const formatListDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
};

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const escapeHtml = (text = "") =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isHtml = (text = "") => /<\/?[a-z][\s\S]*>/i.test(text);

const ALLOWED_TAGS = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "CODE", "DIV", "EM", "H1", "H2", "H3", "I",
  "LI", "OL", "P", "PRE", "S", "SPAN", "STRIKE", "STRONG", "U", "UL",
]);
// Removed together with their contents instead of being unwrapped.
const DROPPED_TAGS = new Set([
  "BUTTON", "EMBED", "FORM", "IFRAME", "INPUT", "LINK", "MATH", "META",
  "NOSCRIPT", "OBJECT", "SCRIPT", "SELECT", "STYLE", "SVG", "TEMPLATE",
  "TEXTAREA",
]);

// Message bodies are rich text from the editor; keep only safe formatting.
const sanitizeHtml = (html = "") => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const clean = (parent) => {
    Array.from(parent.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) return;
      if (node.nodeType !== Node.ELEMENT_NODE) {
        node.remove();
        return;
      }
      const tag = node.nodeName.toUpperCase();
      if (DROPPED_TAGS.has(tag)) {
        node.remove();
        return;
      }
      clean(node);
      if (!ALLOWED_TAGS.has(tag)) {
        node.replaceWith(...node.childNodes);
        return;
      }
      Array.from(node.attributes).forEach(({ name, value }) => {
        const safeLink =
          tag === "A" && name === "href" && /^(https?:|mailto:)/i.test(value.trim());
        const editorClass = name === "class" && /^(ql-[\w-]+\s*)+$/.test(value);
        if (!safeLink && !editorClass) node.removeAttribute(name);
      });
      if (tag === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
  };
  clean(doc.body);
  return doc.body.innerHTML;
};

const htmlToText = (html = "") => {
  if (!isHtml(html)) return html;
  const spaced = html.replace(/<(br|\/p|\/li|\/div|\/h\d|\/blockquote)[^>]*>/gi, "$& ");
  const doc = new DOMParser().parseFromString(spaced, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

// Older messages are plain text; newer ones are editor HTML.
const bodyToHtml = (body = "") =>
  isHtml(body)
    ? sanitizeHtml(body)
    : body
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
        .join("");

const messageBodyHtml = (message) =>
  bodyToHtml(message.body || message.preview || "");

// headingLines: one line of text, or several to show on separate lines.
const quotedMessageHtml = (message, headingLines) =>
  `<p><br></p><p>${[]
    .concat(headingLines)
    .map(escapeHtml)
    .join("<br>")}</p><blockquote>${messageBodyHtml(message)}</blockquote>`;

const printMessage = (message) => {
  const printWindow = window.open("", "_blank", "width=820,height=900");
  if (!printWindow) return false;
  const row = (label, value) =>
    value ? `<div><strong>${label}:</strong> ${escapeHtml(value)}</div>` : "";
  const files = (message.attachments || [])
    .map((file) => `<li>${escapeHtml(file.name)} (${formatFileSize(file.size)})</li>`)
    .join("");
  printWindow.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(message.subject)}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #172033; margin: 32px; line-height: 1.6; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  .meta { font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
  blockquote { border-left: 3px solid #cbd5e1; margin: 0; padding-left: 12px; color: #475569; }
</style></head><body>
<h1>${escapeHtml(message.subject)}</h1>
<div class="meta">
  ${row("From", `${message.sender} <${message.address}>`)}
  ${row("To", message.sentByMe ? message.to : "you")}
  ${row("Cc", message.cc)}
  ${row("Date", formatDateTime(message.createdAt))}
</div>
<div>${messageBodyHtml(message)}</div>
${files ? `<h2 style="font-size:14px">Attachments</h2><ul>${files}</ul>` : ""}
</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onafterprint = () => printWindow.close();
  printWindow.print();
  return true;
};

const base64ToBlob = (data, type) => {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type });
};


const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const MAX_BODY_LENGTH = 50000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

const splitAddresses = (value) =>
  value
    .split(/[,;]/)
    .map((address) => address.trim())
    .filter(Boolean);

const invalidAddressIn = (value) =>
  splitAddresses(value).find((address) => !EMAIL_PATTERN.test(address));

const readAttachment = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        data: String(reader.result).split(",")[1] || "",
      });
    reader.onerror = () => reject(new Error(`${file.name} could not be read.`));
    reader.readAsDataURL(file);
  });

function ComposeMessage({ initialMessage, onClose, onSave }) {
  const [to, setTo] = useState(initialMessage?.to || "");
  const [cc, setCc] = useState(initialMessage?.cc || "");
  const [bcc, setBcc] = useState(initialMessage?.bcc || "");
  const [showCopies, setShowCopies] = useState(
    Boolean(initialMessage?.cc || initialMessage?.bcc)
  );
  const [subject, setSubject] = useState(initialMessage?.subject || "");
  const [body, setBody] = useState(() => bodyToHtml(initialMessage?.body));
  const [category, setCategory] = useState(
    initialMessage?.category || "personal"
  );
  const [attachments, setAttachments] = useState(
    initialMessage?.attachments || []
  );
  const [draftId] = useState(initialMessage?.id || "");
  const [error, setError] = useState("");
  const [savingAction, setSavingAction] = useState("");
  const saving = Boolean(savingAction);

  const title =
    initialMessage?.mode === "reply"
      ? "Reply"
      : initialMessage?.mode === "forward"
      ? "Forward"
      : initialMessage?.id
      ? "Edit draft"
      : "New Message";

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
      return;
    }
    const tooLarge = files.find((file) => file.size > MAX_ATTACHMENT_BYTES);
    if (tooLarge) {
      setError(`${tooLarge.name} is larger than 2 MB.`);
      return;
    }
    try {
      const loaded = await Promise.all(files.map(readAttachment));
      setAttachments((current) => [...current, ...loaded]);
      setError("");
    } catch (readError) {
      setError(readError.message);
    }
  };

  const removeAttachment = (file) =>
    setAttachments((current) => current.filter((item) => item !== file));

  const content = () => ({
    ...(initialMessage || {}),
    to: to.trim(),
    cc: showCopies ? cc.trim() : "",
    bcc: showCopies ? bcc.trim() : "",
    subject: subject.trim(),
    body: htmlToText(body).trim() ? body : "",
    category,
    attachments,
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!to.trim() || !subject.trim() || !htmlToText(body).trim()) {
      setError("Add a recipient, subject, and message before sending.");
      return;
    }
    const invalidAddress =
      invalidAddressIn(to) ||
      (showCopies && (invalidAddressIn(cc) || invalidAddressIn(bcc)));
    if (invalidAddress) {
      setError(`"${invalidAddress}" is not a valid email address.`);
      return;
    }
    if (body.length > MAX_BODY_LENGTH) {
      setError("This message is too long. Shorten it and try again.");
      return;
    }
    setSavingAction("send");
    try {
      const saved = await onSave(content(), "sent");
      if (!saved) setError("Unable to save this message. Please try again.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save this message.");
    } finally {
      setSavingAction("");
    }
  };

  const saveDraft = async () => {
    if (body.length > MAX_BODY_LENGTH) {
      setError("This message is too long. Shorten it and try again.");
      return;
    }
    setSavingAction("draft");
    try {
      const draft = content();
      const saved = await onSave(
        {
          ...draft,
          id: draftId || undefined,
          subject: draft.subject || "(no subject)",
        },
        "drafts"
      );
      if (!saved) setError("Unable to save the draft. Please try again.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save the draft.");
    } finally {
      setSavingAction("");
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
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#e8ebf2] px-4 py-3">
          <h2 className="text-base font-semibold text-[#172033]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close message composer"
            className="rounded-full p-2 text-[#8490a5] hover:bg-[#f2f4f8]"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="mx-4 mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs text-blue-800">
          Messages are saved to your account mailbox. Sent messages are not
          delivered to an email provider.
        </div>

        <div className="space-y-2.5 p-4">
          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3 border-b border-[#eef0f4] pb-2 text-sm text-[#64748b]">
            <label htmlFor="mailbox-compose-to" className="w-16 shrink-0">
              To
            </label>
            <input
              id="mailbox-compose-to"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="name@example.com, another@example.com"
              className="workspace-input workspace-input-plain min-w-0 flex-1 py-1 text-[#172033]"
            />
            <button
              type="button"
              onClick={() => setShowCopies((current) => !current)}
              aria-expanded={showCopies}
              className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-[#4361ee] hover:bg-[#eef2ff]"
            >
              Cc/Bcc
            </button>
          </div>
          {showCopies && (
            <>
              <label className="flex items-center gap-3 border-b border-[#eef0f4] pb-2 text-sm text-[#64748b]">
                <span className="w-16 shrink-0">Cc</span>
                <input
                  value={cc}
                  onChange={(event) => setCc(event.target.value)}
                  placeholder="Separate addresses with commas"
                  className="workspace-input workspace-input-plain min-w-0 flex-1 py-1 text-[#172033]"
                />
              </label>
              <label className="flex items-center gap-3 border-b border-[#eef0f4] pb-2 text-sm text-[#64748b]">
                <span className="w-16 shrink-0">Bcc</span>
                <input
                  value={bcc}
                  onChange={(event) => setBcc(event.target.value)}
                  placeholder="Separate addresses with commas"
                  className="workspace-input workspace-input-plain min-w-0 flex-1 py-1 text-[#172033]"
                />
              </label>
            </>
          )}
          <label className="flex items-center gap-3 border-b border-[#eef0f4] pb-2 text-sm text-[#64748b]">
            <span className="w-16 shrink-0">Subject</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={160}
              placeholder="Message subject"
              className="workspace-input workspace-input-plain min-w-0 flex-1 py-1 text-[#172033]"
            />
          </label>
          <label className="flex items-center gap-3 text-sm text-[#64748b]">
            <span className="w-16 shrink-0">Label</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="workspace-input min-h-0 rounded-md px-2 py-1.5 text-sm"
            >
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="mailbox-editor">
            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              modules={quillModules}
              placeholder="Write your message..."
            />
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#cbd5e1] px-3 py-2 text-sm text-[#64748b] hover:border-[#4361ee] hover:text-[#4361ee]">
              <FiPaperclip size={16} />
              Attach files
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            <span className="ml-3 text-xs text-[#8490a5]">
              Up to {MAX_ATTACHMENTS} files, 2 MB each
            </span>
            {attachments.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <li
                    key={file._id || file.key}
                    className="flex max-w-full items-center gap-2 rounded-lg border border-[#e8ebf2] bg-[#f8fafc] py-1.5 pl-3 pr-1.5 text-sm text-[#3b4563]"
                  >
                    <FiPaperclip size={14} className="shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-[#8490a5]">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file)}
                      aria-label={`Remove ${file.name}`}
                      className="rounded p-1 text-[#8490a5] hover:bg-[#e9edf2] hover:text-rose-600"
                    >
                      <FiX size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#e8ebf2] px-3 py-3 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-[#64748b] hover:bg-[#f2f4f8] sm:px-3"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-[#64748b] hover:bg-[#f2f4f8] sm:px-3"
            >
              {savingAction === "draft" ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner />
                  Saving...
                </span>
              ) : (
                "Save draft"
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4361ee] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3451d1] disabled:cursor-wait disabled:opacity-60"
          >
            {savingAction === "send" ? (
              <>
                <LoadingSpinner />
                Sending...
              </>
            ) : (
              <>
                <FiSend size={16} />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function MailboxView({ user }) {
  const storageKey = storageKeyFor(user);
  const userId = sessionStorage.getItem("id") || user?._id || user?.id;
  const [initialData] = useState(() => loadMailbox(storageKey));
  const [messages, setMessages] = useState([]);
  const [storageError, setStorageError] = useState(initialData.error);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [reloadKey, setReloadKey] = useState(0);
  const [activeFolder, setActiveFolder] = useUrlState("folder", "inbox");
  const [categoryFilter, setCategoryFilter] = useUrlState("category", null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useUrlState("message", null);
  const [composeMessage, setComposeMessage] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [mobileFoldersOpen, setMobileFoldersOpen] = useState(false);
  const [showMoreFolders, setShowMoreFolders] = useState(false);
  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingMutation, setPendingMutation] = useState("");
  const [pageParam, setPageParam] = useUrlState("page", "1");
  const page = Math.max(1, Number(pageParam) || 1);
  const setPage = (nextPage) =>
    setPageParam((current) => {
      const currentPage = Math.max(1, Number(current) || 1);
      return typeof nextPage === "function" ? nextPage(currentPage) : nextPage;
    });

  React.useEffect(() => {
    let active = true;
    const loadMailboxFromServer = async () => {
      if (!userId) {
        setMessages([]);
        setStorageError("Sign in to load and save your account mailbox.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await mailboxApi.get(`/messages/${userId}`);
        let loadedMessages = response.data.messages || [];

        if (!loadedMessages.length) {
          if (initialData.error) {
            if (active) setStorageError(initialData.error);
          } else {
            const importResponse = await mailboxApi.post("/messages/import", {
              userId,
              messages: initialData.messages,
            });
            loadedMessages = importResponse.data.messages || [];
          }
        }

        if (active) {
          setMessages(loadedMessages.map(normalizeMailboxMessage));
          if (!initialData.error || loadedMessages.length) setStorageError("");
        }
      } catch (error) {
        if (active) {
          setMessages([]);
          setStorageError(
            mailboxError(error, "Unable to load your account mailbox.")
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadMailboxFromServer();
    return () => {
      active = false;
    };
  }, [initialData, userId, reloadKey]);

  const folderCounts = useMemo(() => {
    const active = messages.filter(
      (message) => !["trash", "spam"].includes(message.folder)
    );
    return {
      // Inbox shows unread mail, like most mail apps.
      inbox: messages.filter(
        (message) => message.folder === "inbox" && message.unread
      ).length,
      drafts: messages.filter((message) => message.folder === "drafts").length,
      marked: active.filter((message) => message.starred).length,
      important: active.filter((message) => message.important).length,
      spam: messages.filter((message) => message.folder === "spam").length,
    };
  }, [messages]);

  const folderMessages = useMemo(
    () =>
      messages.filter((message) => {
        if (activeFolder === "marked" || activeFolder === "important") {
          const flag = activeFolder === "marked" ? "starred" : "important";
          return (
            message[flag] && !["trash", "spam"].includes(message.folder)
          );
        }
        return message.folder === activeFolder;
      }),
    [messages, activeFolder]
  );

  const visibleMessages = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();
    return folderMessages
      .filter((message) => !categoryFilter || message.category === categoryFilter)
      .filter((message) => {
        if (!cleanSearch) return true;
        return [
          message.sender,
          message.address,
          message.to,
          message.subject,
          message.cc,
          message.preview,
          htmlToText(message.body),
          ...(message.attachments || []).map((file) => file.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(cleanSearch);
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt || 0).getTime() -
          new Date(first.createdAt || 0).getTime()
      );
  }, [folderMessages, categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(visibleMessages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageMessages = visibleMessages.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const selectedMessage = messages.find(
    (message) => message.id === selectedMessageId
  );
  const visibleIds = pageMessages.map((message) => message.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const selectedCategory = categories.find(
    (option) => option.id === categoryFilter
  );

  const selectFolder = (folder) => {
    setActiveFolder(folder);
    setCategoryFilter(null);
    setSelectedIds([]);
    setSelectedMessageId(null);
    setPage(1);
  };

  const selectFolderAndCloseMobile = (folder) => {
    selectFolder(folder);
    setMobileFoldersOpen(false);
  };

  const updateMailboxMessages = async (ids, changes, successMessage) => {
    if (!userId || !ids.length || pendingMutation) return false;
    setPendingMutation("update");
    try {
      await mailboxApi.patch("/messages/bulk", { userId, ids, changes });
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          ids.includes(message.id) ? { ...message, ...changes } : message
        )
      );
      setStorageError("");
      setSelectedIds((currentIds) =>
        currentIds.filter((id) => !ids.includes(id))
      );
      if (successMessage) {
        addNotification({
          title: "Mailbox updated",
          message: successMessage,
          type: "mailbox",
        });
      }
      return true;
    } catch (error) {
      const message = mailboxError(error, "Unable to update mailbox messages.");
      setStorageError(message);
      addNotification({
        title: "Unable to update mailbox",
        message,
        type: "mailbox",
        variant: "error",
      });
      return false;
    } finally {
      setPendingMutation("");
    }
  };

  const changeFolderForSelected = async (folder) => {
    if (!selectedIds.length) return;
    if (
      await updateMailboxMessages(
        selectedIds,
        { folder },
        `Selected messages moved to ${folder}.`
      )
    ) {
      setSelectedMessageId(null);
      setStatusMessage(`Selected messages moved to ${folder}.`);
    }
  };

  const changeMessageFolder = async (messageId, folder) => {
    if (
      await updateMailboxMessages(
        [messageId],
        { folder },
        `Message moved to ${folder}.`
      )
    ) {
      setSelectedMessageId(null);
      setStatusMessage(`Message moved to ${folder}.`);
    }
  };

  const permanentlyDeleteSelected = async () => {
    if (!userId || !selectedIds.length || pendingMutation) return;
    setPendingMutation("delete");
    try {
      await mailboxApi.delete("/messages/bulk", {
        data: { userId, ids: selectedIds },
      });
      const deletedIds = new Set(selectedIds);
      setMessages((currentMessages) =>
        currentMessages.filter((message) => !deletedIds.has(message.id))
      );
      setSelectedIds([]);
      setStorageError("");
      setStatusMessage("Selected messages were permanently deleted.");
      addNotification({
        title: "Messages deleted",
        message: "Selected messages were permanently deleted.",
        type: "mailbox",
      });
    } catch (error) {
      const message = mailboxError(error, "Unable to delete mailbox messages.");
      setStorageError(message);
      addNotification({
        title: "Unable to delete messages",
        message,
        type: "mailbox",
        variant: "error",
      });
    } finally {
      setPendingMutation("");
    }
    setToolbarMenuOpen(false);
  };

  const updateSelected = async (changes) => {
    if (!selectedIds.length) return;
    await updateMailboxMessages(selectedIds, changes, "Selected messages updated.");
    setToolbarMenuOpen(false);
  };

  const toggleFlag = async (messageId, flag) => {
    const message = messages.find((item) => item.id === messageId);
    if (message) {
      await updateMailboxMessages(
        [messageId],
        { [flag]: !message[flag] },
        flag === "starred"
          ? message.starred
            ? "Message unstarred."
            : "Message starred."
          : message.important
            ? "Message unmarked important."
            : "Message marked important."
      );
    }
  };

  const toggleStar = (messageId) => toggleFlag(messageId, "starred");
  const toggleImportant = (messageId) => toggleFlag(messageId, "important");

  const markOpenMessageUnread = async (messageId) => {
    if (
      await updateMailboxMessages(
        [messageId],
        { unread: true },
        "Message marked unread."
      )
    ) {
      setSelectedMessageId(null);
    }
  };

  const fetchAttachment = async (messageId, file) => {
    const response = await mailboxApi.get(
      `/messages/${messageId}/attachments/${file._id}`,
      { params: { userId } }
    );
    return response.data.attachment;
  };

  const downloadAttachment = async (messageId, file) => {
    try {
      const attachment = await fetchAttachment(messageId, file);
      const url = URL.createObjectURL(
        base64ToBlob(attachment.data, attachment.type)
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setStorageError(mailboxError(error, "Unable to download the attachment."));
    }
  };

  const replyTo = (message) =>
    openCompose({
      mode: "reply",
      to: message.sentByMe ? message.to : message.address,
      subject: /^re:/i.test(message.subject)
        ? message.subject
        : `Re: ${message.subject}`,
      body: quotedMessageHtml(
        message,
        `On ${formatDateTime(message.createdAt)}, ${message.sender} wrote:`
      ),
      category: message.category,
    });

  const forwardMessage = async (message) => {
    let attachments = [];
    try {
      // Forwarded files are copied into the new message.
      attachments = await Promise.all(
        (message.attachments || []).map(async (file) => {
          const attachment = await fetchAttachment(message.id, file);
          return {
            key: `${attachment._id}-forward`,
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            data: attachment.data,
          };
        })
      );
    } catch (error) {
      setStorageError(
        mailboxError(error, "Unable to copy the attachments to forward.")
      );
      return;
    }
    openCompose({
      mode: "forward",
      to: "",
      subject: /^fwd?:/i.test(message.subject)
        ? message.subject
        : `Fwd: ${message.subject}`,
      body: quotedMessageHtml(message, [
        "---------- Forwarded message ----------",
        `From: ${message.sender} <${message.address}>`,
        `Date: ${formatDateTime(message.createdAt)}`,
        `Subject: ${message.subject}`,
      ]),
      category: message.category,
      attachments,
    });
  };

  const openMessage = async (message) => {
    if (message.folder === "drafts") {
      setComposeMessage({
        ...message,
        to: message.to || "",
      });
      setComposeOpen(true);
      return;
    }

    if (message.unread) {
      await updateMailboxMessages([message.id], { unread: false });
    }
    setSelectedMessageId(message.id);
  };

  const saveComposedMessage = async (content, destination) => {
    if (!userId) {
      setStorageError("Sign in to save messages to your account mailbox.");
      return false;
    }
    const now = new Date().toISOString();
    const existingMessage = content.id
      ? messages.find((message) => message.id === content.id)
      : null;
    const attachments = content.attachments || [];
    const messageData = {
      sender: user?.username || user?.name || user?.email || "You",
      address: user?.email || "you@local.demo",
      to: content.to,
      cc: content.cc,
      bcc: content.bcc,
      subject: content.subject,
      preview: htmlToText(content.body).slice(0, 120),
      body: content.body,
      category: content.category,
      folder: destination,
      sentByMe: true,
      starred: existingMessage?.starred || false,
      important: existingMessage?.important || false,
      unread: false,
      // Saved files are referenced by id; new ones carry their contents.
      attachments: attachments.map((file) =>
        file._id && !file.data
          ? { _id: file._id }
          : { name: file.name, type: file.type, data: file.data }
      ),
      createdAt:
        destination === "drafts" && existingMessage
          ? existingMessage.createdAt
          : now,
    };
    try {
      const response = existingMessage
        ? await mailboxApi.put(`/messages/${existingMessage.id}`, {
            ...messageData,
            userId,
          })
        : await mailboxApi.post("/messages", { ...messageData, userId });
      const savedMessage = normalizeMailboxMessage(response.data.message);
      setMessages((currentMessages) =>
        existingMessage
          ? currentMessages.map((message) =>
              message.id === existingMessage.id ? savedMessage : message
            )
          : [savedMessage, ...currentMessages]
      );
      setStorageError("");
      setComposeOpen(false);
      setComposeMessage(null);
      setActiveFolder(destination);
      setCategoryFilter(null);
      setPage(1);
      setStatusMessage(
        destination === "sent"
          ? "Saved to Sent. This demo mailbox does not deliver messages."
          : "Draft saved to your account mailbox."
      );
      addNotification({
        title: destination === "sent" ? "Message saved" : "Draft saved",
        message:
          destination === "sent"
            ? "Message saved to Sent."
            : "Draft saved to your account mailbox.",
        type: "mailbox",
      });
      setSelectedMessageId(null);
      return true;
    } catch (error) {
      const message = mailboxError(error, "Unable to save mailbox message.");
      setStorageError(message);
      addNotification({
        title: "Unable to save message",
        message,
        type: "mailbox",
        variant: "error",
      });
      return false;
    }
  };

  const toggleSelection = (messageId) => {
    setSelectedIds((current) =>
      current.includes(messageId)
        ? current.filter((id) => id !== messageId)
        : [...current, messageId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    );
  };

  const handleRefresh = () => {
    setReloadKey((current) => current + 1);
    setStatusMessage("Refreshing mailbox...");
  };

  const openCompose = (message = null) => {
    setComposeMessage(message);
    setComposeOpen(true);
    setStatusMessage("");
  };

  return (
    <div className="mailbox-view flex min-h-0 flex-1 flex-col gap-2 overflow-hidden bg-[#f7f8fc] p-2 sm:gap-4 sm:p-4 md:flex-row">
      <aside className={`${mobileFoldersOpen ? "flex" : "hidden"} max-h-[42vh] w-full shrink-0 flex-col overflow-hidden rounded-xl border border-[#e8ebf2] bg-white p-3 shadow-[0_2px_8px_rgba(20,35,70,0.03)] md:flex md:h-full md:max-h-none md:w-[280px] md:p-4 xl:w-[300px]`}>
        <button
          type="button"
          onClick={() => openCompose()}
          className="mb-4 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#4361ee] px-4 text-sm font-medium text-white shadow-[0_8px_18px_-8px_#4361ee] transition hover:bg-[#3451d1]"
        >
          <FiPlusIcon />
          New Message
        </button>

        <nav
          aria-label="Mailbox folders"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto"
        >
          {folderOptions.map((folder) => {
            const Icon = folder.icon;
            const active = activeFolder === folder.id;
            const count = folderCounts[folder.id] || 0;
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => selectFolderAndCloseMobile(folder.id)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-[#f0f1f3] font-medium text-[#4361ee]"
                    : "text-[#172033] hover:bg-[#f7f8fc]"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span>{folder.label}</span>
                {count > 0 && (
                  <span className="ml-auto rounded-lg bg-[#e9efff] px-2.5 py-1 text-xs font-medium text-[#4361ee]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {showMoreFolders && (
            <button
              type="button"
              onClick={() => selectFolderAndCloseMobile("archive")}
              aria-current={activeFolder === "archive" ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                activeFolder === "archive"
                  ? "bg-[#f0f1f3] font-medium text-[#4361ee]"
                  : "text-[#172033] hover:bg-[#f7f8fc]"
              }`}
            >
              <FiArchive size={20} />
              Archive
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowMoreFolders((current) => !current)}
            aria-expanded={showMoreFolders}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#64748b] hover:bg-[#f7f8fc]"
          >
            <FiChevronDown
              size={20}
              className={`transition-transform ${showMoreFolders ? "rotate-180" : ""}`}
            />
            {showMoreFolders ? "Less" : "More"}
          </button>
        </nav>

        <button
          type="button"
          onClick={() =>
            setStatusMessage(
              "This mailbox stores app messages only; it is not connected to an external email provider."
            )
          }
          className="mt-3 flex shrink-0 items-center gap-3 border-t border-[#e8ebf2] px-2 pt-4 text-left text-sm text-[#3b4563] hover:text-[#4361ee]"
        >
          <FiUserPlusIcon />
          <span>Add Account</span>
          <span className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4361ee]">
            <FiPlusIcon />
          </span>
        </button>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e8ebf2] bg-white shadow-[0_2px_8px_rgba(20,35,70,0.03)]">
        <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-[#e8ebf2] px-2 py-2 sm:gap-3 sm:px-5 sm:py-3">
          <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-[#64748b] hover:bg-[#f4f6f8]">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              aria-label="Select all messages on this page"
              className="h-4 w-4 rounded border-[#cbd5e1] accent-[#4361ee]"
            />
          </label>
          <ToolbarButton label="Refresh mailbox" onClick={handleRefresh}>
            <FiRefreshCw size={20} />
          </ToolbarButton>
          <ToolbarButton
            label="Archive selected"
            onClick={() => changeFolderForSelected("archive")}
            disabled={!selectedIds.length || Boolean(pendingMutation)}
            loading={pendingMutation === "update"}
          >
            <FiArchive size={20} />
          </ToolbarButton>
          <ToolbarButton
            label="Move selected to spam"
            onClick={() => changeFolderForSelected("spam")}
            disabled={!selectedIds.length || Boolean(pendingMutation)}
            loading={pendingMutation === "update"}
          >
            <FiAlertCircle size={20} />
          </ToolbarButton>
          <ToolbarButton
            label="Move selected to trash"
            onClick={() => changeFolderForSelected("trash")}
            disabled={!selectedIds.length || Boolean(pendingMutation)}
            loading={pendingMutation === "update"}
          >
            <FiTrash2 size={20} />
          </ToolbarButton>
          <div className="relative">
            <ToolbarButton
              label="More message actions"
              active={toolbarMenuOpen}
              disabled={Boolean(pendingMutation)}
              loading={pendingMutation === "delete"}
              onClick={() => setToolbarMenuOpen((current) => !current)}
            >
              <FiMoreVertical size={20} />
            </ToolbarButton>
            {toolbarMenuOpen && (
              <div className="absolute left-0 top-11 z-20 w-44 rounded-lg border border-[#e5e7eb] bg-white p-1 shadow-lg">
                <button
                  type="button"
                  disabled={!selectedIds.length}
                  onClick={() => updateSelected({ unread: false })}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-[#3b4563] hover:bg-[#f4f6f8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mark as read
                </button>
                <button
                  type="button"
                  disabled={!selectedIds.length}
                  onClick={() => updateSelected({ unread: true })}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-[#3b4563] hover:bg-[#f4f6f8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mark as unread
                </button>
                {[
                  ["Add star", { starred: true }],
                  ["Remove star", { starred: false }],
                  ["Mark as important", { important: true }],
                  ["Mark as not important", { important: false }],
                ].map(([label, changes]) => (
                  <button
                    key={label}
                    type="button"
                    disabled={!selectedIds.length}
                    onClick={() => updateSelected(changes)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-[#3b4563] hover:bg-[#f4f6f8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {label}
                  </button>
                ))}
                {["archive", "spam"].includes(activeFolder) && (
                  <button
                    type="button"
                    disabled={!selectedIds.length}
                    onClick={() => changeFolderForSelected("inbox")}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-[#3b4563] hover:bg-[#f4f6f8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Move to inbox
                  </button>
                )}
                {activeFolder === "trash" && (
                  <button
                    type="button"
                    disabled={!selectedIds.length}
                    onClick={() => changeFolderForSelected("inbox")}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-[#3b4563] hover:bg-[#f4f6f8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Restore to inbox
                  </button>
                )}
                {activeFolder === "trash" && (
                  <button
                    type="button"
                    disabled={!selectedIds.length || Boolean(pendingMutation)}
                    onClick={permanentlyDeleteSelected}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {pendingMutation === "delete" ? (
                      <span className="inline-flex items-center gap-2">
                        <LoadingSpinner />
                        Deleting...
                      </span>
                    ) : (
                      "Delete permanently"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="relative ml-auto flex min-w-[180px] flex-1 basis-full items-center sm:basis-auto sm:max-w-[300px]">
            <FiSearch
              size={18}
              className="pointer-events-none absolute right-3 text-[#8490a5]"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search Mail"
              aria-label="Search Mail"
              className="workspace-input h-10 w-full rounded-lg px-3 pr-10 text-sm"
            />
          </div>
          <ToolbarButton
            label="Mailbox settings"
            className="hidden sm:flex"
            onClick={() =>
              setStatusMessage(
                "External mailbox settings are not available because this demo does not connect to an email provider."
              )
            }
          >
            <FiSettings size={20} />
          </ToolbarButton>
          <ToolbarButton
            label="Mailbox help"
            className="hidden sm:flex"
            onClick={() =>
              setStatusMessage(
                "Use folders, category filters, and search to organize messages saved to your account."
              )
            }
          >
            <FiHelpCircle size={20} />
          </ToolbarButton>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-b border-[#e8ebf2] px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
          <button
            type="button"
            onClick={() => setMobileFoldersOpen((open) => !open)}
            aria-label={mobileFoldersOpen ? "Hide mailbox folders" : "Show mailbox folders"}
            aria-expanded={mobileFoldersOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#64748b] transition hover:bg-[#f4f6f8] md:hidden"
          >
            <FiMenu size={20} />
          </button>
          <div className="mailbox-label-strip flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = categoryFilter === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter((current) =>
                      current === category.id ? null : category.id
                    );
                    setPage(1);
                  }}
                  aria-pressed={active}
                  className="mailbox-category-button flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
                  style={{
                    "--mailbox-category-color": category.color,
                  }}
                >
                  <Icon size={16} className="shrink-0" />
                  {category.label}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="mr-1 hidden whitespace-nowrap text-xs text-[#172033] sm:mr-2 sm:inline sm:text-sm">
              {visibleMessages.length === 0
                ? "0"
                : `${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                    currentPage * PAGE_SIZE,
                    visibleMessages.length
                  )} of ${visibleMessages.length}`}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="rounded-lg bg-[#f4f6f8] p-1.5 text-[#64748b] hover:bg-[#e9edf2] disabled:opacity-40 sm:p-2"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="rounded-lg bg-[#f4f6f8] p-1.5 text-[#64748b] hover:bg-[#e9edf2] disabled:opacity-40 sm:p-2"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {pendingMutation && (
            <div
              role="status"
              className="flex shrink-0 items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-800 sm:px-5"
            >
              <LoadingSpinner />
              {pendingMutation === "delete"
                ? "Deleting selected messages..."
                : "Updating messages..."}
            </div>
          )}
          {statusMessage && (
            <div
              role="status"
              className="flex shrink-0 items-center justify-between gap-3 border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-800 sm:px-5"
            >
              <span>{statusMessage}</span>
              <button
                type="button"
                onClick={() => setStatusMessage("")}
                aria-label="Dismiss mailbox message"
                className="rounded p-1 hover:bg-blue-100"
              >
                <FiX size={15} />
              </button>
            </div>
          )}

          {storageError && (
            <div
              role="alert"
              className="m-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {storageError}
              {userId && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="font-medium underline underline-offset-2"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-14 text-sm text-[#8490a5]">
              Loading your mailbox...
            </div>
          ) : selectedMessage ? (
            <MessageDetail
              message={selectedMessage}
              onBack={() => setSelectedMessageId(null)}
              onReply={() => replyTo(selectedMessage)}
              onForward={() => forwardMessage(selectedMessage)}
              onPrint={() => {
                if (!printMessage(selectedMessage)) {
                  setStatusMessage("Allow pop-ups for this site to print messages.");
                }
              }}
              onStar={() => toggleStar(selectedMessage.id)}
              onImportant={() => toggleImportant(selectedMessage.id)}
              onMarkUnread={() => markOpenMessageUnread(selectedMessage.id)}
              onDownload={(file) => downloadAttachment(selectedMessage.id, file)}
              onMove={(folder) =>
                changeMessageFolder(selectedMessage.id, folder)
              }
            />
          ) : pageMessages.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-14 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4361ee]">
                {selectedCategory ? (
                  <selectedCategory.icon size={22} />
                ) : (
                  <FiInbox size={22} />
                )}
              </span>
              <h2 className="text-base font-semibold text-[#172033]">
                {search
                  ? "No matching messages"
                  : selectedCategory
                  ? `No ${selectedCategory.label} messages`
                  : `No messages in ${activeFolder}`}
              </h2>
              <p className="mt-1 text-sm text-[#8490a5]">
                Try another folder or search term, or compose a new message.
              </p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {pageMessages.map((message) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  selected={selectedIds.includes(message.id)}
                  onSelect={() => toggleSelection(message.id)}
                  onOpen={() => openMessage(message)}
                  onStar={() => toggleStar(message.id)}
                  onImportant={() => toggleImportant(message.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {composeOpen && (
        <ComposeMessage
          initialMessage={composeMessage}
          onClose={() => {
            setComposeOpen(false);
            setComposeMessage(null);
          }}
          onSave={saveComposedMessage}
        />
      )}
    </div>
  );
}

function FiPlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function FiUserPlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.2 2.7-5.5 6.5-5.5 1.4 0 2.6.3 3.6.9M19 8v7M15.5 11.5h7" strokeLinecap="round" />
    </svg>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
  disabled = false,
  loading = false,
  active = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition ${
        active
          ? "bg-[#eef2ff] text-[#4361ee]"
          : "text-[#64748b] hover:bg-[#f4f6f8] hover:text-[#172033]"
      } disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}

function MessageRow({ message, selected, onSelect, onOpen, onStar, onImportant }) {
  const category = categories.find((option) => option.id === message.category);
  const sender = message.sentByMe
    ? `To: ${message.to || "Unknown recipient"}`
    : message.sender;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={`group grid min-h-[58px] cursor-pointer grid-cols-[24px_24px_24px_minmax(0,1fr)_56px] items-center gap-1.5 border-b border-[#edf0f5] px-2 text-sm transition hover:bg-[#f5f7fa] xl:grid-cols-[28px_30px_30px_28px_minmax(90px,150px)_minmax(120px,1fr)_18px_24px_64px] xl:gap-3 xl:px-5 ${
        message.unread ? "bg-[#f8fafc]" : "bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onClick={(event) => event.stopPropagation()}
        onChange={onSelect}
        aria-label={`Select message ${message.subject}`}
        className="h-4 w-4 cursor-pointer rounded border-[#cbd5e1] accent-[#4361ee]"
      />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onStar();
        }}
        aria-label={
          message.starred
            ? `Remove star from ${message.subject}`
            : `Star ${message.subject}`
        }
        aria-pressed={Boolean(message.starred)}
        className={`flex h-8 w-8 items-center justify-center rounded-full hover:bg-amber-50 ${
          message.starred ? "text-amber-500" : "text-[#172033]"
        }`}
      >
        <FiStar size={20} fill={message.starred ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onImportant();
        }}
        aria-label={
          message.important
            ? `Mark ${message.subject} as not important`
            : `Mark ${message.subject} as important`
        }
        aria-pressed={Boolean(message.important)}
        className={`flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#eef2ff] ${
          message.important ? "text-[#4361ee]" : "text-[#172033]"
        }`}
      >
        <TbBookmark
          size={20}
          fill={message.important ? "currentColor" : "none"}
        />
      </button>
      <span
        className={`hidden h-7 w-7 items-center justify-center rounded-md xl:flex ${
          message.unread ? "text-[#4361ee]" : "text-[#64748b]"
        }`}
        title={message.unread ? "Unread" : "Read"}
      >
        {message.unread ? <FiMail size={20} /> : <FiCheck size={20} />}
      </span>
      <span
        className={`hidden truncate xl:block ${
          message.unread
            ? "font-semibold text-[#172033]"
            : "font-normal text-[#64748b]"
        }`}
      >
        {sender}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[10px] text-[#8490a5] xl:hidden">
          {sender}
        </span>
        <span
          className={`block truncate transition-colors duration-150 group-hover:text-[#4361ee] group-focus-visible:text-[#4361ee] ${
            message.unread
              ? "font-medium text-[#172033]"
              : "text-[#8490a5]"
          }`}
        >
          {message.subject}
          {message.preview && (
            <span className="font-normal text-[#9aa5b6]">
              {" "}
              – {message.preview}
            </span>
          )}
        </span>
      </span>
      <span
        className="hidden h-2.5 w-2.5 rounded-full xl:block"
        style={{ backgroundColor: category?.color || "transparent" }}
        title={category?.label || "No label"}
      />
      <span className="hidden justify-center text-[#172033] xl:flex">
        {message.attachment && <FiPaperclip size={19} />}
      </span>
      <span
        className="text-right text-xs text-[#64748b]"
        title={formatDateTime(message.createdAt)}
      >
        {formatListDate(message.createdAt)}
      </span>
    </div>
  );
}

function MessageDetail({
  message,
  onBack,
  onReply,
  onForward,
  onPrint,
  onStar,
  onImportant,
  onMarkUnread,
  onMove,
  onDownload,
}) {
  const category = categories.find((option) => option.id === message.category);
  const attachments = message.attachments || [];
  const inFolder = (folder) => message.folder === folder;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[#e8ebf2] pb-3 sm:mb-5 sm:pb-4">
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
          <ToolbarButton label="Back to messages" onClick={onBack}>
            <FiChevronLeft size={20} />
          </ToolbarButton>
          <ToolbarButton
            label={message.starred ? "Remove star" : "Star message"}
            active={Boolean(message.starred)}
            onClick={onStar}
          >
            <FiStar size={19} fill={message.starred ? "currentColor" : "none"} />
          </ToolbarButton>
          <ToolbarButton
            label={message.important ? "Mark as not important" : "Mark as important"}
            active={Boolean(message.important)}
            onClick={onImportant}
          >
            <TbBookmark
              size={19}
              fill={message.important ? "currentColor" : "none"}
            />
          </ToolbarButton>
          <ToolbarButton label="Mark as unread" onClick={onMarkUnread}>
            <FiMail size={19} />
          </ToolbarButton>
          {inFolder("archive") || inFolder("spam") || inFolder("trash") ? (
            <ToolbarButton label="Move to inbox" onClick={() => onMove("inbox")}>
              <FiInbox size={19} />
            </ToolbarButton>
          ) : (
            <ToolbarButton label="Archive message" onClick={() => onMove("archive")}>
              <FiArchive size={19} />
            </ToolbarButton>
          )}
          {!inFolder("spam") && (
            <ToolbarButton label="Report spam" onClick={() => onMove("spam")}>
              <FiAlertCircle size={19} />
            </ToolbarButton>
          )}
          {!inFolder("trash") && (
            <ToolbarButton label="Move message to trash" onClick={() => onMove("trash")}>
              <FiTrash2 size={19} />
            </ToolbarButton>
          )}
          <ToolbarButton label="Print message" onClick={onPrint}>
            <TbPrinter size={19} />
          </ToolbarButton>
        </div>
        <span className="text-xs text-[#8490a5]">
          {formatDateTime(message.createdAt)}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
        <h2 className="text-lg font-semibold text-[#172033] sm:text-xl">
          {message.subject}
        </h2>
        {category && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.label}
          </span>
        )}
      </div>
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8edff] text-sm font-semibold text-[#4361ee]">
          {initialsFor(message.sender)}
        </span>
        <div className="min-w-0 text-xs text-[#8490a5]">
          <p className="truncate text-sm font-medium text-[#172033]">
            {message.sender}{" "}
            <span className="font-normal text-[#8490a5]">
              &lt;{message.address}&gt;
            </span>
          </p>
          <p className="break-words">to {message.sentByMe ? message.to : "you"}</p>
          {message.cc && <p className="break-words">cc {message.cc}</p>}
          {message.sentByMe && message.bcc && (
            <p className="break-words">bcc {message.bcc}</p>
          )}
        </div>
      </div>
      <div
        className="mailbox-message-body max-w-4xl text-sm leading-7 text-[#3b4563]"
        dangerouslySetInnerHTML={{ __html: messageBodyHtml(message) }}
      />

      {attachments.length > 0 ? (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8490a5]">
            {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
          </p>
          <ul className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <li key={file._id}>
                <button
                  type="button"
                  onClick={() => onDownload(file)}
                  className="flex max-w-[280px] items-center gap-2 rounded-lg border border-[#e8ebf2] bg-[#f8fafc] px-3 py-2 text-left text-sm text-[#3b4563] hover:border-[#4361ee] hover:text-[#4361ee]"
                >
                  <FiPaperclip size={16} className="shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-[#8490a5]">
                    {formatFileSize(file.size)}
                  </span>
                  <FiDownload size={15} className="shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        message.attachment && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#e8ebf2] bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b]">
            <FiPaperclip size={16} />
            Demo attachment
          </div>
        )
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReply}
          className="inline-flex items-center gap-2 rounded-lg border border-[#dfe4ea] px-4 py-2.5 text-sm font-medium text-[#3b4563] hover:bg-[#f7f8fc]"
        >
          <TbArrowBackUp size={17} />
          Reply
        </button>
        <button
          type="button"
          onClick={onForward}
          className="inline-flex items-center gap-2 rounded-lg border border-[#dfe4ea] px-4 py-2.5 text-sm font-medium text-[#3b4563] hover:bg-[#f7f8fc]"
        >
          <TbArrowForwardUp size={17} />
          Forward
        </button>
      </div>
    </div>
  );
}

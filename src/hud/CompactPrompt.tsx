import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { NavToggle } from "./NavToggle";
import type { ChatAttachment } from "../chat/attachments";
import { AttachmentChips } from "../chat/AttachmentChips";

export type CompactPromptProps = {
  connectionLabel: string;
  connectionOk: boolean;
  navExpanded: boolean;
  onToggleNav: () => void;
  onSubmit: (text: string, attachments: ChatAttachment[]) => void;
  onDismiss: () => void;
  onFilesSelected?: (files: FileList | File[]) => void;
  pendingAttachments?: ChatAttachment[];
  onRemoveAttachment?: (id: string) => void;
  onVoiceClick?: () => void;
};

export function CompactPrompt({
  connectionLabel,
  connectionOk,
  navExpanded,
  onToggleNav,
  onSubmit,
  onDismiss,
  onFilesSelected,
  pendingAttachments = [],
  onRemoveAttachment,
  onVoiceClick,
}: CompactPromptProps) {
  const [value, setValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!navExpanded) {
      inputRef.current?.focus();
    }
  }, [navExpanded]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text && pendingAttachments.length === 0) return;
    onSubmit(text || "(attachment)", pendingAttachments);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onDismiss();
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      onFilesSelected?.(e.dataTransfer.files);
    }
  }

  const canSend = Boolean(value.trim() || pendingAttachments.length);

  return (
    <div
      className={`hud-compact${dragOver ? " is-dragover" : ""}${connectionOk ? " is-ready" : " is-offline"}`}
      role="dialog"
      aria-label="Taby prompt"
      onKeyDown={handleKeyDown}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      {pendingAttachments.length > 0 && (
        <AttachmentChips
          items={pendingAttachments}
          onRemove={onRemoveAttachment}
        />
      )}
      <form className="hud-compact-form" onSubmit={handleSubmit}>
        <NavToggle expanded={navExpanded} onToggle={onToggleNav} />
        <span
          className={`hud-connection-pill ${connectionOk ? "ok" : "off"}`}
          title={connectionLabel}
          aria-label={connectionLabel}
        />
        <input
          ref={inputRef}
          className="hud-prompt-input"
          type="text"
          placeholder="Ask me anything or /"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Prompt"
        />
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onFilesSelected?.(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="hud-icon-btn"
          title="Attach file"
          aria-label="Attach file"
          onClick={() => fileRef.current?.click()}
        >
          <PaperclipIcon />
        </button>
        <button
          type="button"
          className="hud-icon-btn"
          title="Voice"
          aria-label="Voice input"
          onClick={onVoiceClick}
        >
          <MicIcon />
        </button>
        {canSend && (
          <button
            type="submit"
            className="hud-send-btn is-active"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M12 19V5M12 5l-5 5M12 5l5 5"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 12.5l6.2-6.2a3 3 0 114.2 4.2L9.5 20a4.5 4.5 0 11-6.4-6.4l9.2-9.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M5 11a7 7 0 0014 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

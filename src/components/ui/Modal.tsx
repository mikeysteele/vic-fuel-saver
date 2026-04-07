import { type JSX, createEffect, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { withDocument } from "../../lib/safe-dom.ts";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
  title?: string;
}

function Modal(props: ModalProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && props.isOpen) {
      props.onClose();
    }
  };
  const handleOpen = () => {
    withDocument((document) => {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    })
  }
  const handleClose = () => {
    withDocument((document) => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    })
  }

  createEffect(() => {
    if (props.isOpen) {
      handleOpen();
    } else {
      handleClose();
    }
  });

  onCleanup(() => {
    handleClose();
  });

  return (
    <Show when={props.isOpen}>
      <Portal>
      <div
        class="fixed inset-0 z-[100] flex sm:items-center sm:justify-center"
        style={{ "z-index": 9999 }}
      >
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={props.onClose}
          aria-hidden="true"
        />
        <div
          class="relative bg-white dark:bg-slate-900 w-full h-[100dvh] sm:h-auto sm:max-w-lg sm:max-h-[85vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {props.title && (
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 shrink-0">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white">{props.title}</h2>
              <button
                type="button"
                onClick={props.onClose}
                class="p-2 -mr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          )}
          {!props.title && (
            <button
              type="button"
              onClick={props.onClose}
              class="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/50 backdrop-blur hover:bg-slate-100 dark:bg-black/50 dark:hover:bg-white/20 transition-colors text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          )}
          <div class="flex-1 overflow-y-auto p-6 relative">
            {props.children}
          </div>
        </div>
      </div>
      </Portal>
    </Show>
  );
}

export default Modal;

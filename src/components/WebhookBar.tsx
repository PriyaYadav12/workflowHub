"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
type Props = {
  title: string;
  subtitle?: string;
  storageKey: string; // where to persist the webhook URL in localStorage
  defaultUrl?: string;
};

export default function WebhookBar({ title, subtitle, storageKey, defaultUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(defaultUrl || "");
  const [message, setMessage] = useState<string | null>(null);

  // load persisted value once on mount
  useEffect(() => {
    try {
      const val = localStorage.getItem(storageKey) || defaultUrl || "";
      setUrl(val);
    } catch {}
  }, [storageKey, defaultUrl]);

  const hasUrl = useMemo(() => !!url, [url]);

  const save = () => {
    try {
      localStorage.setItem(storageKey, url.trim());
      setMessage("Saved");
      setTimeout(() => setMessage(null), 1500);
    } catch {}
  };


  return (
    <Fragment>
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-lg bg-white ring-1 ring-inset ring-white/15 flex items-center justify-center">
            <Image
              src="/strategy-svgrepo-com.svg"
              alt="Strategy"
              width={24}
              height={24}
              className="w-4 h-4"
            />
          </div>
          <div>
            <div className="text-lg font-semibold text-white/90">{title}</div>
            {subtitle ? (
              <div className="text-sm text-white/60">{subtitle}</div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasUrl ? (
            <span className="hidden sm:inline text-xs text-emerald-300/90 bg-emerald-400/10 border border-emerald-300/20 px-2 py-1 rounded-lg">
              Test URL set
            </span>
          ) : (
            <span className="hidden sm:inline text-xs text-white/70 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
              No URL
            </span>
          )}
          <button
            onClick={() => setOpen(true)}
            className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
            aria-label="Open settings"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings w-4 h-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>

          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#11121b] p-5 sm:p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-[-0.01em]">Settings</h2>
                  <p className="mt-1 text-xs text-white/70 max-w-prose">
                    Configure the webhook URL and test connectivity. If your server blocks CORS, we will still send a no-cors test.
                  </p>
                </div>
                <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center" onClick={() => setOpen(false)} aria-label="Close">
                  <span className="text-xl leading-none">&times;</span>
                </button>
              </div>

              <label className="mt-5 block text-sm font-medium text-white/80">Webhook URL</label>
              <div className="mt-2 rounded-xl border border-indigo-400/40 bg-indigo-500/5 px-3 py-2 focus-within:ring-2 ring-indigo-400/40">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-white placeholder-white/40"
                />
              </div>
              <p className="mt-2 text-xs text-white/60">
                We will POST test data to this URL.
              </p>

              {message ? (
                <div className="mt-3 text-xs text-white/80">{message}</div>
              ) : null}

              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={() => setOpen(false)} className="px-4 h-9 rounded-xl border border-white/15 bg-white/5 text-sm hover:bg-white/10">Close</button>
                <button onClick={save} className="px-4 h-9 rounded-xl border border-indigo-400/30 bg-indigo-500/40 text-white text-sm hover:bg-indigo-500/50">Save</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
}

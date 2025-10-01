"use client";

import Link from "next/link";
import WebhookBar from "@/components/WebhookBar";
import { StrategyGeneratorUrl } from "@/data/webhookUrl";
import { useEffect, useState } from "react";
import StrategyForm, { StrategyFormValues } from "@/components/StrategyForm";
import StrategyResultPanel from "@/components/StrategyResultPanel";

export default function StrategyGeneratorPage() {
  // Form values handled inside StrategyForm
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [submitTime, setSubmitTime] = useState<number | null>(null);

  // load webhook URL persisted by WebhookBar
  useEffect(() => {
    try {
      const val = localStorage.getItem("strategy-generator:webhook");
      setWebhookUrl(val || "");
    } catch {}
  }, []);

  const timestamped = (form: StrategyFormValues) => ({ ...form, timestamp: new Date().toISOString() });

  async function onSubmit(formValues: StrategyFormValues) {
    setSubmitting(true);
    setMessage(null);
    setSubmitTime(Date.now());
    const payload = timestamped(formValues);
    setResult(null);
    try {
      if (webhookUrl) {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "strategy-generator:submit", data: payload }),
          // If server blocks CORS, the request may still be received
          mode: ("cors" as RequestMode),
        }).catch(() => null);

        if (res && res.ok) {
          try {
            const data = await res.json();
            console.log("data", data);
            setResult(data);
          } catch {
            // response might be empty or not JSON
          }
          setMessage("Submitted to webhook");
        } else {
          setMessage("Submitted locally. Configure webhook for remote processing.");
        }
      } else {
        setMessage("No webhook URL set. Saved data locally.");
      }
    } catch (err) {
      setMessage("Submit failed. Check console or webhook.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-white/60 hover:text-white/80">← Back</Link>

      <div className="mt-8">
        <WebhookBar
          title="Strategy Generator"
          subtitle="Webhook configuration"
          storageKey="strategy-generator:webhook"
          defaultUrl={StrategyGeneratorUrl}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StrategyForm
          submitting={submitting}
          webhookConfigured={!!webhookUrl}
          onSubmit={onSubmit}
        />
        <StrategyResultPanel result={result} submitTime={submitTime} onResultUpdate={setResult} />
      </div>

      {message ? (
        <div className="mt-4 text-xs text-white/80">{message}</div>
      ) : null}
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { StrategyGeneratorUrl } from "@/data/webhookUrl";
import DownloadPdfButton from "@/components/DownloadPdfButton";

type TaskBreakdown = {
  task: number;
  details: string;
};

type WebhookResult = {
  output: {
    deliverableType: string;
    clientName: string;
    deliverablesRequested: string;
    finalOutput: unknown[];
    reasoning?: string[];
    task_breakdown?: TaskBreakdown[];
  };
};
type Props = {
  result: unknown;
  submitTime: number | null;
  onResultUpdate?: (newResult: unknown) => void;
};
function RenderDeliverable({ item }: { item: unknown }) {
  let parsed = item;
  if (typeof item === "string") {
    try {
      parsed = JSON.parse(item);
    } catch {
      parsed = item;
    }
  }

  if (typeof parsed === "string") {
    return <p className="text-sm text-white/80">{parsed}</p>;
  }

  if (Array.isArray(parsed)) {
    return (
      <ul className="list-disc list-inside space-y-1 text-sm text-white/80">
        {parsed.map((sub, i) => (
          <li key={i}>
            <RenderDeliverable item={sub} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof parsed === "object" && parsed !== null) {
    return (
      <div className="space-y-3">
        {Object.entries(parsed).map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <h6 className="text-xs uppercase tracking-wide text-white/50 mb-1">
              {key.replace(/_/g, " ")}
            </h6>
            <div className="text-sm text-white/80">
              {typeof value === "object" ? (
                <pre className="whitespace-pre-wrap text-xs text-white/70">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                value?.toString()
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}



export default function StrategyResultPanel({ result, submitTime, onResultUpdate }: Props) {
  const [feedback, setFeedback] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [workflowTime, setWorkflowTime] = useState<string>("--");
  const [timeSaved, setTimeSaved] = useState<string>("--");
  const [isComplete, setIsComplete] = useState(false);

  const webhookResult = result as WebhookResult | null;
  const hasValidResult = webhookResult?.output?.finalOutput;
  const taskBreakdown =
  webhookResult?.output?.task_breakdown ||
  [];
  // Calculate workflow time when result is received
  useEffect(() => {
    if (hasValidResult && submitTime && !isComplete) {
      const elapsedMs = Date.now() - submitTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      
      // Format elapsed time
      let timeStr = "";
      if (elapsedSeconds < 60) {
        timeStr = `${elapsedSeconds}s`;
      } else if (elapsedSeconds < 3600) {
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        timeStr = `${minutes}m ${seconds}s`;
      } else {
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        timeStr = `${hours}h ${minutes}m`;
      }
      
      setWorkflowTime(timeStr);
      
      // Calculate time saved (1 day = 86400 seconds)
      const oldProcessSeconds = 86400; // 1 day
      const savedSeconds = oldProcessSeconds - elapsedSeconds;
      const savedHours = Math.floor(savedSeconds / 3600);
      const savedMinutes = Math.floor((savedSeconds % 3600) / 60);
      
      if (savedHours >= 24) {
        const days = Math.floor(savedHours / 24);
        const remainingHours = savedHours % 24;
        setTimeSaved(`~${days}d ${remainingHours}h`);
      } else {
        setTimeSaved(`~${savedHours}h ${savedMinutes}m`);
      }
      
      setIsComplete(true);
    }
  }, [hasValidResult, submitTime, isComplete]);

  const handleSendFeedback = async () => {
    if (!feedback.trim() || !webhookResult) return;

    setIsSendingFeedback(true);
    try {
      const feedbackPayload = {
        type: "feedback",
        clientName: webhookResult.output.clientName,
        feedback: feedback.trim(),
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(StrategyGeneratorUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "strategy-generator:submit", data: feedbackPayload }),
      });

      if (response.ok) {
        try {
          const data = await response.json();
          if (onResultUpdate) {
            onResultUpdate(data);
          }
        } catch (error) {
          console.error("Failed to parse response:", error);
        }
        setFeedbackSent(true);
        setTimeout(() => {
          setFeedback("");
          setFeedbackSent(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to send feedback:", error);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <aside className="lg:sticky lg:top-8 h-fit rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-white/90">Result</h3>
      <p className="mt-1 text-sm text-white/60">
        {hasValidResult ? "Your generated content is ready!" : "This area will display the generated strategy or the response from your webhook."}
      </p>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {hasValidResult ? (
          <div className="space-y-6">
            {/* Workflow Time Tracker */}
            <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm font-semibold text-white/80">Workflow Time</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-white/50">Current Workflow</div>
                    <div className="text-lg font-bold text-green-300">{workflowTime}</div>
                  </div>
                  <div className="h-8 w-px bg-white/20"></div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">Old Process</div>
                    <div className="text-lg font-bold text-white/40">1 day</div>
                  </div>
                  <div className="h-8 w-px bg-white/20"></div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">Time Saved</div>
                    <div className="text-lg font-bold text-emerald-400">{timeSaved}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Section */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-xs font-medium text-purple-200">
                  {webhookResult.output.deliverableType}
                </span>
                <DownloadPdfButton result={result} disabled={!hasValidResult} />
              </div>
              <h4 className="text-xl font-bold text-white/95">{webhookResult.output.clientName}</h4>
              <p className="text-sm text-white/60 mt-1">{webhookResult.output.deliverablesRequested}</p>
            </div>

            {/* Final Output */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white/80">📦 Final Output</span>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 p-4">
              <div className="grid gap-4">
                  {webhookResult.output.finalOutput.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-4 shadow-sm"
                    >
                      <h5 className="text-sm font-semibold text-white/90 mb-2">
                        Deliverable {index + 1}
                      </h5>
                      <RenderDeliverable item={item} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reasoning Section */}
            {webhookResult.output.reasoning && webhookResult.output.reasoning.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/80">🎯 Strategic Reasoning</span>
                </div>
                <div className="space-y-2">
                  {webhookResult.output.reasoning.map((reason, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-semibold text-emerald-300">
                        {index + 1}
                      </span>
                      <p className="text-sm text-white/80 leading-relaxed flex-1">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task Breakdown Section */}
            {taskBreakdown.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/80">✅ Task Breakdown</span>
                </div>
                <div className="space-y-2">
                  {taskBreakdown.map((task, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/20"
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                        {task.task}
                      </span>
                      <p className="text-sm text-white/80 leading-relaxed flex-1">{task.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Feedback Section */}
            <div className="border-t border-white/10 pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white/80">💬 Feedback</span>
                {feedbackSent && (
                  <span className="text-xs text-green-400 animate-pulse">✓ Sent successfully!</span>
                )}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, request revisions, or provide additional context..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all"
                rows={4}
                disabled={isSendingFeedback || feedbackSent}
              />
              <button
                onClick={handleSendFeedback}
                disabled={!feedback.trim() || isSendingFeedback || feedbackSent}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:shadow-none"
              >
                {isSendingFeedback ? "Sending..." : feedbackSent ? "Sent ✓" : "Send Feedback"}
              </button>
            </div>
          </div>
        ) : result ? (
          <pre className="text-xs text-white/80 whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-sm text-white/60">No result yet. Submit the form to preview the payload or see webhook output.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

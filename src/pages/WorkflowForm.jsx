import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import workflows from '../data/workflows';

export default function WorkflowForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workflow = useMemo(() => workflows.find((w) => w.id === id), [id]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);
  const [showForm, setShowForm] = useState(true);
  // Track original payload to include it again with user feedback
  const [lastPayload, setLastPayload] = useState(null);
  // Feedback UI state
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  // Ref to the result section for auto-scrolling
  const resultRef = useRef(null);

  // When result updates, scroll to the result section
  useEffect(() => {
    if (result && resultRef.current) {
      // Let the DOM paint before scrolling
      requestAnimationFrame(() => {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [result]);

  if (!workflow) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold mb-2">Workflow not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The workflow you are looking for does not exist.</p>
          <Link to="/" className="text-primary-600 hover:underline">Go back home</Link>
        </div>
      </Layout>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLastPayload(payload);

    try {
      const res = await fetch(workflow.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      // Robust parsing: read as text, then try JSON; handle empty bodies
      const text = await res.text();
      let data = null;
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      } else {
        data = null; // No content returned
      }
      console.log("data", data);
      setResult(data);
      setSuccess('Submitted successfully!');
      // Auto-hide the form after result is available
      setShowForm(false);
      // e.currentTarget.reset();
      // Optionally navigate after a short delay
      // setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  // Handles feedback submission: send previous payload merged with user feedback
  async function onSubmitFeedback(e) {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');
    setFeedbackLoading(true);

    try {
      const merged = {
        ...(lastPayload || {}),
        user_feedback: feedback,
        feedback_run: true,
      };

      const res = await fetch(workflow.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      const text = await res.text();
      let data = null;
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      } else {
        data = null; // No content returned
      }
      console.log("data", data);
      setResult(data);
      setFeedbackSuccess('Feedback submitted. Thank you!');
      // Clear the feedback after success
      setFeedback('');
    } catch (err) {
      setFeedbackError(err?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  }

  function renderField(field) {
    const base = 'block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
    const label = (
      <label htmlFor={field.key} className="block text-sm font-medium mb-1">
        {field.label} {field.required && <span className="text-rose-500">*</span>}
      </label>
    );

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-1">
          {label}
          <textarea id={field.key} name={field.key} placeholder={field.placeholder}
            className={`${base} min-h-28`} required={field.required} />
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.key} className="space-y-1">
          {label}
          <select id={field.key} name={field.key} required={field.required} className={base}>
            <option value="choose" selected>Choose...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-1">
        {label}
        <input id={field.key} name={field.key} type={field.type || 'text'} placeholder={field.placeholder}
          className={base} required={field.required} />
      </div>
    );
  }

  // Nicely render the structured workflow output
  function renderOutput(data) {
    if (!data) return null;
    // Flatten input structure
    const top = Array.isArray(data) ? data[0] : data;
    // Resilient parser: handles string, object, and double-encoded JSON strings
    const tryParseOnce = (val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return null; }
      }
      return (val && typeof val === 'object') ? val : null;
    };
    const deepParseJson = (val, maxDepth = 2) => {
      let out = tryParseOnce(val);
      if (!out) return typeof val === 'object' ? val : null;
      let depth = 1;
      // If parsing yields a string that is itself JSON, parse again (up to maxDepth)
      while (depth < maxDepth && typeof out === 'string') {
        const next = tryParseOnce(out);
        if (!next) break;
        out = next;
        depth++;
      }
      return out;
    };
    // Extract JSON text from markdown code fences or mixed prose
    const extractJsonFromText = (text) => {
      if (typeof text !== 'string') return null;
      // Try fenced code block first: ```json ... ``` or ``` ... ```
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      const candidateText = fenceMatch ? fenceMatch[1] : text;
      // Try to locate a JSON object by braces
      const firstBrace = candidateText.indexOf('{');
      const lastBrace = candidateText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonSlice = candidateText.slice(firstBrace, lastBrace + 1);
        try { return JSON.parse(jsonSlice); } catch { /* ignore */ }
      }
      return null;
    };
    // Candidate payload may be nested under `output`
    const candidate = top?.output ?? top;
    console.log("candidate", candidate);
    console.log("draftOutput", candidate?.draftOutput);
    // Prefer explicit draftOutput/taskOutput if present; otherwise, fallback to using candidate directly
    const draftParsed = candidate?.draftOutput ? (deepParseJson(candidate.draftOutput) ?? null) : null;
    console.log("draftParsed", draftParsed);
    const draftOutput = draftParsed ?? (
      // If candidate looks like a draft (has social/video/ideas keys), use it as-is
      (candidate)
        ? candidate
        : {}
    );

    // Parse taskOutput robustly: plain JSON, double-encoded, or fenced JSON within prose
    let taskParsed = null;
    if (candidate?.taskOutput != null) {
      taskParsed = deepParseJson(candidate.taskOutput) ?? extractJsonFromText(String(candidate.taskOutput));
    }
    console.log("taskParsed", taskParsed);
    const taskOutput = taskParsed ?? (
      // If candidate directly contains tasks, wrap them
      (candidate)
        ? { tasks: candidate.tasks, task_breakdown: candidate.task_breakdown }
        : {}
    );
    console.log("draftOutput",draftOutput);
    console.log("taskOutput", taskOutput);
    // Helper: Flexible render of any object (for DraftOutput)
    const renderObjectFlex = (obj) => {
      console.log("obj", obj);
      if (!obj || typeof obj !== 'object') return null;
  
      return (
        <div className="space-y-6">
          {Object.entries(obj).map(([key, value]) => {
            if (Array.isArray(value)) {
              return (
                <div key={key}>
                  <h3 className="text-lg font-semibold mb-2 capitalize">{key.replace(/_/g, ' ')}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {value.map((item, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-sm space-y-2">
                        {typeof item === 'object' ? (
                          Object.entries(item).map(([subKey, subValue]) => (
                            <div key={subKey}>
                              <div className="text-xs uppercase text-gray-500 mb-1">{subKey}</div>
                              <pre dir={subKey.toLowerCase().includes("arabic") ? "rtl" : "ltr"} className="whitespace-pre-wrap leading-relaxed">
                                {String(subValue)}
                              </pre>
                            </div>
                          ))
                        ) : (
                          <pre className="whitespace-pre-wrap">{String(item)}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
  
            // Render primitives or nested objects
            return (
              <div key={key}>
                <h3 className="text-lg font-semibold mb-1 capitalize">{key.replace(/_/g, ' ')}</h3>
                {typeof value === 'object' ? (
                  <div className="ml-4 space-y-2 text-sm">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey}>
                        <span className="font-medium">{subKey}:</span> {String(subValue)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">{String(value)}</p>
                )}
              </div>
            );
          })}
        </div>
      );
    };
  
    return (
      <div className="mt-10 space-y-10">
        {/* DraftOutput Card */}
        {draftOutput && Object.keys(draftOutput).length > 0 && (
          <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Draft Output</h2>
            {renderObjectFlex(draftOutput)}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300 select-none">Raw JSON</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded p-3">{JSON.stringify(draftOutput, null, 2)}</pre>
            </details>
          </section>
        )}
  
        {/* TaskOutput Card */}
        {(() => {
          const taskList = taskOutput?.task_breakdown || taskOutput?.Task_Breakdown || taskOutput?.Tasks || taskOutput?.tasks || [];
          if (!Array.isArray(taskList) || taskList.length === 0) return null;
          return (
            <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-xl font-semibold mb-2">Task Output</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Actionable tasks</p>
              <ol className="space-y-3">
                {taskList.map((t, idx) => {
                  const title = t.name || t.task || t.task_name || t.title || t.Description || `Task ${idx + 1}`;
                  const desc = t.description || t.task_description || t.details || t.summary || t.Description || '';
                  const assignee = t.assigned_to || t.assignee || t.Responsible || '';
                  const due = t.due_date || t.deadline || t['Due Date'] || '';
                  // Prepare a list of extra fields to show as metadata (excluding ones we rendered)
                  const omitKeys = new Set(['name','task','task_name','title','Description','description','task_description','details','summary','assigned_to','assignee','Responsible','due_date','deadline','Due Date']);
                  const extras = Object.entries(t).filter(([k]) => !omitKeys.has(k));
                  return (
                    <li key={idx} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-medium">{idx + 1}</span>
                        <div>
                          <div className="font-medium">{title}</div>
                          {desc && (
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{desc}</div>
                          )}
                          {assignee && (
                            <div className="text-xs text-gray-400">Assigned to: {assignee}</div>
                          )}
                          {due && <div className="text-xs text-gray-400">Due: {due}</div>}
                          {extras.length > 0 && (
                            <div className="mt-2 grid gap-1 text-xs text-gray-500 dark:text-gray-400">
                              {extras.map(([k, v]) => (
                                <div key={k}><span className="uppercase">{k}:</span> {String(v)}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300 select-none">Raw JSON</summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded p-3">{JSON.stringify(taskOutput, null, 2)}</pre>
              </details>
            </section>
          );
        })()}
      </div>
    );
  }
  

  return (
    <Layout>
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <span className="font-medium">{workflow.name}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">{workflow.name}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">{workflow.description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Toggle button visible when form is hidden */}
        {!showForm && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-expanded={showForm}
            >
              Show form
            </button>
          </div>
        )}

        {/* Animated form container */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showForm
              ? 'opacity-100 translate-y-0 max-h-[4000px]'
              : 'opacity-0 -translate-y-3 max-h-0 pointer-events-none'
          }`}
          aria-hidden={!showForm}
        >
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {workflow.fields.map(renderField)}
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 text-white px-4 py-2 text-sm font-medium shadow hover:shadow-md disabled:opacity-60">
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              Submit
            </button>
            <button type="button" onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Cancel</button>
          </div>
        </form>
        </div>

        {/* Render the workflow result output, if available (outside the sliding form) */}
        {result && (
          <div ref={resultRef} className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
            {renderOutput(result)}

            {/* Feedback section */}
            <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-xl font-semibold mb-2">Share Feedback</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Let us know what you think about the generated result. Your feedback will be submitted with your original inputs.</p>
              <form onSubmit={onSubmitFeedback} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="user_feedback" className="block text-sm font-medium">Feedback</label>
                  <textarea
                    id="user_feedback"
                    name="user_feedback"
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-28"
                    placeholder="Write your feedback here..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={!lastPayload || feedbackLoading}
                  />
                </div>

                {feedbackError && (
                  <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 px-4 py-3 text-sm">
                    {feedbackError}
                  </div>
                )}
                {feedbackSuccess && (
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 px-4 py-3 text-sm">
                    {feedbackSuccess}
                  </div>
                )}
                {!lastPayload && (
                  <div className="text-xs text-amber-600 dark:text-amber-300">Feedback is disabled until you submit the form at least once.</div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={feedbackLoading || !feedback.trim() || !lastPayload}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 text-white px-4 py-2 text-sm font-medium shadow hover:shadow-md disabled:opacity-60"
                  >
                    {feedbackLoading && (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    )}
                    Submit Feedback
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}


import { useMemo, useState } from 'react';
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

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

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

    // Support either [{ output: {...} }] or { output: {...} } or just {...}
    const top = Array.isArray(data) ? data[0] : data;
    const output = top?.output ?? top;

    if (typeof output !== 'object' || output === null) {
      return (
        <div className="mt-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-sm">
          <pre className="whitespace-pre-wrap break-words">{String(output)}</pre>
        </div>
      );
    }

    const posts = output.social_media_posts || [];
    const videos = output.video_scripts || [];
    const ideas = output.mini_idea_deck || [];
    const tasks = output.task_breakdown || [];

    return (
      <div className="mt-10 space-y-10">
        {/* Social Media Posts */}
        {posts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Social Media Posts</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((p, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Post {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 px-2 py-0.5 text-xs">AR</span>
                      <span className="rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 px-2 py-0.5 text-xs">EN</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    {p.arabic && (
                      <div>
                        <div className="text-xs uppercase text-gray-500 mb-1">Arabic</div>
                        <p dir="rtl" className="leading-relaxed">{p.arabic}</p>
                      </div>
                    )}
                    {p.english && (
                      <div>
                        <div className="text-xs uppercase text-gray-500 mb-1">English</div>
                        <p className="leading-relaxed">{p.english}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Video Scripts */}
        {videos.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Video Scripts</h2>
            <div className="space-y-4">
              {videos.map((v, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                  <div className="text-xs uppercase text-gray-500 mb-3">Script {idx + 1}</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {v.arabic && (
                      <div>
                        <div className="text-xs uppercase text-gray-500 mb-1">Arabic</div>
                        <pre dir="rtl" className="text-sm whitespace-pre-wrap leading-relaxed">{v.arabic}</pre>
                      </div>
                    )}
                    {v.english && (
                      <div>
                        <div className="text-xs uppercase text-gray-500 mb-1">English</div>
                        <pre className="text-sm whitespace-pre-wrap leading-relaxed">{v.english}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mini Idea Deck */}
        {ideas.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Mini Idea Deck</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {ideas.map((i, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                  <div className="text-xs uppercase text-gray-500 mb-3">Idea {idx + 1}</div>
                  <div className="space-y-3">
                    {i.arabic && (
                      <div>
                        <div className="text-xs uppercase text-gray-500 mb-1">Arabic</div>
                        <pre dir="rtl" className="text-sm whitespace-pre-wrap leading-relaxed">{i.arabic}</pre>
                      </div>
                    )}
                    {i.english && (
                      <div>
                        <div className="text-xs uppercase text-gray-500 mb-1">English</div>
                        <pre className="text-sm whitespace-pre-wrap leading-relaxed">{i.english}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Task Breakdown */}
        {tasks.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Task Breakdown</h2>
            <ol className="space-y-3">
              {tasks.map((t, idx) => (
                <li key={idx} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-medium">{idx + 1}</span>
                    <div>
                      <div className="font-medium">{t.task || `Step ${idx + 1}`}</div>
                      {t.details && <div className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{t.details}</div>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
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
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            {renderOutput(result)}
          </div>
        )}
      </div>
    </Layout>
  );
}


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
      setSuccess('Submitted successfully!');
      e.currentTarget.reset();
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
            <option value="" disabled selected hidden>Choose...</option>
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
              Submit to n8n
            </button>
            <button type="button" onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

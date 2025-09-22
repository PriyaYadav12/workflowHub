import Layout from '../components/Layout';
import WorkflowCard from '../components/WorkflowCard';
import workflows from '../data/workflows';

export default function Home() {
  return (
    <Layout>
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-primary-200/60 dark:ring-primary-800/60 mb-4">Demo Toolkit</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Workflow Hub
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A beautiful collection of workflows to demo your automation capabilities. Click any card to open a form that triggers your n8n webhook.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

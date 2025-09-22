import { Link } from 'react-router-dom';

export default function WorkflowCard({ workflow }) {
  return (
    <Link
      to={`/workflows/${workflow.id}`}
      className="group block rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className={`h-28 bg-gradient-to-br ${workflow.color}`} />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-600">
          {workflow.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {workflow.description}
        </p>
      </div>
    </Link>
  );
}

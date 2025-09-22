import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600" />
            <span className="font-semibold text-lg">Workflow Hub</span>
          </Link>
          <nav className="text-sm text-gray-600 dark:text-gray-300">
            <a href="https://n8n.io" target="_blank" rel="noreferrer" className="hover:text-primary-600">n8n</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500">
        Built for demos by Automation Engineer
      </footer>
    </div>
  );
}

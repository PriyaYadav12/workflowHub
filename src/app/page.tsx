import AutomationCard from "@/components/AutomationCard";
import { automations } from "@/data/automations";

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)]" />
        <header className="relative z-10 border-b border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-indigo-500/40 ring-1 ring-inset ring-white/20" />
              <span className="text-sm font-semibold tracking-wide text-white/90">Workflow Hub</span>
            </div>
            <span className="text-xs text-white/50">n8n</span>
          </div>
        </header>

        <section className="relative z-10 mx-auto max-w-6xl px-4 pt-12 sm:pt-16 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            Demo Toolkit
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-[-0.02em] text-white">
            Workflow Hub
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">
            A beautiful collection of workflows to demo your automation capabilities. Click any card to open a form that triggers your n8n webhook.
          </p>
        </section>
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((a) => (
            <AutomationCard key={a.slug} automation={a} />
          ))}
        </div>
      </section>
    </main>
  );
}

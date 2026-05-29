// Root page — will be replaced with the full QueryBuilder in PR #4
// This placeholder confirms the app boots correctly on first deploy

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Query<span className="text-[var(--brand)]">Craft</span>
        </h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          Visual Query Builder — coming soon
        </p>
      </div>
    </main>
  )
}

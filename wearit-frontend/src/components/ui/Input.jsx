export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-transparent border border-border text-foreground placeholder:text-zinc-400 focus:outline-none focus:border-foreground transition-colors duration-200 text-sm ${error ? 'border-brand' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-brand mt-1">{error}</p>}
    </div>
  )
}

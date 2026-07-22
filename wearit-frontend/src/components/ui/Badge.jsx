const colors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  delivered: 'bg-sky-50 text-sky-700 border-sky-200',
  default: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  sale: 'bg-brand text-white border-brand',
  new: 'bg-foreground text-white border-foreground',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] border ${colors[variant] || colors.default} ${className}`}>
      {children}
    </span>
  )
}

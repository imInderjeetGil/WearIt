import { SIZES } from '../../utils/constants'

export default function SizeSelector({ selected, onChange }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted mb-3">
        Select Size {selected && <span className="text-foreground">— {selected}</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`w-12 h-12 text-xs font-medium uppercase tracking-[0.1em] border transition-all duration-200 cursor-pointer ${
              selected === size
                ? 'bg-foreground text-white border-foreground'
                : 'bg-white text-foreground border-border hover:border-foreground'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}

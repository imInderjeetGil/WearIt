import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-foreground text-white hover:bg-foreground/90',
  brand: 'bg-brand text-white hover:bg-brand-dark',
  outline: 'border-2 border-foreground text-foreground hover:bg-foreground hover:text-white',
  ghost: 'text-foreground hover:bg-zinc-100',
  light: 'bg-white text-foreground hover:bg-zinc-50',
}

const sizes = {
  sm: 'px-4 py-2 text-xs tracking-wider',
  md: 'px-6 py-3 text-sm tracking-wider',
  lg: 'px-8 py-4 text-sm tracking-wider',
  icon: 'p-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`inline-flex items-center justify-center font-medium uppercase transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}

import { IoRocketOutline, IoRefreshOutline, IoShieldCheckmarkOutline, IoCardOutline } from 'react-icons/io5'

const features = [
  { icon: IoRocketOutline, title: 'Free Delivery', desc: 'On orders over ₹999' },
  { icon: IoRefreshOutline, title: 'Easy Returns', desc: '15-day return policy' },
  { icon: IoShieldCheckmarkOutline, title: '100% Original', desc: 'Authentic products' },
  { icon: IoCardOutline, title: 'Secure Payment', desc: 'Protected checkout' },
]

export default function FeaturesStrip() {
  return (
    <section className="bg-zinc-50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="flex items-center gap-3">
                <Icon size={24} className="text-muted flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em]">{f.title}</p>
                  <p className="text-[11px] text-muted mt-0.5">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

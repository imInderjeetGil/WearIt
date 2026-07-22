import { Link, useLocation } from 'react-router-dom'
import { IoHomeOutline, IoGridOutline, IoBagOutline, IoPersonOutline } from 'react-icons/io5'
import useCartStore from '../../store/cartStore'
import { isAuthenticated } from '../../utils/helpers'

export default function MobileBottomNav() {
  const location = useLocation()
  const cartStore = useCartStore()
  const totalItems = cartStore.items.reduce((sum, item) => sum + item.quantity, 0)

  const tabs = [
    { label: 'Home', icon: IoHomeOutline, path: '/' },
    { label: 'Shop', icon: IoGridOutline, path: '/products' },
    {
      label: 'Cart',
      icon: IoBagOutline,
      path: '/cart',
      badge: totalItems,
      onClick: (e) => {
        e.preventDefault()
        cartStore.openCart()
      },
    },
    { label: 'Profile', icon: IoPersonOutline, path: isAuthenticated() ? '/orders' : '/login' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          const Icon = tab.icon
          return (
            <Link
              key={tab.label}
              to={tab.path}
              onClick={tab.onClick}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-full ${
                isActive ? 'text-foreground' : 'text-muted'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-brand text-white text-[8px] font-bold flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-[0.1em] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

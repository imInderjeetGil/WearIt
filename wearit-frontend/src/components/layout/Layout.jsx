import Navbar from './Navbar'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import CartDrawer from '../cart/CartDrawer'
import ToastProvider from '../ui/Toast'
import { isAuthenticated } from '../../utils/helpers'
import { useEffect } from 'react'
import useCartStore from '../../store/cartStore'

export default function Layout({ children }) {
  const fetchCart = useCartStore((s) => s.fetchCart)

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart()
    }
  }, [fetchCart])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <ToastProvider />
    </>
  )
}

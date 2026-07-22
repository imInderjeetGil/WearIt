import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoArrowBack, IoStar, IoStarOutline } from 'react-icons/io5'
import ImageGallery from '../components/product/ImageGallery'
import SizeSelector from '../components/product/SizeSelector'
import ReviewCard from '../components/product/ReviewCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import { formatPrice, isAuthenticated } from '../utils/helpers'
import { getProduct } from '../api/products'
import { getProductReviews, getAverageRating } from '../api/reviews'
import useCartStore from '../store/cartStore'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getProduct(id),
      getProductReviews(id).catch(() => ({ data: [] })),
      getAverageRating(id).catch(() => ({ data: { average_rating: 0 } })),
    ])
      .then(([productRes, reviewsRes, ratingRes]) => {
        setProduct(productRes.data)
        setReviews(reviewsRes.data || [])
        setAvgRating(ratingRes.data?.average_rating || 0)
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items')
      navigate('/login')
      return
    }
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    setAdding(true)
    try {
      await addItem(product.id, 1)
      toast.success('Added to bag')
    } catch {
      toast.error('Failed to add item')
    }
    setAdding(false)
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to continue')
      navigate('/login')
      return
    }
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    setAdding(true)
    try {
      await addItem(product.id, 1)
      navigate('/cart')
    } catch {
      toast.error('Failed to add item')
    }
    setAdding(false)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <Skeleton className="aspect-[3/4]" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/products" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground mb-6 transition-colors">
        <IoArrowBack size={14} />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Gallery */}
        <ImageGallery
          images={product.image_url ? [product.image_url] : []}
          productName={product.name}
        />

        {/* Details */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              <Badge variant="new">New</Badge>
              {product.quantity <= 5 && product.quantity > 0 && (
                <Badge variant="sale">Almost Sold Out</Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-display font-bold">{product.name}</h1>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    star <= Math.round(avgRating)
                      ? <IoStar key={star} size={14} className="text-amber-400" />
                      : <IoStarOutline key={star} size={14} className="text-zinc-300" />
                  ))}
                </div>
                <span className="text-xs text-muted">({reviews.length} reviews)</span>
              </div>
            )}

            <p className="text-2xl font-bold mt-4">{formatPrice(product.price)}</p>
            <p className="text-xs text-muted mt-1">Inclusive of all taxes</p>

            <div className="w-12 h-0.5 bg-foreground my-6" />

            <p className="text-sm text-zinc-600 leading-relaxed mb-6">{product.description}</p>

            {/* Size */}
            <SizeSelector selected={selectedSize} onChange={setSelectedSize} />

            {/* Stock */}
            <div className="flex items-center gap-2 mt-6">
              <span className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-xs text-muted">
                {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
              </span>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-8">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              loading={adding}
            >
              Add to Bag
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleBuyNow}
              disabled={product.quantity === 0}
            >
              Buy Now
            </Button>
          </div>

          {/* Shipping info */}
          <div className="mt-6 p-4 bg-zinc-50 border border-border text-xs text-muted space-y-2">
            <p className="font-medium text-foreground uppercase tracking-[0.1em]">Shipping Info</p>
            <p>Free delivery on orders over ₹999</p>
            <p>Easy 15-day returns & exchanges</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 md:mt-24">
        <h2 className="text-lg font-display font-bold mb-6">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="max-w-xl">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

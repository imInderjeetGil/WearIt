import { IoStar, IoStarOutline } from 'react-icons/io5'

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <IoStar size={14} className="text-amber-400" />
          ) : (
            <IoStarOutline size={14} className="text-zinc-300" />
          )}
        </span>
      ))}
    </div>
  )
}

export default function ReviewCard({ review }) {
  return (
    <div className="py-5 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{review.user_name || 'Anonymous'}</span>
        <span className="text-[11px] text-muted">
          {review.created_at ? new Date(review.created_at).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
          }) : ''}
        </span>
      </div>
      <Stars rating={review.rating} />
      {review.comment && (
        <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{review.comment}</p>
      )}
    </div>
  )
}

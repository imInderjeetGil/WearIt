import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  createReview,
  deleteReview,
  getProductReviews,
} from "../api/review";

export default function ReviewSection({
  product,
  user,
  onSummaryChange,
}) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function loadReviews() {
    try {
      const { data } = await getProductReviews(product.id);
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (product?.id) {
      loadReviews();
    }
  }, [product?.id]);

  // Calculate average rating
  useEffect(() => {
    if (reviews.length > 0) {
      const average =
        reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviews.length;

      onSummaryChange({
        average,
        count: reviews.length,
      });
    } else {
      onSummaryChange({
        average: 0,
        count: 0,
      });
    }
  }, [reviews, onSummaryChange]);

  async function submitReview() {
    if (!comment.trim()) {
      toast.error("Write something.");
      return;
    }

    try {
      await createReview({
        product_id: product.id,
        rating,
        comment: comment.trim(),
      });

      toast.success("Review added.");

      setComment("");
      setRating(5);
      setShowForm(false);

      await loadReviews();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ??
          "Unable to review."
      );
    }
  }

  async function removeReview(id) {
    try {
      await deleteReview(id);

      toast.success("Review deleted.");

      await loadReviews();
    } catch (err) {
      toast.error("Failed to delete review.");
    }
  }

  return (
    <section className="mx-auto mt-20 max-w-5xl border-t pt-12">

      {/* Header */}

      <div className="flex items-center justify-between">

        <h2 className="text-3xl font-bold">
          Reviews ({reviews.length})
        </h2>

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="
            rounded-xl
            bg-black
            px-5
            py-3
            text-sm
            font-medium
            text-white
            transition
            hover:bg-zinc-800
          "
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>

      </div>

      {/* Review Form */}

      {showForm && (
        <div className="mt-8 grid gap-5 md:grid-cols-12">

          {/* Rating */}

          <div className="
            rounded-2xl
            border
            p-6
            md:col-span-3
          ">

            <p className="mb-4 font-medium">
              Your Rating
            </p>

            <div className="flex gap-1">

              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} out of 5`}
                >
                  <Star
                    size={22}
                    fill={
                      star <= rating
                        ? "currentColor"
                        : "none"
                    }
                    className="
                      text-yellow-500
                      transition-transform
                      hover:scale-110
                    "
                  />
                </button>
              ))}

            </div>

          </div>

          {/* Comment */}

          <div className="md:col-span-9">

            <textarea
              rows={4}
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Share your experience..."
              className="
                w-full
                resize-none
                rounded-2xl
                border
                border-zinc-200
                p-5
                outline-none
                transition
                focus:border-black
              "
            />

            <button
              onClick={submitReview}
              className="
                mt-4
                rounded-xl
                bg-black
                px-6
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-zinc-800
              "
            >
              Submit Review
            </button>

          </div>

        </div>
      )}

      {/* Reviews */}

      <div className="mt-10">

        {reviews.length === 0 ? (

          <div className="
            rounded-2xl
            border
            border-dashed
            border-zinc-300
            p-10
            text-center
          ">

            <p className="font-medium">
              No reviews yet
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Be the first to share your experience.
            </p>

          </div>

        ) : (

          reviews.map((review) => (

            <div
              key={review.id}
              className="border-b py-8"
            >

              <div className="flex justify-between gap-6">

                {/* User + Review */}

                <div className="flex gap-4">

                  {/* Avatar */}

                  <div className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-zinc-100
                    font-semibold
                  ">
                    {review.user_name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <p className="font-semibold">
                      {review.user_name}
                    </p>

                    {/* Rating */}

                    <div className="mt-1 flex gap-0.5">

                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={
                              star <= review.rating
                                ? "currentColor"
                                : "none"
                            }
                            className="text-yellow-500"
                          />
                        )
                      )}

                    </div>

                    {/* Comment */}

                    <p className="
                      mt-3
                      leading-6
                      text-zinc-600
                    ">
                      {review.comment}
                    </p>

                  </div>

                </div>

                {/* Date + Delete */}

                <div className="
                  flex
                  shrink-0
                  items-start
                  gap-4
                ">

                  <span className="
                    text-sm
                    text-zinc-400
                  ">
                    {new Date(
                      review.created_at
                    ).toLocaleDateString()}
                  </span>

                  {review.user_id === user?.id && (
                    <button
                      onClick={() =>
                        removeReview(review.id)
                      }
                      className="
                        text-zinc-400
                        transition
                        hover:text-red-500
                      "
                      aria-label="Delete review"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}

                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </section>
  );
}
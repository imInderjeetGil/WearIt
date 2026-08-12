import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

import { OCCASIONS, getRecommendations } from "../api/recommendations";
import LookCard from "../components/LookCard";

export default function FindYourLook() {
  const [occasion, setOccasion] = useState("Casual");
  const [budget, setBudget] = useState("2000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  async function handleFindLooks(e) {
    e.preventDefault();

    const parsedBudget = Number(budget);
    if (!parsedBudget || parsedBudget <= 0) {
      toast.error("Enter a valid budget amount.");
      return;
    }

    setLoading(true);
    setResult(null);
    setSearched(false);

    try {
      const { data } = await getRecommendations(occasion, parsedBudget);
      setResult(data);
      setSearched(true);
    } catch (err) {
      toast.error(err.response?.data?.detail ?? "Something went wrong. Try again.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-14">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600">
          <Sparkles size={14} className="text-zinc-900" />
          WearIt Smart Recommendations
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl">
          Find Your Look
        </h1>
        <p className="mt-3 text-zinc-500">
          Tell us the occasion and your budget — we'll style a complete look
          from the WearIt catalog to match your taste.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleFindLooks}
        className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-end sm:p-6"
      >
        <label className="flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Occasion
          </span>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="h-13 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-black"
          >
            {OCCASIONS.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Budget (₹)
          </span>
          <input
            type="number"
            min="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 2000"
            className="h-13 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-black"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex h-13 items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Styling...
            </>
          ) : (
            <>
              Find My Looks
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Requires profile */}
      {searched && result?.requires_profile && (
        <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <Sparkles size={32} className="mx-auto text-zinc-300" />
          <h2 className="mt-4 text-xl font-bold text-zinc-900">
            Complete your style profile
          </h2>
          <p className="mt-2 text-zinc-500">
            {result.message}
          </p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:bg-zinc-800"
          >
            Complete Profile
            <ArrowRight size={17} />
          </Link>
        </div>
      )}

      {/* Empty / message state */}
      {searched && !result?.requires_profile && result?.outfits?.length === 0 && (
        <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-zinc-900">
            No looks fit that yet
          </h2>
          <p className="mt-2 text-zinc-500">
            {result?.message}
          </p>
          {result?.recommended_budget && (
            <p className="mt-3 text-sm text-zinc-500">
              Try a budget of around{" "}
              <span className="font-semibold text-zinc-900">
                ₹{result.recommended_budget}
              </span>
              .
            </p>
          )}
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-7 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            Browse the catalog
            <ArrowRight size={17} />
          </Link>
        </div>
      )}

      {/* Results */}
      {searched && !result?.requires_profile && result?.outfits?.length > 0 && (
        <div className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
              Recommended for You
            </h2>
            <p className="text-sm text-zinc-500">{result.message}</p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {result.outfits.map((look) => (
              <LookCard key={look.id} look={look} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

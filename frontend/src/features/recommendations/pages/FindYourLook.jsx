import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

import { OCCASIONS, findYourLook } from "../api/looks";
import LookCard from "../components/LookCard";

// Results survive navigating to a product page and back (sessionStorage,
// cleared when the user explicitly starts a new request).
const STORAGE_KEY = "wearit:find-your-look";

function loadStoredState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function FindYourLook() {
  const stored = loadStoredState();

  const [occasions, setOccasions] = useState(stored?.request?.occasion ?? []);
  const [budget, setBudget] = useState(
    stored?.request?.budget_max != null
      ? String(stored.request.budget_max)
      : "3000"
  );
  const [description, setDescription] = useState(
    stored?.request?.description ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(stored?.result ?? null);
  const [searched, setSearched] = useState(stored?.searched ?? false);

  function persist(next) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — results just won't survive navigation */
    }
  }

  function toggleOccasion(option) {
    setOccasions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  }

  async function handleFindLooks(e) {
    e.preventDefault();

    const parsedBudget = Number(budget);
    if (!parsedBudget || parsedBudget <= 0) {
      toast.error("Enter a valid budget amount.");
      return;
    }

    // Explicitly starting a new request clears any previous stored results.
    sessionStorage.removeItem(STORAGE_KEY);

    setLoading(true);
    setResult(null);
    setSearched(false);

    const request = {
      occasion: occasions,
      budget_max: parsedBudget,
      description: description.trim() || null,
    };

    try {
      const { data } = await findYourLook(request);
      setResult(data);
      setSearched(true);
      persist({ request, result: data, searched: true });
    } catch (err) {
      toast.error(err.response?.data?.detail ?? "Something went wrong. Try again.");
      setSearched(true);
      persist({ request, result: null, searched: true });
    } finally {
      setLoading(false);
    }
  }

  const intent = result?.intent;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-14">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600">
          <Sparkles size={14} className="text-zinc-900" />
          WearIt AI Stylist
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl">
          Find Your Look
        </h1>
        <p className="mt-3 text-zinc-500">
          Describe what you're looking for in your own words — our AI stylist
          reads it and assembles complete looks from real WearIt products.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleFindLooks}
        className="mx-auto mt-10 max-w-3xl space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-8"
      >
        {/* Occasion — broad structured hint, not the primary intelligence */}
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            What's the occasion? (optional hint)
          </span>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOccasion(option)}
                className={`
                  rounded-lg border px-4 py-2 text-sm font-medium transition

                  ${
                    occasions.includes(option)
                      ? "bg-black text-white border-black"
                      : "hover:bg-zinc-100"
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <label className="block max-w-xs">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Budget (₹)
          </span>
          <input
            type="number"
            min="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 3000"
            className="h-13 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-black"
            required
          />
        </label>

        {/* Natural language — the main intelligence input */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Tell us what you're looking for
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={'e.g. "I need something for Holi, comfortable, festive and colorful under ₹3000"'}
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-900 outline-none transition focus:border-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Styling...
            </>
          ) : (
            <>
              <Sparkles size={17} />
              Find My Look
            </>
          )}
        </button>
      </form>

      {/* Inferred intent summary — shows what the AI understood */}
      {intent && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {result.ai_styled ? "AI stylist understood" : "Built from your selections"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {intent.event && (
              <span className="rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-800">
                Event: {intent.event}
              </span>
            )}
            {(intent.occasion_types ?? []).map((value) => (
              <span key={`occ-${value}`} className="rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
                {value}
              </span>
            ))}
            {(intent.styles ?? []).map((value) => (
              <span key={`style-${value}`} className="rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
                {value}
              </span>
            ))}
            {(intent.colors ?? []).map((value) => (
              <span key={`color-${value}`} className="rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
                {value}
              </span>
            ))}
            {(intent.fit_types ?? []).map((value) => (
              <span key={`fit-${value}`} className="rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
                {value} fit
              </span>
            ))}
            {intent.budget_max != null && (
              <span className="rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
                Under ₹{intent.budget_max}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty / message state */}
      {searched && result?.looks?.length === 0 && (
        <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-zinc-900">
            No looks fit that yet
          </h2>
          <p className="mt-2 text-zinc-500">
            {result?.message ?? "Try a different description or a higher budget."}
          </p>
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
      {searched && result?.looks?.length > 0 && (
        <div className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
              Your Looks
            </h2>
            {result.message && (
              <p className="text-sm text-zinc-500">{result.message}</p>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {result.looks.map((look) => (
              <LookCard key={look.id} look={look} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
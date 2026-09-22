import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

import { uploadTryOnReference } from "../api/tryon";
import { updateProfile } from "../../profile/api/profile";

const BODY_TYPES = ["Slim", "Regular", "Athletic", "Heavy"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

// Shown when the user has no reference photo yet: collect a full-body
// photo plus height/body-type metrics, then persist them via
// /try-on/upload-reference + PUT /profile before triggering generation.
export default function TryOnReferenceModal({ open = false, onClose, onSaved }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (selected.size > MAX_FILE_BYTES) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      toast.error("Please choose a full-body photo.");
      return;
    }

    const height = Number(heightCm);
    if (!Number.isFinite(height) || height < 100 || height > 250) {
      toast.error("Enter a height between 100 and 250 cm.");
      return;
    }

    if (!bodyType) {
      toast.error("Select your body type.");
      return;
    }

    try {
      setSaving(true);

      // 1) Store the reference photo on S3 + user_profiles.
      await uploadTryOnReference(file);

      // 2) Persist the fitting metrics (partial update — backend merges).
      await updateProfile({ height_cm: height, body_type: bodyType });

      toast.success("Reference photo saved");
      onSaved();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ?? "Could not save your reference photo."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
        >
          <X size={20} />
        </button>

        <h2 className="pr-8 text-xl font-bold">Set up your AI preview</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Upload one full-body photo so we can show your cart styled on you.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 flex h-44 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 text-zinc-500 transition hover:border-zinc-900 hover:text-zinc-900"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Reference preview"
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <>
              <ImagePlus size={30} />
              <span className="text-sm font-medium">
                Choose a full-body photo
              </span>
              <span className="text-xs">JPG, PNG or WebP · max 5MB</span>
            </>
          )}
        </button>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Height (cm)</label>
            <input
              type="number"
              min={100}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 170"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Body Type</label>
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            >
              <option value="">Select</option>
              {BODY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "Saving..." : "Save & Preview Outfit"}
        </button>
      </form>
    </div>
  );
}
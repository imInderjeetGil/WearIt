import { useEffect, useRef, useState } from "react";
import { User, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getProfile,
  updateProfile,
  uploadProfileImage,
} from "../api/profile";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  const [profile, setProfile] = useState({
    avatar_url: "",
    height_cm: "",
    gender: "",
    body_type: "",
    preferred_fit: "",
    style_preference: "",
    reference_image_url: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data } = await getProfile();

      setProfile({
        avatar_url: data.avatar_url || "",
        height_cm: data.height_cm || "",
        gender: data.gender || "",
        body_type: data.body_type || "",
        preferred_fit: data.preferred_fit || "",
        style_preference: data.style_preference || "",
        reference_image_url: data.reference_image_url || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);

      const { image_url } = await uploadProfileImage(file);

      setProfile((prev) => ({
        ...prev,
        reference_image_url: image_url,
      }));

      toast.success("Reference photo uploaded");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      await updateProfile(profile);

      toast.success("Profile Updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">

      <div className="mb-10">

        <div className="flex items-center gap-3">

          <Sparkles className="text-indigo-600" />

          <h1 className="text-4xl font-black">
            AI Profile
          </h1>

        </div>

        <p className="mt-2 text-zinc-500">
          Complete your profile for AI Try-On &
          personalized recommendations.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">

        {/* Avatar */}

        <div className="rounded-3xl border p-8">

          <div className="flex justify-center">

            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="h-44 w-44 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-zinc-100">

                <User
                  size={70}
                  className="text-zinc-400"
                />

              </div>
            )}

          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={uploadingPhoto}
          />

          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="
            mt-8
            w-full
            rounded-xl
            border
            py-3
            font-semibold
            disabled:opacity-60
          "
          >
            {uploadingPhoto ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </span>
            ) : (
              "Upload Reference Photo"
            )}
          </button>

          {profile.reference_image_url && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">
                Reference Photo
              </p>
              <img
                src={profile.reference_image_url}
                alt="Reference"
                className="h-40 w-full rounded-xl object-cover"
              />
            </div>
          )}

          <button
            disabled
            className="
            mt-4
            w-full
            rounded-xl
            bg-black
            py-3
            font-semibold
            text-white
            opacity-40
          "
          >
            Generate AI Model
          </button>

        </div>

        {/* Form */}

        <div className="rounded-3xl border p-8">

          <div className="grid gap-6 md:grid-cols-2">

            <Input
              label="Height (cm)"
              type="number"
              value={profile.height_cm}
              onChange={(e) =>
                updateField(
                  "height_cm",
                  e.target.value === ""
                    ? null
                    : Number(e.target.value)
                )
              }
            />

            <Select
              label="Gender"
              value={profile.gender}
              onChange={(e) =>
                updateField(
                  "gender",
                  e.target.value
                )
              }
              options={[
                "Male",
                "Female",
                "Other",
              ]}
            />

            <Select
              label="Body Type"
              value={profile.body_type}
              onChange={(e) =>
                updateField(
                  "body_type",
                  e.target.value
                )
              }
              options={[
                "Slim",
                "Regular",
                "Athletic",
                "Heavy",
              ]}
            />

            <Select
              label="Preferred Fit"
              value={profile.preferred_fit}
              onChange={(e) =>
                updateField(
                  "preferred_fit",
                  e.target.value
                )
              }
              options={[
                "Slim Fit",
                "Regular Fit",
                "Relaxed Fit",
                "Oversized",
              ]}
            />

            <Select
              label="Style Preference"
              value={profile.style_preference}
              onChange={(e) =>
                updateField(
                  "style_preference",
                  e.target.value
                )
              }
              options={[
                "Minimal",
                "Streetwear",
                "Casual",
                "Formal",
                "Vintage",
                "Sport",
                "Luxury",
              ]}
            />

          </div>

          <div className="mt-10 flex justify-end">

            <button
              onClick={handleSave}
              disabled={saving}
              className="
              rounded-xl
              bg-black
              px-8
              py-3
              font-semibold
              text-white
            "
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

function Input({
  label,
  ...props
}) {
  return (
    <div>

      <label className="mb-2 block font-medium">
        {label}
      </label>

      <input
        {...props}
        className="
        w-full
        rounded-xl
        border
        px-4
        py-3
        outline-none
        focus:ring-2
      "
      />

    </div>
  );
}

function Select({
  label,
  options,
  ...props
}) {
  return (
    <div>

      <label className="mb-2 block font-medium">
        {label}
      </label>

      <select
        {...props}
        className="
        w-full
        rounded-xl
        border
        px-4
        py-3
        outline-none
        focus:ring-2
      "
      >
        <option value="">
          Select
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}
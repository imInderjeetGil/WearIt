// src/pages/RegisterPage.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { registerUser } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-7xl">

        {/* Left */}

        <div className="hidden w-1/2 bg-black lg:flex lg:flex-col lg:justify-center lg:px-20">

          <p className="mb-3 text-sm uppercase tracking-[0.5em] text-zinc-400">
            WearIt
          </p>

          <h1 className="text-6xl font-black leading-tight text-white">
            Join
            <br />
            WearIt.
          </h1>

          <p className="mt-8 max-w-md text-lg leading-relaxed text-zinc-300">
            Create your account and discover premium fashion.
          </p>

        </div>

        {/* Right */}

        <div className="flex w-full items-center justify-center bg-white px-6 py-16 lg:w-1/2">

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md"
          >
            <h2 className="text-4xl font-black">
              Create Account
            </h2>

            <p className="mt-2 text-zinc-500">
              Start shopping with WearIt.
            </p>

            {error && (
              <div className="mt-6 rounded-xl bg-red-100 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Name */}

            <div className="mt-8">
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="h-14 w-full rounded-xl border px-4 outline-none focus:border-black"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="h-14 w-full rounded-xl border px-4 outline-none focus:border-black"
                placeholder="john@example.com"
              />
            </div>

            {/* Password */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="h-14 w-full rounded-xl border px-4 pr-12 outline-none focus:border-black"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>
            </div>

            {/* Confirm Password */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="h-14 w-full rounded-xl border px-4 pr-12 outline-none focus:border-black"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>
            </div>

            <button
              disabled={loading}
              className="mt-8 flex h-14 w-full items-center justify-center rounded-xl bg-black font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={20}
                />
              ) : (
                "Create Account"
              )}
            </button>

            <p className="mt-8 text-center text-zinc-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-black"
              >
                Login
              </Link>
            </p>

          </form>

        </div>
      </div>
    </div>
  );
}
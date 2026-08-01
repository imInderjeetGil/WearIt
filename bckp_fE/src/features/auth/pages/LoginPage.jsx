// src/pages/LoginPage.jsx

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { loginUser } from "../api/auth";
import { useAuth } from "../context/auth-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await loginUser(form);

      const payload = JSON.parse(
  atob(data.access_token.split(".")[1])
);

login(
    data.access_token,
    data.user
);

if (payload.role === "admin") {
  navigate("/admin-panel");
} else {
  navigate(
  location.state?.from || "/"
);
}
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Invalid email or password."
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
            Welcome
            <br />
            Back.
          </h1>

          <p className="mt-8 max-w-md text-lg leading-relaxed text-zinc-300">
            Continue your fashion journey with premium streetwear.
          </p>

        </div>

        {/* Right */}

        <div className="flex w-full items-center justify-center bg-white px-6 py-16 lg:w-1/2">

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md"
          >
            <h2 className="text-4xl font-black">
              Login
            </h2>

            <p className="mt-2 text-zinc-500">
              Sign in to your account.
            </p>

            {error && (
              <div className="mt-6 rounded-xl bg-red-100 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email */}

            <div className="mt-8">

              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="h-14 w-full rounded-xl border px-4 outline-none transition focus:border-black"
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
                  placeholder="••••••••"
                  className="h-14 w-full rounded-xl border px-4 pr-12 outline-none transition focus:border-black"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            <div className="mt-4 flex justify-end">

              <Link
                to="/forgot-password"
                className="text-sm text-zinc-600 hover:text-black"
              >
                Forgot Password?
              </Link>

            </div>

            <button
              disabled={loading}
              className="mt-8 flex h-14 w-full items-center justify-center rounded-xl bg-black font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                "Login"
              )}
            </button>

            <p className="mt-8 text-center text-zinc-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-black"
              >
                Register
              </Link>
            </p>

          </form>

        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BigButton } from "@/components/senior/BigButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch role and redirect
    const { data: user } = await supabase.from("users").select("role").eq("id", data.user.id).single();
    const role = user?.role ?? "senior";

    if (role === "senior") router.push("/home");
    else if (role === "guardian") router.push("/guardian/dashboard");
    else if (role === "staff") router.push("/center/monitoring");
    else router.push("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-6">
        <div className="text-center">
          <span className="text-5xl">🤝</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">Sign In</h1>
          <p className="text-gray-500 mt-1">Welcome back to KindredCare AI</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-700 text-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold text-gray-700" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-lg font-semibold text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <BigButton type="submit" disabled={loading} size="xl">
            {loading ? "Signing in…" : "Sign In"}
          </BigButton>
        </form>

        <p className="text-center text-gray-500">
          New here?{" "}
          <Link href="/role-select" className="text-blue-700 font-semibold underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

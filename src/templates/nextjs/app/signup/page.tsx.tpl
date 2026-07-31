"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error } = await signUp(email, password);
    setLoading(false);
    if (error) return setError(error.message);

    if (data.user && !data.session) {
      setMessage("Check your email to confirm your account.");
    } else {
      setMessage("Account created. You can log in now.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-sm flex-col gap-4"
    >
      <h1 className="text-2xl font-bold">Sign up</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded border p-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="rounded border p-2"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}
      <button
        disabled={loading}
        className="rounded bg-blue-600 p-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Sign up"}
      </button>
      <Link href="/login" className="text-sm text-blue-600">
        Already have an account?
      </Link>
    </form>
  );
}

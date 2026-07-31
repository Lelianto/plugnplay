"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-sm flex-col gap-4"
    >
      <h1 className="text-2xl font-bold">Login</h1>
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
      <button
        disabled={loading}
        className="rounded bg-blue-600 p-2 text-white disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <Link href="/signup" className="text-sm text-blue-600">
        Create an account
      </Link>
    </form>
  );
}

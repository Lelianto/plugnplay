import { useState, type FormEvent } from "react";
import { signIn } from "../lib/auth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 320,
        margin: "0 auto",
      }}
    >
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}

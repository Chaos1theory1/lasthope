import { useState } from "react";
import { supabase } from "../lib/supabase";

const ADMIN_EMAIL = "biotechagro.digital@gmail.com";

export default function AdminLogin() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setLoading(false);
      setMessage("This email is not authorized as admin.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Login link sent. Check the BiotechAgro email inbox.");
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h1>BiotechAgro Admin Login</h1>

      <form onSubmit={handleLogin}>
        <label>Admin email</label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            marginBottom: 16,
          }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
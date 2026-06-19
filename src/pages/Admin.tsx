import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = "biotechagro.digital@gmail.com";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setChecking(false);
    }

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin-login";
  }

  if (checking) {
    return <p>Checking admin access...</p>;
  }

  if (!user) {
    window.location.href = "/admin-login";
    return null;
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Access denied</h1>
        <p>This account is not authorized.</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>BiotechAgro Admin Dashboard</h1>
      <p>You are logged in as {user.email}</p>

      <button onClick={logout}>Logout</button>

      <hr />

      <p>Next we will add product/service upload forms here.</p>
    </div>
  );
}
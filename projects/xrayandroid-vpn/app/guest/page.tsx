"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuestPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Starting guest session...");

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const response = await fetch("/api/auth/guest", {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          setMessage("Unable to start a guest session.");
          return;
        }
        if (mounted) {
          setMessage("Guest session ready. Redirecting...");
          setTimeout(() => router.replace("/dashboard"), 600);
        }
      } catch (err) {
        setMessage("Unable to start a guest session.");
      }
    }

    start();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-hero-gradient px-6 py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="chip">Guest access</div>
        <h1 className="mt-6 text-3xl font-semibold text-white">Launching FreeGate</h1>
        <p className="mt-4 text-sm text-white/70">{message}</p>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // ✅ Required
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-6"
      >
        <div className="flex justify-center mb-4">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded text-black font-semibold"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded text-black font-semibold"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 rounded font-semibold hover:bg-green-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

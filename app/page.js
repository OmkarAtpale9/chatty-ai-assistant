"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const handleStartChat = () => {
    // Smooth fade-out before routing
    document.getElementById("home-card").style.opacity = "0";
    setTimeout(() => {
      router.push("/chatbot");
    }, 400); // Wait for animation to finish
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 flex items-center justify-center p-6">
      {/* Main Card */}
      <motion.div
        id="home-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl 
        shadow-[0_8px_40px_rgba(0,0,0,0.4)] max-w-lg w-full overflow-hidden"
      >
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 h-56 flex flex-col items-center justify-center relative">
          <motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            alt="Avatar"
          />
          <h1 className="text-white text-3xl font-bold mt-4 tracking-wide">
            ChattyAI
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Your College Data Assistant
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-100 font-medium"
          >
            🎓 Ask about courses, admissions, events, and more — AI-powered
            chatbot for all your college queries.
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 120 }}
            className="w-20 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mx-auto my-6"
          />

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleStartChat}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-3 
            rounded-full font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-500 ease-in-out"
          >
            🚀 Start Chatting
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

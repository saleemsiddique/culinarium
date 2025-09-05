"use client";
import React from 'react';
import { motion } from 'framer-motion';

// Placeholder for ButtonPrimary and ButtonSecondary
// These components now use the CSS variables for consistent theming.
const ButtonPrimary = ({ route, description, className = '' }: { route: string; description: string; className?: string }) => (
  <motion.a
    href={route}
    className={`inline-block px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg
                bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)]
                hover:from-[var(--highlight-dark)] hover:to-[var(--highlight)]
                focus:outline-none focus:ring-4 focus:ring-[var(--highlight)] ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {description}
  </motion.a>
);

const ButtonSecondary = ({ route, description, className = '' }: { route: string; description: string; className?: string }) => (
  <motion.a
    href={route}
    className={`inline-block px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg
                border-2 border-[var(--text2)] text-[var(--text2)]
                hover:bg-[var(--text2)] hover:text-[var(--primary)]
                focus:outline-none focus:ring-4 focus:ring-[var(--text2)]/50 ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {description}
  </motion.a>
);


export default function HeroSection() {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline // Added for better mobile compatibility
      >
        {/* Ensure the video path is correct and accessible */}
        <source src="/test-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better text readability */}
      {/* Using a darker overlay for better contrast with the warm palette */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70 z-10"></div>

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative text-center z-20 text-[var(--text2)] px-4 py-8 md:py-12 rounded-3xl backdrop-blur-sm bg-[var(--foreground)]/20 shadow-2xl max-w-4xl mx-auto"
      >
        {/* Main Title */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="font-extrabold text-4xl md:text-7xl leading-tight mb-4"
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }} // Added text shadow for readability
        >
          BIENVENIDO A CULINARIUM
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          className="text-lg md:text-2xl font-light italic mb-8"
          style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }} // Added text shadow
        >
          Tu próxima receta, a un clic de distancia
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
          className="mt-8 space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row justify-center"
        >
          <ButtonPrimary route={"/auth/login"} description={"Empieza Ahora"} />
          <ButtonSecondary route={"#pricing"} description={"Ver Precios"} />
        </motion.div>
      </motion.div>
    </div>
  );
}

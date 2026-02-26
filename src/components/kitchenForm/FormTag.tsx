"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface FormTagProps {
  label: string;
  onRemove: (label: string) => void;
}

const FormTag: React.FC<FormTagProps> = ({ label, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="flex items-center bg-[var(--highlight)]/10 text-[var(--highlight)] text-sm font-medium pl-3 pr-1.5 py-1 rounded-full border border-[var(--highlight)]/30"
  >
    <span>{label}</span>
    <button
      type="button"
      onClick={() => onRemove(label)}
      className="ml-1.5 p-0.5 rounded-full hover:bg-[var(--highlight)]/20 transition-colors focus:outline-none"
      aria-label={`Remove ${label}`}
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);

export default FormTag;

import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-gold shadow-float"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Plus className="h-6 w-6 text-accent-foreground" />
    </motion.button>
  );
}

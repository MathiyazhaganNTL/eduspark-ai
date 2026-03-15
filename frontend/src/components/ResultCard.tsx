import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ResultCardProps {
  title: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  delay?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (d: number) => ({
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 100, delay: d },
  }),
};

export default function ResultCard({ title, label, icon: Icon, children, delay = 0 }: ResultCardProps) {
  return (
    <motion.div
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="p-6 bg-card border border-border rounded-3xl shadow-soft"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-sidebar-accent rounded-xl">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</h3>
      </div>
      <p className="text-xl font-display font-semibold text-foreground leading-tight">{title}</p>
      {children && <div className="mt-3 text-sm text-muted-foreground leading-relaxed">{children}</div>}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "mint" | "yellow" | "pink";
  delay?: number;
}

const colorMap = {
  blue: { bg: "bg-sidebar-accent", text: "text-primary", icon: "text-primary" },
  mint: { bg: "bg-success/10", text: "text-success", icon: "text-success" },
  yellow: { bg: "bg-warning/20", text: "text-warning-foreground", icon: "text-warning-foreground" },
  pink: { bg: "bg-accent/10", text: "text-accent", icon: "text-accent" },
};

export default function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, delay }}
      className="p-6 bg-card border border-border rounded-3xl shadow-soft"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
      <p className="text-5xl font-display font-bold tracking-tight tabular-nums text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-2">{title}</p>
    </motion.div>
  );
}

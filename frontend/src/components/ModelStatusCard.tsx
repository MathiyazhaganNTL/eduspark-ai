import { motion } from "framer-motion";

interface ModelStatusCardProps {
  name: string;
  status: string;
  delay?: number;
}

export default function ModelStatusCard({ name, status, delay = 0 }: ModelStatusCardProps) {
  const online = status.toLowerCase() === "available" || status.toLowerCase() === "online";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, delay }}
      className="p-5 bg-card border border-border rounded-3xl shadow-soft flex items-center justify-between"
    >
      <div>
        <h3 className="font-display font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">{status}</p>
      </div>
      <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
        online
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      }`}>
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full ${
            online ? "bg-success" : "bg-destructive"
          } ${online ? "animate-heartbeat" : ""}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            online ? "bg-success" : "bg-destructive"
          }`} />
        </span>
        {online ? "Online" : "Offline"}
      </div>
    </motion.div>
  );
}

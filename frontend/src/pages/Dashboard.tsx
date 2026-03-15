import { FileText, AlertTriangle, Sparkles, Cpu } from "lucide-react";
import StatCard from "@/components/StatCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

const trendData = [
  { day: "Mon", issues: 12 }, { day: "Tue", issues: 19 }, { day: "Wed", issues: 8 },
  { day: "Thu", issues: 15 }, { day: "Fri", issues: 22 }, { day: "Sat", issues: 6 }, { day: "Sun", issues: 10 },
];

const curriculumData = [
  { topic: "Counting", count: 34 }, { topic: "Reading", count: 28 },
  { topic: "Motor Skills", count: 22 }, { topic: "Social", count: 18 }, { topic: "Art", count: 15 },
];

const activityData = [
  { day: "Mon", obs: 5 }, { day: "Tue", obs: 8 }, { day: "Wed", obs: 3 },
  { day: "Thu", obs: 12 }, { day: "Fri", obs: 7 }, { day: "Sat", obs: 2 }, { day: "Sun", obs: 4 },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Good morning, Teacher! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your classroom today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Observations Processed" value={128} icon={FileText} color="blue" delay={0} />
        <StatCard title="Learning Issues Found" value={34} icon={AlertTriangle} color="pink" delay={0.05} />
        <StatCard title="Activities Generated" value={56} icon={Sparkles} color="mint" delay={0.1} />
        <StatCard title="Active AI Models" value={3} icon={Cpu} color="yellow" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-6 bg-card border border-border rounded-3xl shadow-soft">
          <h3 className="font-display font-semibold text-foreground mb-4">Learning Difficulty Trends</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(250, 40%, 55%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(250, 40%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220,20%,92%)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }} />
              <Area type="monotone" dataKey="issues" stroke="hsl(250, 40%, 55%)" strokeWidth={3} fill="url(#colorIssues)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-6 bg-card border border-border rounded-3xl shadow-soft">
          <h3 className="font-display font-semibold text-foreground mb-4">Common Curriculum Issues</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={curriculumData} barSize={32}>
              <XAxis dataKey="topic" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220,20%,92%)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }} />
              <Bar dataKey="count" fill="hsl(160, 45%, 50%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-6 bg-card border border-border rounded-3xl shadow-soft">
        <h3 className="font-display font-semibold text-foreground mb-4">Observation Activity Per Day</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="colorObs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(340, 50%, 55%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(340, 50%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220,20%,92%)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }} />
            <Area type="monotone" dataKey="obs" stroke="hsl(340, 50%, 55%)" strokeWidth={3} fill="url(#colorObs)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

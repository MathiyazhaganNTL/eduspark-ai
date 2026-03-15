import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const difficultyTrend = [
  { week: "W1", math: 8, literacy: 5, social: 3 },
  { week: "W2", math: 12, literacy: 7, social: 5 },
  { week: "W3", math: 6, literacy: 9, social: 4 },
  { week: "W4", math: 15, literacy: 6, social: 8 },
];

const topicDist = [
  { name: "Math", value: 35 },
  { name: "Literacy", value: 28 },
  { name: "Social", value: 18 },
  { name: "Motor Skills", value: 12 },
  { name: "Art", value: 7 },
];

const COLORS = ["hsl(250,40%,55%)", "hsl(160,45%,50%)", "hsl(340,50%,55%)", "hsl(45,90%,58%)", "hsl(220,15%,70%)"];

const activityFreq = [
  { name: "Number Line Hop", count: 18 },
  { name: "Letter Tracing", count: 14 },
  { name: "Building Challenge", count: 11 },
  { name: "Cutting Carnival", count: 9 },
  { name: "Color Mixing", count: 7 },
];

const submissions = [
  { day: "Mon", count: 5 }, { day: "Tue", count: 8 }, { day: "Wed", count: 3 },
  { day: "Thu", count: 12 }, { day: "Fri", count: 7 }, { day: "Sat", count: 2 }, { day: "Sun", count: 4 },
];

const tooltipStyle = { borderRadius: 12, border: "1px solid hsl(220,20%,92%)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" };

export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Visualize classroom insights at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-card border border-border rounded-3xl shadow-soft">
          <h3 className="font-display font-semibold text-foreground mb-4">Learning Difficulty Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={difficultyTrend}>
              <defs>
                <linearGradient id="gMath" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(250,40%,55%)" stopOpacity={0.15}/><stop offset="95%" stopColor="hsl(250,40%,55%)" stopOpacity={0}/></linearGradient>
                <linearGradient id="gLit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(160,45%,50%)" stopOpacity={0.15}/><stop offset="95%" stopColor="hsl(160,45%,50%)" stopOpacity={0}/></linearGradient>
                <linearGradient id="gSoc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(340,50%,55%)" stopOpacity={0.15}/><stop offset="95%" stopColor="hsl(340,50%,55%)" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215,15%,50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215,15%,50%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="math" stroke="hsl(250,40%,55%)" strokeWidth={2.5} fill="url(#gMath)" />
              <Area type="monotone" dataKey="literacy" stroke="hsl(160,45%,50%)" strokeWidth={2.5} fill="url(#gLit)" />
              <Area type="monotone" dataKey="social" stroke="hsl(340,50%,55%)" strokeWidth={2.5} fill="url(#gSoc)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="p-6 bg-card border border-border rounded-3xl shadow-soft">
          <h3 className="font-display font-semibold text-foreground mb-4">Curriculum Topic Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={topicDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {topicDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-6 bg-card border border-border rounded-3xl shadow-soft">
          <h3 className="font-display font-semibold text-foreground mb-4">Activity Recommendation Frequency</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activityFreq} barSize={28} layout="vertical">
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215,15%,50%)" }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 12, fill: "hsl(215,15%,50%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(250,40%,55%)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-6 bg-card border border-border rounded-3xl shadow-soft">
          <h3 className="font-display font-semibold text-foreground mb-4">Observation Submissions</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={submissions}>
              <defs>
                <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(160,45%,50%)" stopOpacity={0.15}/><stop offset="95%" stopColor="hsl(160,45%,50%)" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215,15%,50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215,15%,50%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="hsl(160,45%,50%)" strokeWidth={3} fill="url(#gSub)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

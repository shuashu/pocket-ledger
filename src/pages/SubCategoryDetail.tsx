import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { getSubCategories, getRecords, deleteRecord } from "@/lib/store";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { AddRecordDialog } from "@/components/AddRecordDialog";

type TimeFilter = "month" | "year" | "all";

function formatCurrency(val: number): string {
  const prefix = val < 0 ? "-" : "";
  return prefix + "¥" + Math.abs(val).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SubCategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [, setRefresh] = useState(0);

  const refresh = useCallback(() => setRefresh((n) => n + 1), []);

  const subCategory = getSubCategories().find((s) => s.id === id);
  const allRecords = getRecords().filter((r) => r.subCategoryId === id);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    return allRecords.filter((r) => {
      if (timeFilter === "all") return true;
      const d = new Date(r.date);
      if (timeFilter === "month") {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      return d.getFullYear() === now.getFullYear();
    });
  }, [allRecords, timeFilter]);

  // Build trend data
  const trendData = useMemo(() => {
    const sorted = [...allRecords].sort((a, b) => a.date.localeCompare(b.date));
    let balance = 0;
    const points: { date: string; balance: number }[] = [];
    for (const r of sorted) {
      balance += r.direction === "increase" ? r.amount : -r.amount;
      const existing = points.find((p) => p.date === r.date);
      if (existing) {
        existing.balance = balance;
      } else {
        points.push({ date: r.date, balance });
      }
    }
    return points;
  }, [allRecords]);

  const handleDelete = (recordId: string) => {
    deleteRecord(recordId);
    refresh();
  };

  if (!subCategory) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">分类不存在</p>
      </div>
    );
  }

  const filters: { key: TimeFilter; label: string }[] = [
    { key: "month", label: "月" },
    { key: "year", label: "年" },
    { key: "all", label: "全部" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-5 pb-6 pt-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/category/${subCategory.categoryType}`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground transition hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-primary-foreground">{subCategory.name}</h1>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-4">
        {/* Time filter tabs */}
        <div className="flex gap-2 rounded-xl bg-card p-1 shadow-card">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                timeFilter === f.key
                  ? "gradient-hero text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Trend chart */}
        {trendData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-4 shadow-card"
          >
            <p className="text-xs text-muted-foreground mb-3">余额趋势</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(220, 60%, 22%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(220, 60%, 22%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), "余额"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(220, 60%, 22%)"
                  strokeWidth={2}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Records list */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">历史记录</p>
          {filteredRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              暂无记录
            </div>
          )}
          <div className="space-y-2">
            {filteredRecords.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card"
              >
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                  <p className="text-sm text-card-foreground mt-0.5">
                    {r.note || (r.direction === "increase" ? "收入" : "支出")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-base font-semibold ${
                      r.direction === "increase" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {r.direction === "increase" ? "+" : "-"}
                    {r.amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <FloatingAddButton onClick={() => setDialogOpen(true)} />
      <AddRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultCategory={subCategory.categoryType}
        defaultSubCategory={subCategory.id}
        onSaved={refresh}
      />
    </div>
  );
}

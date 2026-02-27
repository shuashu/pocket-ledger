import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import {
  getTotalAssets,
  getCategoryBalance,
  exportData,
} from "@/lib/store";
import { CategoryType, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { AddRecordDialog } from "@/components/AddRecordDialog";

function formatCurrency(val: number): string {
  const prefix = val < 0 ? "-" : "";
  return prefix + "¥" + Math.abs(val).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const categoryOrder: CategoryType[] = ["liquid", "fixed", "investment", "liability"];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function Index() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, setRefresh] = useState(0);
  const navigate = useNavigate();

  const refresh = useCallback(() => setRefresh((n) => n + 1), []);

  const total = getTotalAssets();
  const liquidBal = getCategoryBalance("liquid");
  const fixedBal = getCategoryBalance("fixed");

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-5 pb-8 pt-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-primary-foreground">📱 资产总览</h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg bg-primary-foreground/10 px-3 py-1.5 text-xs text-primary-foreground backdrop-blur-sm transition hover:bg-primary-foreground/20"
          >
            <Upload className="h-3.5 w-3.5" />
            导出
          </button>
        </div>

        {/* Total card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur-sm"
        >
          <p className="text-xs text-primary-foreground/70 mb-1">总资产净值</p>
          <p className="text-3xl font-bold tracking-tight text-primary-foreground">
            {formatCurrency(total)}
          </p>
          <div className="mt-3 flex gap-4 text-xs text-primary-foreground/60">
            <span>流动 {formatCurrency(liquidBal)}</span>
            <span>固定 {formatCurrency(fixedBal)}</span>
          </div>
        </motion.div>
      </div>

      {/* Category Grid */}
      <div className="px-5 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          {categoryOrder.map((cat, i) => {
            const balance = getCategoryBalance(cat);
            return (
              <motion.button
                key={cat}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => navigate(`/category/${cat}`)}
                className="flex flex-col items-start rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-float active:scale-[0.97]"
              >
                <span className="text-2xl mb-2">{CATEGORY_ICONS[cat]}</span>
                <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
                <span className={`mt-1 text-lg font-semibold ${cat === "liability" && balance !== 0 ? "text-destructive" : "text-card-foreground"}`}>
                  {formatCurrency(cat === "liability" ? -Math.abs(balance) : balance)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <FloatingAddButton onClick={() => setDialogOpen(true)} />
      <AddRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />
    </div>
  );
}

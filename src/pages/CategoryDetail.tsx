import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { CategoryType, CATEGORY_LABELS } from "@/lib/types";
import { getSubCategories, getSubCategoryBalance } from "@/lib/store";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { AddRecordDialog } from "@/components/AddRecordDialog";

function formatCurrency(val: number): string {
  const prefix = val < 0 ? "-" : "";
  return prefix + "¥" + Math.abs(val).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CategoryDetail() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, setRefresh] = useState(0);

  const categoryType = type as CategoryType;
  const refresh = useCallback(() => setRefresh((n) => n + 1), []);
  const subCategories = getSubCategories().filter((s) => s.categoryType === categoryType);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-5 pb-6 pt-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground transition hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-primary-foreground">
            {CATEGORY_LABELS[categoryType] || "未知分类"}
          </h1>
        </div>
      </div>

      {/* Sub-category list */}
      <div className="px-5 -mt-3 space-y-3">
        {subCategories.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            暂无小分类，点击右下角按钮添加记录
          </div>
        )}
        {subCategories.map((sub, i) => {
          const balance = getSubCategoryBalance(sub.id);
          return (
            <motion.button
              key={sub.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(`/subcategory/${sub.id}`)}
              className="flex w-full items-center justify-between rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-float active:scale-[0.98]"
            >
              <span className="text-sm font-medium text-card-foreground">{sub.name}</span>
              <span className={`text-base font-semibold ${balance < 0 ? "text-destructive" : "text-card-foreground"}`}>
                {formatCurrency(balance)}
              </span>
            </motion.button>
          );
        })}
      </div>

      <FloatingAddButton onClick={() => setDialogOpen(true)} />
      <AddRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultCategory={categoryType}
        onSaved={refresh}
      />
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryType, CATEGORY_LABELS, AssetRecord } from "@/lib/types";
import { getSubCategories, addRecord } from "@/lib/store";

interface AddRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: CategoryType;
  defaultSubCategory?: string;
  onSaved: () => void;
}

export function AddRecordDialog({
  open,
  onOpenChange,
  defaultCategory,
  defaultSubCategory,
  onSaved,
}: AddRecordDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [categoryType, setCategoryType] = useState<CategoryType>(defaultCategory || "liquid");
  const [subCategoryId, setSubCategoryId] = useState(defaultSubCategory || "");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const subCategories = getSubCategories().filter((s) => s.categoryType === categoryType);

  const handleSave = () => {
    if (!subCategoryId || !amount || parseFloat(amount) <= 0) return;

    const record: AssetRecord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: format(date, "yyyy-MM-dd"),
      categoryType,
      subCategoryId,
      direction,
      amount: parseFloat(amount),
      note,
    };

    addRecord(record);
    onSaved();
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setDate(new Date());
    setCategoryType(defaultCategory || "liquid");
    setSubCategoryId(defaultSubCategory || "");
    setDirection("increase");
    setAmount("");
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] rounded-2xl border-border bg-card p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-card-foreground">新增记录</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "yyyy-MM-dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">大类</Label>
            <Select
              value={categoryType}
              onValueChange={(v) => {
                setCategoryType(v as CategoryType);
                setSubCategoryId("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as CategoryType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SubCategory */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">小类</Label>
            <Select value={subCategoryId} onValueChange={setSubCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择小类" />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Direction */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">方向</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setDirection("increase")}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
                  direction === "increase"
                    ? "bg-success text-success-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                + 增加
              </button>
              <button
                onClick={() => setDirection("decrease")}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
                  direction === "decrease"
                    ? "bg-destructive text-destructive-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                - 减少
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">金额</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">备注</Label>
            <Input
              placeholder="备注信息"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1 gradient-hero text-primary-foreground" onClick={handleSave}>
              保存
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

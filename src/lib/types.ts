export type CategoryType = "liquid" | "fixed" | "investment" | "liability";

export interface SubCategory {
  id: string;
  name: string;
  categoryType: CategoryType;
}

export interface AssetRecord {
  id: string;
  date: string; // YYYY-MM-DD
  categoryType: CategoryType;
  subCategoryId: string;
  direction: "increase" | "decrease";
  amount: number;
  note: string;
}

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  liquid: "流动资金",
  fixed: "固定资产",
  investment: "投资",
  liability: "负债",
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  liquid: "💰",
  fixed: "🏠",
  investment: "📈",
  liability: "💳",
};

export const DEFAULT_SUB_CATEGORIES: SubCategory[] = [
  { id: "cash", name: "现金", categoryType: "liquid" },
  { id: "bank", name: "银行存款", categoryType: "liquid" },
  { id: "provident", name: "公积金", categoryType: "liquid" },
  { id: "alipay", name: "支付宝", categoryType: "liquid" },
  { id: "wechat", name: "微信", categoryType: "liquid" },
  { id: "house", name: "房产", categoryType: "fixed" },
  { id: "car", name: "车辆", categoryType: "fixed" },
  { id: "electronics", name: "电子设备", categoryType: "fixed" },
  { id: "stock", name: "股票", categoryType: "investment" },
  { id: "fund", name: "基金", categoryType: "investment" },
  { id: "crypto", name: "数字货币", categoryType: "investment" },
  { id: "mortgage", name: "房贷", categoryType: "liability" },
  { id: "carloan", name: "车贷", categoryType: "liability" },
  { id: "creditcard", name: "信用卡", categoryType: "liability" },
];

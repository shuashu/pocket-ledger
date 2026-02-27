import { AssetRecord, SubCategory, DEFAULT_SUB_CATEGORIES, CategoryType } from "./types";

const RECORDS_KEY = "asset_records";
const SUBCATEGORIES_KEY = "asset_subcategories";

export function getSubCategories(): SubCategory[] {
  const raw = localStorage.getItem(SUBCATEGORIES_KEY);
  if (!raw) {
    localStorage.setItem(SUBCATEGORIES_KEY, JSON.stringify(DEFAULT_SUB_CATEGORIES));
    return DEFAULT_SUB_CATEGORIES;
  }
  return JSON.parse(raw);
}

export function saveSubCategories(subs: SubCategory[]) {
  localStorage.setItem(SUBCATEGORIES_KEY, JSON.stringify(subs));
}

export function addSubCategory(sub: SubCategory) {
  const subs = getSubCategories();
  subs.push(sub);
  saveSubCategories(subs);
}

export function getRecords(): AssetRecord[] {
  const raw = localStorage.getItem(RECORDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveRecords(records: AssetRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function addRecord(record: AssetRecord) {
  const records = getRecords();
  records.push(record);
  records.sort((a, b) => b.date.localeCompare(a.date));
  saveRecords(records);
}

export function deleteRecord(id: string) {
  const records = getRecords().filter((r) => r.id !== id);
  saveRecords(records);
}

export function getSubCategoryBalance(subCategoryId: string): number {
  const records = getRecords().filter((r) => r.subCategoryId === subCategoryId);
  return records.reduce((sum, r) => {
    return sum + (r.direction === "increase" ? r.amount : -r.amount);
  }, 0);
}

export function getCategoryBalance(categoryType: CategoryType): number {
  const subs = getSubCategories().filter((s) => s.categoryType === categoryType);
  return subs.reduce((sum, sub) => sum + getSubCategoryBalance(sub.id), 0);
}

export function getTotalAssets(): number {
  const liquid = getCategoryBalance("liquid");
  const fixed = getCategoryBalance("fixed");
  const investment = getCategoryBalance("investment");
  const liability = getCategoryBalance("liability");
  return liquid + fixed + investment - Math.abs(liability);
}

export function exportData(): string {
  const records = getRecords();
  const subs = getSubCategories();
  return JSON.stringify({ records, subCategories: subs }, null, 2);
}

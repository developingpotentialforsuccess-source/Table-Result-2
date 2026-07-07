import { Category } from "../types";

export const isMidtermCategory = (cat: Category | string) => {
  if (typeof cat === 'string') {
    const n = cat.toUpperCase();
    return n.includes("MID-TERM") || n.includes("MID TERM") || n.includes("MIDTERM") || n.includes("MID EXAM") || n.includes("MID TEST");
  }
  
  if (cat.isMidterm) return true;
  
  // Implicit rule: If it has midtermWeight, but no finalWeight and no full term weight, it's a dedicated midterm category
  if ((cat.midtermWeight && cat.midtermWeight > 0) && (!cat.finalWeight || cat.finalWeight === 0) && (!cat.weight || cat.weight === 0)) {
    return true;
  }

  const n = cat.name.toUpperCase();
  return n.includes("MID-TERM") || n.includes("MID TERM") || n.includes("MIDTERM") || n.includes("MID EXAM") || n.includes("MID TEST");
};

export const isFinalCategory = (cat: Category | string) => {
  if (typeof cat === 'string') {
    const n = cat.toUpperCase();
    return n.includes("FINAL");
  }
  
  if (cat.isFinal) return true;
  
  // Implicit rule
  if ((cat.finalWeight && cat.finalWeight > 0) && (!cat.midtermWeight || cat.midtermWeight === 0) && (!cat.weight || cat.weight === 0)) {
    return true;
  }

  const n = cat.name.toUpperCase();
  return n.includes("FINAL");
};

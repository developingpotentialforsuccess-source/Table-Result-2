import React, { useMemo, useState } from "react";
import {
  Level,
  Student,
  calculateGrade,
  calculateStatus,
  getSubjectWeight,
  PAPER_STYLES,
  TeacherSettings,
  MANUAL_COLORS,
} from "../types";
import { isMidtermCategory, isFinalCategory } from "../lib/categoryUtils";
import { calculateAttendancePercentage } from "../lib/attendanceUtils";
import { Trash2, ArrowUpDown, EyeOff, Eye, SlidersHorizontal, ClipboardPaste, Wand2, Search, X, ChevronDown, ChevronUp, BarChart3, Award, CheckCircle2, AlertTriangle, BookOpen, Calendar, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const TrendLine = ({ data }: { data: number[] }) => {
  const validData = data.filter(d => d !== undefined && !isNaN(d));
  if (validData.length < 2) return null;
  const w = 40;
  const h = 14;
  const pts = validData.map((d, i) => {
    const x = (i / (validData.length - 1)) * w;
    const y = h - (d / 100) * h;
    return `${x},${y}`;
  }).join(' ');

  const isUp = validData[validData.length - 1] >= validData[0];
  const color = isUp ? "text-blue-500" : "text-orange-500";

  return (
    <div className="flex-shrink-0 flex items-center justify-center px-1" title="Performance trend across categories">
      <svg width={w} height={h} className={`overflow-visible opacity-70 hover:opacity-100 transition-opacity ${color}`}>
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

interface Props {
  level: Level;
  onUpdateLevel?: (level: Level) => void;
  students: Student[];
  searchQuery?: string;
  onUpdateStudent: (
    id: string,
    categoryId: string,
    itemIndex: number,
    value: any,
  ) => void;
  onUpdateStudentField: (id: string, field: string, value: any) => void;
  onBulkUpdateStudentScores?: (updates: { id: string; categoryId: string; itemIndex: number; value: any }[]) => void;
  onDeleteStudent: (id: string) => void;
  resultMode: "full" | "midterm" | "final";
  paperStyle?: string;
  gridLineLevel?: string;
  settings?: TeacherSettings;
}



const getColorByIndex = (index: number, density: 'light' | 'medium' | 'dark' = 'medium') => {
  const opacities = {
    light: { bg: '20', avg: '40' },
    medium: { bg: '40', avg: '60' },
    dark: { bg: '70', avg: '90' }
  };
  const op = opacities[density];

  const colors = [
    { bg: `bg-blue-50/${op.bg}`, border: "border-blue-100", text: "text-blue-900", avgBg: `bg-blue-100/${op.avg}` },
    { bg: `bg-emerald-50/${op.bg}`, border: "border-emerald-100", text: "text-emerald-900", avgBg: `bg-emerald-100/${op.avg}` },
    { bg: `bg-amber-50/${op.bg}`, border: "border-amber-100", text: "text-amber-900", avgBg: `bg-amber-100/${op.avg}` },
    { bg: `bg-purple-50/${op.bg}`, border: "border-purple-100", text: "text-purple-900", avgBg: `bg-purple-100/${op.avg}` },
    { bg: `bg-rose-50/${op.bg}`, border: "border-rose-100", text: "text-rose-900", avgBg: `bg-rose-100/${op.avg}` },
    { bg: `bg-cyan-50/${op.bg}`, border: "border-cyan-100", text: "text-cyan-900", avgBg: `bg-cyan-100/${op.avg}` },
    { bg: `bg-indigo-50/${op.bg}`, border: "border-indigo-100", text: "text-indigo-900", avgBg: `bg-indigo-100/${op.avg}` },
    { bg: `bg-teal-50/${op.bg}`, border: "border-teal-100", text: "text-teal-900", avgBg: `bg-teal-100/${op.avg}` },
    { bg: `bg-orange-50/${op.bg}`, border: "border-orange-100", text: "text-orange-900", avgBg: `bg-orange-100/${op.avg}` },
    { bg: `bg-fuchsia-50/${op.bg}`, border: "border-fuchsia-100", text: "text-fuchsia-900", avgBg: `bg-fuchsia-100/${op.avg}` },
  ];
  return colors[index % colors.length];
};

const COMMON_CATEGORY_COLORS: Record<string, number> = {
  "quizzes": 0,             // Blue
  "quiz": 0,
  "homework": 1,            // Emerald
  "hw": 1,
  "assignment": 2,          // Amber (Yellow-ish)
  "class participation": 3, // Purple
  "participation": 3,
  "attendance": 4,          // Rose
  "project": 5,             // Cyan
  "presentation": 5,
  "midterm": 6,             // Indigo
  "mid exam": 6,
  "mid-term": 6,
  "final": 7,               // Teal
  "final exam": 7,
  "speaking": 8,            // Orange
  "vocabulary": 9,          // Fuchsia
};

const getCategoryColorIndex = (name: string): number => {
  const normalized = name.toLowerCase().trim();
  
  if (normalized === "hidden") {
    return 10;
  }

  // Check direct matches
  if (COMMON_CATEGORY_COLORS[normalized] !== undefined) {
    return COMMON_CATEGORY_COLORS[normalized];
  }
  
  // Check substring matches
  for (const [key, value] of Object.entries(COMMON_CATEGORY_COLORS)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  // Fallback to hashing
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getTheme = (
  subjectIndex: number, 
  categoryName: string, 
  settings?: TeacherSettings
) => {
  const density = settings?.colorDensity || 'medium';
  if (settings?.colorMode === 'monochrome') {
    // Distinct shades of slate/gray for monochrome
    const shades = [
      { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-900", avgBg: "bg-slate-100" },
      { bg: "bg-white", border: "border-slate-100", text: "text-slate-800", avgBg: "bg-slate-50" },
    ];
    return shades[subjectIndex % 2];
  }
  if (settings?.colorMode === 'category' || !settings?.colorMode) {
    const colorIndex = getCategoryColorIndex(categoryName);
    return getColorByIndex(colorIndex, density);
  }
  // Default: subject mode
  return getColorByIndex(subjectIndex, density);
};

const getScoreColorClass = (settings?: TeacherSettings) => {
  const color = settings?.scoreColor || 'black';
  switch (color) {
    case 'red': return 'text-red-600';
    case 'blue': return 'text-blue-600';
    case 'green': return 'text-green-600';
    case 'purple': return 'text-purple-600';
    case 'black':
    default:
      return 'text-slate-900';
  }
};

export default function GradeTable({
  level,
  onUpdateLevel,
  students,
  searchQuery = "",
  onUpdateStudent,
  onUpdateStudentField,
  onBulkUpdateStudentScores,
  onDeleteStudent,
  resultMode,
  paperStyle,
  gridLineLevel = "medium",
  settings,
}: Props) {
  const headerStyleClass = useMemo(() => {
    let classes = "text-center transition-colors ";
    if (settings?.headerWeight === 'bold') classes += "font-bold ";
    else classes += "font-medium ";
    if (settings?.headerItalic) classes += "italic ";
    if (settings?.headerUppercase) classes += "uppercase ";
    return classes;
  }, [settings]);

  const currentPaper = useMemo(() => {
    return PAPER_STYLES.find((p) => p.id === paperStyle) || PAPER_STYLES[0];
  }, [paperStyle]);

  const op = useMemo(() => {
    const opacities = {
      light: { bg: '20', avg: '40', special: '10' },
      medium: { bg: '40', avg: '60', special: '30' },
      dark: { bg: '70', avg: '90', special: '60' }
    };
    return opacities[settings?.colorDensity || 'medium'];
  }, [settings?.colorDensity]);

  const getManualStyle = (
    mode: 'avg' | 'result',
    fallbackTextClass: string,
    fallbackBgClass: string
  ) => {
    if (mode === 'avg') {
      if (settings?.avgColorMode === 'manual') {
        const textCls = settings.avgTextColor ? (MANUAL_COLORS.find(c => c.id === settings.avgTextColor || c.textClass === settings.avgTextColor)?.textClass || settings.avgTextColor) : 'text-slate-900';
        const bgCls = settings.avgBgColor ? (MANUAL_COLORS.find(c => c.id === settings.avgBgColor || c.bgClass === settings.avgBgColor)?.bgClass || settings.avgBgColor) : 'bg-white';
        const borderCls = settings.avgBgColor ? (MANUAL_COLORS.find(c => c.id === settings.avgBgColor || c.bgClass === settings.avgBgColor)?.borderClass || 'border-slate-300') : gridStyles.totalBorderClass;
        return { textClass: textCls, bgClass: bgCls, borderClass: borderCls };
      }
    } else if (mode === 'result') {
      if (settings?.resultColorMode === 'manual') {
        const textCls = settings.resultTextColor ? (MANUAL_COLORS.find(c => c.id === settings.resultTextColor || c.textClass === settings.resultTextColor)?.textClass || settings.resultTextColor) : 'text-slate-900';
        const bgCls = settings.resultBgColor ? (MANUAL_COLORS.find(c => c.id === settings.resultBgColor || c.bgClass === settings.resultBgColor)?.bgClass || settings.resultBgColor) : 'bg-white';
        const borderCls = settings.resultBgColor ? (MANUAL_COLORS.find(c => c.id === settings.resultBgColor || c.bgClass === settings.resultBgColor)?.borderClass || 'border-slate-300') : gridStyles.bodyBorderClass;
        return { textClass: textCls, bgClass: bgCls, borderClass: borderCls };
      }
    }
    return { 
      textClass: fallbackTextClass, 
      bgClass: fallbackBgClass, 
      borderClass: mode === 'avg' ? gridStyles.totalBorderClass : gridStyles.bodyBorderClass 
    };
  };

  const gridStyles = useMemo(() => {
    switch (gridLineLevel) {
      case "light":
        return {
          headerBorderClass: "border-slate-200/60",
          bodyBorderClass: "border-slate-100",
          totalBorderClass: "border-blue-100/40",
          shadowHeader: "shadow-[1px_0_0_0_rgba(226,232,240,0.6)]",
          shadowBody: "shadow-[1px_0_0_0_rgba(241,245,249,0.8)]",
          inputBorderClass: "hover:border-slate-200/50 focus:border-blue-500",
        };
      case "bold":
        return {
          headerBorderClass: "border-slate-400 font-bold",
          bodyBorderClass: "border-slate-400",
          totalBorderClass: "border-blue-400",
          shadowHeader: "shadow-[1.5px_0_0_0_#94a3b8]",
          shadowBody: "shadow-[1.5px_0_0_0_#94a3b8]",
          inputBorderClass: "hover:border-slate-400 focus:border-slate-500",
        };
      case "black":
        return {
          headerBorderClass: "border-slate-900 border-[1.5px] font-extrabold",
          bodyBorderClass: "border-slate-900 border-[1.25px]",
          totalBorderClass: "border-slate-950 border-[1.25px]",
          shadowHeader: "shadow-[2px_0_0_0_#090d16]",
          shadowBody: "shadow-[2px_0_0_0_#090d16]",
          inputBorderClass: "hover:border-slate-900 focus:border-slate-900",
        };
      case "medium":
      default:
        return {
          headerBorderClass: "border-slate-400",
          bodyBorderClass: "border-slate-400",
          totalBorderClass: "border-slate-500",
          shadowHeader: "shadow-[1px_0_0_0_#94a3b8]",
          shadowBody: "shadow-[1px_0_0_0_#cbd5e1]",
          inputBorderClass: "hover:border-slate-400 focus:border-blue-500",
        };
    }
  }, [gridLineLevel]);

  const [hiddenSubjects, setHiddenSubjects] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [expandedStudentIds, setExpandedStudentIds] = useState<string[]>([]);

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const toggleSubject = (subjectId: string) => {
    setHiddenSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const toggleCategory = (categoryId: string) => {
    setHiddenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const [activeSubjectMenu, setActiveSubjectMenu] = useState<string | null>(null);

  React.useEffect(() => {
    const handleDocumentClick = () => {
      setActiveSubjectMenu(null);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleGridKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIdentifier: string | number
  ) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) return;

    const input = e.currentTarget;
    const isText = input.type === "text";
    if (e.key === "ArrowLeft" && isText && input.selectionStart !== null && input.selectionStart > 0) {
      return; // Allow caret to move left inside text
    }
    if (e.key === "ArrowRight" && isText && input.selectionEnd !== null && input.selectionEnd < input.value.length) {
      return; // Allow caret to move right inside text
    }

    e.preventDefault();

    let nextRow = rowIndex;
    let nextCol = colIdentifier;

    const columns: (string | number)[] = ["name"];
    
    const hasEditableAttendance = resultMode === 'full' && settings?.showAttendance === false;
    if (hasEditableAttendance) {
      columns.push("attendance");
    }

    itemCols.forEach((ic, idx) => {
      const isExamInput = ic.categoryId.startsWith('exam_') && resultMode !== 'full';
      const isRegularInput = !ic.isHidden && !ic.isAvg && !ic.categoryId.startsWith('exam_');
      if (isExamInput || isRegularInput) {
        columns.push(idx);
      }
    });

    const colIdx = columns.indexOf(colIdentifier);

    if (e.key === "ArrowUp") {
      nextRow = rowIndex - 1;
    } else if (e.key === "ArrowDown" || e.key === "Enter") {
      nextRow = rowIndex + 1;
    } else if (e.key === "ArrowLeft") {
      if (colIdx > 0) {
        nextCol = columns[colIdx - 1];
      }
    } else if (e.key === "ArrowRight") {
      if (colIdx < columns.length - 1) {
        nextCol = columns[colIdx + 1];
      }
    }

    const targetId = `grid-input-${nextRow}-${nextCol}`;
    const targetEl = document.getElementById(targetId) as HTMLInputElement | null;
    if (targetEl) {
      targetEl.focus();
      if (targetEl.select) {
        targetEl.select();
      }
    }
  };

  const toggleAllCategoriesOfSubject = (subjectId: string) => {
    const subject = level.subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    const activeCategories = subject.categories.filter((c) => {
      const isFinal = c.name.toLowerCase().includes("final");
      const isMidterm = c.name.toLowerCase().includes("mid");
      if (resultMode === "midterm") return !isFinal;
      if (resultMode === "final") return !isMidterm;
      return true;
    });
    const categoryIds = activeCategories.map((c) => c.id);
    const allHidden = categoryIds.every((id) => hiddenCategories.includes(id));

    if (allHidden) {
      setHiddenCategories((prev) => prev.filter((id) => !categoryIds.includes(id)));
    } else {
      setHiddenCategories((prev) => {
        const next = [...prev];
        categoryIds.forEach((id) => {
          if (!next.includes(id)) {
            next.push(id);
          }
        });
        return next;
      });
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const subjectCols: {
    subject: any;
    colSpan: number;
    isHidden?: boolean;
    index: number;
    theme?: any;
    subjectWeight?: number;
    subjectWeightMidterm?: number;
    subjectWeightFinal?: number;
  }[] = [];
  const categoryCols: {
    category: any;
    colSpan: number;
    subjectId: string;
    isHidden?: boolean;
    isHiddenSubject?: boolean;
    subjectIndex: number;
    theme?: any;
  }[] = [];
  const itemCols: {
    categoryId: string;
    subjectId: string;
    itemIndex: number;
    label: string;
    maxScore: number;
    isAvg?: boolean;
    isHidden?: boolean;
    isHiddenSubject?: boolean;
    subjectIndex: number;
    theme?: any;
    subjectWeight?: number;
    subjectWeightMidterm?: number;
    subjectWeightFinal?: number;
    categoryWeight?: number;
  }[] = [];

  level.subjects.forEach((subject, subjectIndex) => {
    const isHidden = hiddenSubjects.includes(subject.id);
    let subjectSpan = 0;

    if (isHidden) {
      subjectCols.push({
        subject,
        colSpan: 1,
        isHidden: true,
        index: subjectIndex,
      });
      categoryCols.push({
        category: { id: `hidden_cat_${subject.id}`, name: "Hidden" },
        colSpan: 1,
        subjectId: subject.id,
        isHidden: true,
        isHiddenSubject: true,
        subjectIndex,
        theme: getTheme(subjectIndex, "Hidden", settings),
      });
      itemCols.push({
        categoryId: `hidden_cat_${subject.id}`,
        subjectId: subject.id,
        itemIndex: -2,
        label: "-",
        maxScore: 0,
        isHidden: true,
        isHiddenSubject: true,
        subjectIndex,
        theme: getTheme(subjectIndex, "Hidden", settings),
      });
    } else {
      // Normal flow: show categories and exams based on mode
      const visibleCategoriesForSubject = subject.categories.filter((category) => {
        if (resultMode === 'full') {
          if ((category.weight || 0) === 0 && ((category.midtermWeight && category.midtermWeight > 0) || (category.finalWeight && category.finalWeight > 0))) {
            return false;
          }
          return true;
        } else if (resultMode === 'midterm') {
          if (isMidtermCategory(category)) {
            const hasOtherMidtermCats = subject.categories.some(c => !isMidtermCategory(c) && c.midtermWeight !== undefined && c.midtermWeight > 0);
            if (hasOtherMidtermCats) return false;
          }
          return (category.midtermWeight !== undefined && category.midtermWeight > 0);
        } else if (resultMode === 'final') {
          if (isFinalCategory(category)) {
            const hasOtherFinalCats = subject.categories.some(c => !isFinalCategory(c) && c.finalWeight !== undefined && c.finalWeight > 0);
            if (hasOtherFinalCats) return false;
          }
          return (category.finalWeight !== undefined && category.finalWeight > 0);
        }
        return true;
      });

      if (visibleCategoriesForSubject.length > 0) {
        visibleCategoriesForSubject.forEach((category) => {
          const isMid = isMidtermCategory(category);
          const isFin = isFinalCategory(category);
          const theme = getTheme(subjectIndex, category.name, settings);
          const isCatHidden = hiddenCategories.includes(category.id);
          
          let catSpan = 0;

          const isExamInFullMode = resultMode === 'full' && (isMid || isFin);
          const effectiveShowAvg = isExamInFullMode ? (settings.showExamAvgColumnsFullMode !== false) : settings.showAvgColumns;
          const effectiveShowWtd = isExamInFullMode ? (settings.showExamWtdColumnsFullMode !== false) : settings.showWtdColumns;

          if (isCatHidden) {
            const keepAvg = settings?.keepAvgOnHide && effectiveShowAvg && (category.itemCount > 1 || isExamInFullMode);
            const keepWtd = settings?.keepWtdOnHide && effectiveShowWtd;

            if (keepAvg) {
              itemCols.push({
                categoryId: category.id,
                subjectId: subject.id,
                itemIndex: -1,
                label: "Average",
                maxScore: 100,
                isAvg: true,
                subjectIndex,
                theme,
                isHidden: false,
              });
              catSpan++;
            }

            if (keepWtd) {
              itemCols.push({
                categoryId: category.id,
                subjectId: subject.id,
                itemIndex: -5,
                label: "WTD",
                maxScore: 100,
                isAvg: true,
                subjectIndex,
                theme,
                isHidden: false,
              });
              catSpan++;
            }

            if (catSpan === 0) {
              if (settings?.completelyHideHiddenCategories) {
                // Do not push the hidden placeholder, catSpan remains 0
              } else {
                itemCols.push({
                  categoryId: category.id,
                  subjectId: subject.id,
                  itemIndex: -4,
                  label: "Hidden",
                  maxScore: 0,
                  subjectIndex,
                  theme,
                  isHidden: true,
                });
                catSpan = 1;
              }
            }
          } else {
            if (settings.showScoreColumns) {
              for (let i = 0; i < category.itemCount; i++) {
                let cleanLabel = category.itemNames?.[i] || (category.itemCount === 1 ? (resultMode === 'full' ? "Raw" : category.name) : `Item ${i+1}`);
                
                if (resultMode === 'midterm') {
                  cleanLabel = cleanLabel.replace(/^midterm:?\s*/i, '');
                } else if (resultMode === 'final') {
                  cleanLabel = cleanLabel.replace(/^final:?\s*/i, '');
                }

                itemCols.push({
                  categoryId: category.id,
                  subjectId: subject.id,
                  itemIndex: i,
                  label: cleanLabel,
                  maxScore: category.itemMaxScores?.[i] ?? 100,
                  subjectIndex,
                  theme,
                  isHidden: false,
                  categoryWeight: category.weight,
                });
                catSpan++;
              }
            }
            
            if (effectiveShowAvg && (category.itemCount > 1 || isExamInFullMode)) {
              itemCols.push({
                categoryId: category.id,
                subjectId: subject.id,
                itemIndex: -1,
                label: "Average",
                maxScore: 100,
                isAvg: true,
                subjectIndex,
                theme,
                isHidden: false,
              });
              catSpan++;
            }

            if (effectiveShowWtd) {
              itemCols.push({
                categoryId: category.id,
                subjectId: subject.id,
                itemIndex: -5,
                label: "WTD",
                maxScore: 100,
                isAvg: true,
                subjectIndex,
                theme,
                isHidden: false,
              });
              catSpan++;
            }

            if (catSpan === 0) {
              itemCols.push({
                categoryId: category.id,
                subjectId: subject.id,
                itemIndex: -5,
                label: "WTD",
                maxScore: 100,
                isAvg: true,
                subjectIndex,
                theme,
                isHidden: false,
              });
              catSpan = 1;
            }
          }

          if (catSpan > 0) {
            categoryCols.push({
              category,
              colSpan: catSpan,
              subjectId: subject.id,
              subjectIndex,
              theme,
              isHidden: isCatHidden,
            });
            subjectSpan += catSpan;
          }
        });
      }

      // Auto Exam Columns logic removed as requested by user
      const hasMidtermCat = subject.categories.some(c => isMidtermCategory(c));
      const hasFinalCat = subject.categories.some(c => isFinalCategory(c));

      if (resultMode === 'full') {
        const combinedTheme = getTheme(subjectIndex, "Combined", settings);
        const displayMode = settings?.resultDisplayMode ?? 'both';
        const colSpan = displayMode === 'both' ? 2 : 1;

        categoryCols.push({
          category: { id: `combined_cat_${subject.id}`, name: "RESULT", weight: 100 },
          colSpan: colSpan,
          subjectId: subject.id,
          subjectIndex,
          theme: combinedTheme,
        });

        if (displayMode === 'avg' || displayMode === 'both') {
          itemCols.push({
            categoryId: `combined_avg_${subject.id}`,
            subjectId: subject.id,
            itemIndex: -98,
            label: "Average",
            maxScore: 100,
            isAvg: true,
            subjectIndex,
            theme: combinedTheme,
          });
        }

        if (displayMode === 'wtd' || displayMode === 'both') {
          itemCols.push({
            categoryId: `combined_${subject.id}`,
            subjectId: subject.id,
            itemIndex: -99,
            label: `${subject.targetWeight ?? 100}%`,
            maxScore: 100,
            isAvg: true,
            subjectIndex,
            theme: combinedTheme,
            subjectWeight: subject.targetWeight ?? 100,
          });
        }

        subjectSpan += colSpan;
      }

      if (subjectSpan > 0) {
        subjectCols.push({
          subject,
          colSpan: subjectSpan,
          index: subjectIndex,
          theme: getTheme(subjectIndex, "Subject", settings),
          subjectWeight: subject.targetWeight,
          subjectWeightMidterm: subject.fullModeMidtermWeight,
          subjectWeightFinal: subject.fullModeFinalWeight,
        });
      }
    }
  });

  const handleUpdateMaxScore = (
    subjectId: string,
    categoryId: string,
    itemIndex: number,
    newMax: number,
  ) => {
    if (!onUpdateLevel) return;
    const newSubjects = level.subjects.map((s) => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        categories: s.categories.map((c) => {
          if (c.id !== categoryId) return c;
          const newMaxScores = [
            ...(c.itemMaxScores || Array(c.itemCount).fill(100)),
          ];
          newMaxScores[itemIndex] = newMax;
          return { ...c, itemMaxScores: newMaxScores };
        }),
      };
    });
    onUpdateLevel({ ...level, subjects: newSubjects });
  };

  const handleUpdateItemName = (
    subjectId: string,
    categoryId: string,
    itemIndex: number,
    newName: string,
  ) => {
    if (!onUpdateLevel) return;
    const newSubjects = level.subjects.map((s) => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        categories: s.categories.map((c) => {
          if (c.id !== categoryId) return c;
          const newItemNames = [
            ...(c.itemNames || Array(c.itemCount).fill("")),
          ];
          newItemNames[itemIndex] = newName;
          return { ...c, itemNames: newItemNames };
        }),
      };
    });
    onUpdateLevel({ ...level, subjects: newSubjects });
  };

  // Pre-calculate final scores and ranks
  const studentMetrics = useMemo(() => {


    const scores = students.map((student) => {
      const categoryAvgs: Record<string, number> = {};
      const subjectScores: Record<string, number> = {};
      let totalWeightedSum = 0;
      let totalWeightSum = 0;

      level.subjects.forEach((subject) => {
        const calculateModePct = (mode: 'midterm' | 'final' | 'full') => {
          let points = 0;
          let weight = 0;
          let hasAnyScore = false;

          subject.categories.forEach(cat => {
            if (mode === 'midterm' && (cat.midtermWeight === undefined || cat.midtermWeight <= 0)) return;
            if (mode === 'final' && (cat.finalWeight === undefined || cat.finalWeight <= 0)) return;

            let catEarned = 0;
            let catMax = 0;
            let hasCatScore = false;
            for (let i = 0; i < cat.itemCount; i++) {
              const s = student.scores[`${cat.id}_${i}`];
              if (typeof s === 'number') {
                catEarned += s;
                catMax += (cat.itemMaxScores?.[i] || 100);
                hasCatScore = true;
                hasAnyScore = true;
              } else if (settings?.treatBlanksAsZero) {
                catEarned += 0;
                catMax += (cat.itemMaxScores?.[i] || 100);
                hasCatScore = true;
              }
            }
            const catPct = catMax > 0 ? (catEarned / catMax) * 100 : 0;
            
            const activeWeight = mode === 'midterm'
              ? (cat.midtermWeight || 0)
              : mode === 'final'
                ? (cat.finalWeight || 0)
                : cat.weight;

            if (resultMode === 'full' || mode === resultMode) {
              categoryAvgs[cat.id] = catPct;
              categoryAvgs[`${cat.id}_weighted`] = (catPct / 100) * activeWeight;
            }

            if (hasCatScore) {
              points += (catPct / 100) * activeWeight;
              weight += activeWeight;
            }
          });
          
          if (!hasAnyScore) return 0;
          return weight > 0 ? (points / weight) * 100 : 0;
        };

        let subjectPercentage = 0;
        let hasSubjectScore = false;

        const midKey = `exam_midterm_${subject.id}_-1`;
        const finalKey = `exam_final_${subject.id}_-1`;

        let midResult = calculateModePct('midterm');
        let hasMidScore = false;
        const midScore = student.scores[midKey];
        if (typeof midScore === 'number') {
          const midMax = subject.midtermMaxScore || 100;
          midResult = (midScore / midMax) * 100;
          hasMidScore = true;
        }

        let finalResult = calculateModePct('final');
        let hasFinalScore = false;
        const finalScore = student.scores[finalKey];
        if (typeof finalScore === 'number') {
          const finalMax = subject.finalMaxScore || 100;
          finalResult = (finalScore / finalMax) * 100;
          hasFinalScore = true;
        }

        const midWeight = subject.fullModeMidtermWeight ?? 30;
        const finalWeight = subject.fullModeFinalWeight ?? 70;

        if (resultMode === 'midterm') {
          subjectPercentage = midResult;
          hasSubjectScore = hasMidScore || subject.categories.some(cat => {
            if (cat.midtermWeight === undefined || cat.midtermWeight <= 0) return false;
            for (let i = 0; i < cat.itemCount; i++) {
              if (typeof student.scores[`${cat.id}_${i}`] === 'number') return true;
            }
            return false;
          });
        } else if (resultMode === 'final') {
          subjectPercentage = finalResult;
          hasSubjectScore = hasFinalScore || subject.categories.some(cat => {
            if (cat.finalWeight === undefined || cat.finalWeight <= 0) return false;
            for (let i = 0; i < cat.itemCount; i++) {
              if (typeof student.scores[`${cat.id}_${i}`] === 'number') return true;
            }
            return false;
          });
        } else {
          subjectPercentage = (midResult * (midWeight / 100)) + (finalResult * (finalWeight / 100));
          hasSubjectScore = hasMidScore || hasFinalScore || subject.categories.some(cat => {
            for (let i = 0; i < cat.itemCount; i++) {
              if (typeof student.scores[`${cat.id}_${i}`] === 'number') return true;
            }
            return false;
          });
        }

        // Store computed values in subjectScores (without mutating student.scores)
        subjectScores[`exam_midterm_computed_${subject.id}`] = (midResult / 100) * (subject.midtermMaxScore || 100);
        subjectScores[`exam_final_computed_${subject.id}`] = (finalResult / 100) * (subject.finalMaxScore || 100);
        subjectScores[`exam_midterm_is_manual_${subject.id}`] = hasMidScore ? 1 : 0;
        subjectScores[`exam_final_is_manual_${subject.id}`] = hasFinalScore ? 1 : 0;

        // If the subject has matching categories for midterm/final, update their averages to the resolved mid/final results
        if (resultMode === 'full') {
          subject.categories.forEach(cat => {
            if (isMidtermCategory(cat)) {
              categoryAvgs[cat.id] = midResult;
              categoryAvgs[`${cat.id}_weighted`] = (midResult / 100) * cat.weight;
            } else if (isFinalCategory(cat)) {
              categoryAvgs[cat.id] = finalResult;
              categoryAvgs[`${cat.id}_weighted`] = (finalResult / 100) * cat.weight;
            }
          });
        }

        const subjectTargetWeight = resultMode === 'midterm' 
          ? (subject.midtermTargetWeight ?? subject.targetWeight ?? 100)
          : resultMode === 'final'
            ? (subject.finalTargetWeight ?? subject.targetWeight ?? 100)
            : (subject.targetWeight ?? 100);

        subjectScores[subject.id] = (subjectPercentage / 100) * subjectTargetWeight;
        subjectScores[`${subject.id}_pct`] = subjectPercentage;

        const divideByAll = settings?.divideByAllSubjects !== false;

        if (divideByAll || hasSubjectScore) {
          totalWeightSum += subjectTargetWeight;
        }
        if (hasSubjectScore) {
          totalWeightedSum += subjectScores[subject.id];
        }
      });
      
      const attWeight = level.attendanceWeight || 0;
      if (resultMode === 'full' && attWeight > 0) {
        const attPct = calculateAttendancePercentage(student, settings);
        totalWeightSum += attWeight;
        totalWeightedSum += (attPct / 100) * attWeight;
      }

      const effectiveDivisor = resultMode === 'midterm'
        ? (level?.midtermCustomDivisor ? level.midtermCustomDivisor * 100 : totalWeightSum)
        : resultMode === 'final'
          ? (level?.finalCustomDivisor ? level.finalCustomDivisor * 100 : totalWeightSum)
          : (level?.customDivisor ? level.customDivisor * 100 : totalWeightSum);

      const performancePct = effectiveDivisor > 0 ? (totalWeightedSum / effectiveDivisor) * 100 : 0;
      return { 
        id: student.id, 
        finalScore: performancePct, 
        performancePct,
        categoryAvgs, 
        subjectScores 
      };
    });

    const sortedScores = [...scores]
      .filter((s) => {
        const stud = students.find((x) => x.id === s.id);
        return stud ? !stud.isHidden : true;
      })
      .sort((a, b) => b.finalScore - a.finalScore);

    return scores.reduce(
      (acc, curr) => {
        const stud = students.find((x) => x.id === curr.id);
        const isHidden = stud ? stud.isHidden : false;
        
        const rank = isHidden
          ? "-"
          : sortedScores.findIndex((s) => s.finalScore === curr.finalScore) + 1;
          
        acc[curr.id] = {
          finalScore: curr.finalScore,
          performancePct: curr.performancePct,
          rank: rank === 0 ? "-" : rank,
          categoryAvgs: curr.categoryAvgs,
          subjectScores: curr.subjectScores,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          finalScore: number;
          performancePct: number;
          rank: any;
          categoryAvgs: Record<string, number>;
          subjectScores: Record<string, number>;
        }
      >,
    );
  }, [students, level, resultMode]);

  const sortedStudents = useMemo(() => {
    if (!sortConfig) return students;
    return [...students].sort((a, b) => {
      const aMetrics = studentMetrics[a.id] || { finalScore: 0, rank: 999 };
      const bMetrics = studentMetrics[b.id] || { finalScore: 0, rank: 999 };

      let aValue: any = "";
      let bValue: any = "";

      if (sortConfig.key === "finalScore") {
        aValue = aMetrics.finalScore;
        bValue = bMetrics.finalScore;
      } else if (sortConfig.key === "rank") {
        aValue = aMetrics.rank;
        bValue = bMetrics.rank;
      } else if (sortConfig.key === "name") {
        aValue = (a.name || "").toLowerCase();
        bValue = (b.name || "").toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [students, studentMetrics, sortConfig]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return sortedStudents;
    const q = searchQuery.toLowerCase();
    return sortedStudents.filter(s => s.name.toLowerCase().includes(q));
  }, [sortedStudents, searchQuery]);

  const handlePasteScores = async (ic: { categoryId: string; itemIndex: number; maxScore: number; label: string; subjectId: string }) => {
    try {
      const text = await navigator.clipboard.readText();
      const rawValues = text.split(/\r?\n/).map(v => v.trim()).filter(v => v !== "");
      if (rawValues.length === 0) {
        alert("No data found in clipboard.");
        return;
      }
      const numValues = rawValues.map(v => Number(v)).filter(n => !isNaN(n));
      if (numValues.length === 0) {
        alert("Could not parse numbers from clipboard.");
        return;
      }
      
      const updates = [];
      const visibleStudents = sortedStudents.filter(s => !s.isHidden);
      
      for (let i = 0; i < Math.min(numValues.length, visibleStudents.length); i++) {
        updates.push({
          id: visibleStudents[i].id,
          categoryId: ic.categoryId,
          itemIndex: ic.itemIndex,
          value: numValues[i]
        });
      }
      
      if (updates.length > 0 && onBulkUpdateStudentScores) {
        onBulkUpdateStudentScores(updates);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to read from clipboard. Please ensure you have granted clipboard permissions.");
    }
  };

  const handleAutoFill = (ic: { categoryId: string; itemIndex: number; maxScore: number; label: string; subjectId: string }) => {
    const valStr = prompt(`Enter a value to auto-fill for all blank scores in ${ic.label}:`);
    if (!valStr || valStr.trim() === "") return;
    const val = Number(valStr);
    if (isNaN(val)) {
      alert("Invalid number.");
      return;
    }
    
    const visibleStudents = sortedStudents.filter(s => !s.isHidden);
    const updates = [];
    visibleStudents.forEach(s => {
      const existing = s.scores[`${ic.categoryId}_${ic.itemIndex}`];
      if (existing === undefined || existing === null || existing === "") {
        updates.push({
          id: s.id,
          categoryId: ic.categoryId,
          itemIndex: ic.itemIndex,
          value: val
        });
      }
    });
    
    if (updates.length > 0 && onBulkUpdateStudentScores) {
      onBulkUpdateStudentScores(updates);
    } else {
      alert("No blank scores found for visible students.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto custom-scrollbar min-h-[420px] md:min-h-[520px]">
        <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-max">
        <thead
          className={`text-xs uppercase border-b ${gridStyles.headerBorderClass} ${currentPaper.textClass}`}
        >
          {/* Row 1: Subjects */}
          <tr>
            <th
              rowSpan={resultMode === 'full' ? 3 : 2}
              className={`px-2 py-2 font-bold border-r ${gridStyles.headerBorderClass} w-10 text-center sm:sticky left-0 z-20 sm:${gridStyles.shadowHeader} ${currentPaper.bgClass}`}
              style={{ ...currentPaper.customStyle, left: 0 }}
            >
              No
            </th>
            <th
              rowSpan={resultMode === 'full' ? 3 : 2}
              className={`px-3 py-2 font-black border-r ${gridStyles.headerBorderClass} w-[180px] min-w-[180px] max-w-[180px] sm:sticky left-10 z-20 sm:${gridStyles.shadowHeader} cursor-pointer hover:bg-black/[0.05] transition-colors ${currentPaper.bgClass} uppercase tracking-tight`}
              style={{ ...currentPaper.customStyle, left: "2.5rem" }}
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center justify-center gap-1.5">
                Student Name <ArrowUpDown className="w-3.5 h-3.5 text-blue-500/50" />
              </div>
            </th>
            <th
              rowSpan={resultMode === 'full' ? 3 : 2}
              className={`px-1 py-2 font-bold border-r ${gridStyles.headerBorderClass} text-center w-12 text-[10px]`}
            >
              Sex
            </th>
            {resultMode === 'full' && (
              <th
                rowSpan={resultMode === 'full' ? 3 : 2}
                className={`px-1 py-2 font-bold border-r ${gridStyles.headerBorderClass} text-center w-16 text-[10px]`}
              >
                Attnd %
              </th>
            )}
            {subjectCols.map((sc) => {
              const theme = getTheme(sc.index, sc.subject.name, settings);
              const subjectCategories = sc.subject.categories.map((c: any) => {
                return { ...c, isHiddenByMode: false };
              });
              const hiddenCount = subjectCategories.filter((c: any) => hiddenCategories.includes(c.id)).length;
              const allCategoriesHidden = subjectCategories.length > 0 && hiddenCount === subjectCategories.length;

              return (
                <th
                  key={sc.subject.id}
                  colSpan={sc.colSpan}
                  rowSpan={(() => {
                    if (sc.isHidden) return (resultMode === 'full' ? 3 : 2);
                    if (resultMode !== 'full' && sc.colSpan === 1) return 2;
                    return 1;
                  })()}
                  className={`px-4 py-2 border-r border-b ${gridStyles.headerBorderClass} ${headerStyleClass} ${sc.isHidden ? "bg-slate-200 border-slate-300 text-slate-500" : `${theme.bg} ${theme.text}`}`}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="truncate max-w-[150px] uppercase" title={sc.subject.name}>
                        {sc.subject.name}
                      </span>

                      {!sc.isHidden && resultMode === 'full' && (
                        <div className="flex items-center gap-1.5 ml-1">
                          {/* Button 1: Hide all categories (Show Total only) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAllCategoriesOfSubject(sc.subject.id);
                            }}
                            className={`flex items-center justify-center p-1 rounded transition-all border shadow-xs cursor-pointer ${
                              allCategoriesHidden
                                ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                            title={
                              allCategoriesHidden
                                ? "Unhide All Categories"
                                : "Hide All Categories (Show Total Score Only)"
                            }
                          >
                            <EyeOff className="w-3 h-3" />
                          </button>

                          {/* Button 2: Select category to unhide */}
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSubjectMenu(activeSubjectMenu === sc.subject.id ? null : sc.subject.id);
                              }}
                              className={`flex items-center justify-center p-1 rounded transition-all border shadow-xs cursor-pointer ${
                                activeSubjectMenu === sc.subject.id
                                  ? "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200"
                                  : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                              }`}
                              title="Select individual categories to show/hide"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                            </button>

                            {activeSubjectMenu === sc.subject.id && (
                              <div
                                className="absolute top-full mt-1.5 right-0 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 text-left z-50 text-slate-800 font-normal text-xs normal-case"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-3 py-1 font-bold text-slate-500 border-b border-slate-100 pb-1 mb-1 flex justify-between items-center">
                                  <span>Show/Hide Categories</span>
                                  <button
                                    onClick={() => setActiveSubjectMenu(null)}
                                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                                  >
                                    Close
                                  </button>
                                </div>
                                {subjectCategories.map((cat: any) => {
                                  const isCatHidden = hiddenCategories.includes(cat.id);
                                  return (
                                    <button
                                      key={cat.id}
                                      type="button"
                                      onClick={() => {
                                        toggleCategory(cat.id);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
                                    >
                                      <span className={isCatHidden ? "text-slate-400 line-through" : "text-slate-700 font-medium"}>
                                        {cat.name}
                                      </span>
                                      {isCatHidden ? (
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Hidden</span>
                                      ) : (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Visible</span>
                                      )}
                                    </button>
                                  );
                                })}
                                {subjectCategories.length === 0 && (
                                  <div className="px-3 py-2 text-slate-400 italic">No categories under this subject</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => toggleSubject(sc.subject.id)}
                        className="opacity-60 hover:opacity-100 focus:outline-none transition-opacity cursor-pointer p-0.5"
                        title={sc.isHidden ? "Unhide Subject" : "Hide Subject"}
                      >
                        {sc.isHidden ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {!sc.isHidden && resultMode !== 'full' && (
                      <div className="flex items-center text-[9px] normal-case font-bold text-red-600 bg-red-50/50 px-1 py-0.5 rounded border border-red-200/50 mt-1">
                        {(() => {
                          const totalModeTargetWeight = level.subjects.reduce((sum, s) => {
                            const w = resultMode === 'midterm' 
                              ? (s.midtermTargetWeight ?? s.targetWeight ?? 100)
                              : (s.finalTargetWeight ?? s.targetWeight ?? 100);
                            return sum + w;
                          }, 0);
                          const currentSubjectTargetWeight = resultMode === 'midterm'
                            ? (sc.subject.midtermTargetWeight ?? sc.subject.targetWeight ?? 100)
                            : (sc.subject.finalTargetWeight ?? sc.subject.targetWeight ?? 100);
                          const weightPct = totalModeTargetWeight > 0 
                            ? Math.round((currentSubjectTargetWeight / totalModeTargetWeight) * 100) 
                            : 0;
                          return (
                            <span className="text-purple-600 font-extrabold mr-1.5 uppercase text-[9px] tracking-tight">
                              {weightPct}%
                            </span>
                          );
                        })()}
                        <span className="mr-0.5 opacity-70 uppercase text-[8px] tracking-tighter">MAX:</span>
                        <input
                          type="number"
                          min="1"
                          value={resultMode === 'midterm' ? (sc.subject.midtermMaxScore || 100) : (sc.subject.finalMaxScore || 100)}
                          onChange={(e) => {
                            if (!onUpdateLevel) return;
                            const newVal = Number(e.target.value);
                            const newSubjects = level.subjects.map(s => {
                              if (s.id !== sc.subject.id) return s;
                              return resultMode === 'midterm' 
                                ? { ...s, midtermMaxScore: newVal }
                                : { ...s, finalMaxScore: newVal };
                            });
                            onUpdateLevel({ ...level, subjects: newSubjects });
                          }}
                          className="w-8 no-spinners bg-transparent border-b border-red-300 focus:border-red-500 outline-none text-center font-bold text-red-700 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </th>
              );
            })}
            <th
              rowSpan={resultMode === 'full' ? 3 : 2}
              className={`px-4 py-3 font-bold bg-blue-50 border-l ${gridStyles.totalBorderClass} text-center shadow-[-1px_0_0_0_#cbd5e1] cursor-pointer hover:bg-blue-100 transition-colors`}
              onClick={() => handleSort("finalScore")}
            >
              <div className="flex items-center justify-center gap-1">
                {resultMode === 'midterm' ? 'MID AVG' : (resultMode === 'final' ? 'FINAL AVG' : 'TOTAL AVG')} <ArrowUpDown className="w-3 h-3 text-blue-400" />
              </div>
            </th>
            <th
              rowSpan={resultMode === 'full' ? 3 : 2}
              className={`px-4 py-3 font-bold bg-blue-50 border-l ${gridStyles.totalBorderClass} text-center cursor-pointer hover:bg-blue-100 transition-colors`}
              onClick={() => handleSort("rank")}
            >
              <div className="flex items-center justify-center gap-1">
                RANK <ArrowUpDown className="w-3 h-3 text-blue-400" />
              </div>
            </th>
            <th
              rowSpan={resultMode === 'full' ? 3 : 2}
              className={`px-4 py-3 font-bold bg-blue-50 border-l ${gridStyles.totalBorderClass} text-center`}
            >
              GRADE
            </th>
            <th
              rowSpan={resultMode === 'full' ? 3 : 2}
              className={`px-4 py-3 font-bold bg-blue-50 border-l ${gridStyles.totalBorderClass} text-center`}
            >
              STATUS
            </th>
            <th
              rowSpan={resultMode === 'full' ? 3 : 2}
              className={`px-4 py-3 font-bold text-center border-l ${gridStyles.headerBorderClass} w-24`}
            >
              Act
            </th>
          </tr>

          {/* Row 2: Categories */}
          {resultMode === 'full' && (
            <tr>
              {categoryCols.map((cc, i) => {
                  if (cc.isHiddenSubject) return null;
                  const theme = cc.theme;
                  const isCatHidden = cc.isHidden;
                  const hasKeptCols = isCatHidden && (
                    (settings?.keepAvgOnHide && settings?.showAvgColumns && (cc.category.itemCount ?? 0) > 1) ||
                    (settings?.keepWtdOnHide && settings?.showWtdColumns)
                  );
                  const isCollapsed = isCatHidden && !hasKeptCols;

                  return (
                    <th
                      key={`${cc.category.id}_${i}`}
                      colSpan={cc.colSpan}
                      className={`px-2 py-2 border-r border-b ${gridStyles.headerBorderClass} ${headerStyleClass} ${
                        isCollapsed 
                          ? "bg-slate-100/50 text-slate-300 italic w-12" 
                          : hasKeptCols
                            ? `${theme.bg} opacity-90 border-b-2 border-dashed border-b-slate-400 text-slate-700`
                            : `${theme.bg} ${theme.text}`
                      } whitespace-nowrap transition-colors`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {isCollapsed ? (
                          <button
                            onClick={() => toggleCategory(cc.category.id)}
                            className="flex flex-col items-center justify-center gap-0.5 w-full h-full group hover:bg-black/5 p-1 rounded transition-colors"
                            title={`Show ${cc.category.name}`}
                          >
                            <Eye className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                            <span className="text-[8px] uppercase tracking-tighter text-slate-400 group-hover:text-blue-500">{cc.category.name.substring(0, 3)}</span>
                          </button>
                        ) : (
                          <>
                            {(() => {
                              const subCol = subjectCols.find(sc => sc.subject.id === cc.subjectId);
                              const isSingleCol = subCol ? subCol.colSpan === 1 : false;
                              if (resultMode !== 'full' && isSingleCol) return null;

                              return (
                                <>
                                  <span className={`truncate max-w-[150px] ${hasKeptCols ? "text-slate-600 font-medium italic" : ""}`}>
                                    {cc.category.name}
                                    {settings?.showCategoryWeight !== false && cc.category.name !== "RESULT" && ` (${cc.category.weight}%)`}
                                  </span>
                                  {settings?.showCategoryHideIcon !== false && (
                                    <button
                                      onClick={() => toggleCategory(cc.category.id)}
                                      className="p-1 hover:bg-black/10 rounded transition-colors ml-1"
                                      title={hasKeptCols ? `Show raw scores for ${cc.category.name}` : `Hide ${cc.category.name}`}
                                    >
                                      {hasKeptCols ? (
                                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                                      ) : (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                  {(() => {
                                    const isMidCol = resultMode === 'full' && cc.category.id.startsWith('exam_midterm_cat_');
                                    const isFinCol = resultMode === 'full' && cc.category.id.startsWith('exam_final_cat_');
                                    const isMidCat = isMidtermCategory(cc.category);
                                    const isFinCat = isFinalCategory(cc.category);
                                    
                                    return null;
                                  })()}
                                </>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
          )}

          {/* Row 3: Items */}
          {(() => {
            const hasVisibleItems = resultMode === 'full' || itemCols.some(ic => {
              if (ic.isHiddenSubject) return false;
              const subCol = subjectCols.find(sc => sc.subject.id === ic.subjectId);
              const isSingleCol = subCol ? subCol.colSpan === 1 : false;
              // If we are here, resultMode is NOT 'full' because of the short-circuit || above
              return !isSingleCol;
            });

            if (!hasVisibleItems) return null;

            return (
              <tr>
                {itemCols.map((ic, i) => {
                    if (ic.isHiddenSubject) return null;
                    const subCol = subjectCols.find(sc => sc.subject.id === ic.subjectId);
                    const isSingleCol = subCol ? subCol.colSpan === 1 : false;
                    const isFull = resultMode === 'full';
                    if (!isFull && isSingleCol) return null;

                    const theme = ic.theme;
                    const isHidden = ic.isHidden;
                    return (
                      <th
                        key={`${ic.categoryId}_${ic.itemIndex}_${i}`}
                        className={`group px-1 py-1 border-r border-b ${gridStyles.headerBorderClass} ${headerStyleClass} ${isHidden ? "bg-slate-50/50 text-slate-200 w-12" : ic.isAvg ? ((ic.itemIndex === -98 || ic.itemIndex === -99) ? `bg-blue-100 text-blue-900 w-24 ${ic.itemIndex === -98 || (ic.itemIndex === -99 && (settings?.resultDisplayMode === 'wtd' || !settings?.resultDisplayMode)) ? `border-l ${gridStyles.totalBorderClass}` : ''}` : ic.itemIndex === -1 ? `bg-orange-100/${op.avg} text-orange-900 w-20` : ic.itemIndex === -5 || ic.itemIndex === -3 ? `bg-purple-100/${op.avg} text-purple-900 w-20` : `${theme.avgBg} ${theme.text} w-20`) : `${theme.bg} ${theme.text} w-16`} transition-colors`}
                      >
                        {(() => {
                          if (isHidden) {
                            return <span className="text-[10px] italic">Hidden</span>;
                          }

                          if (ic.isAvg) {
                            return (
                              <div className="flex flex-col items-center justify-center h-full">
                                <span className="font-bold">{ic.label}</span>
                              </div>
                            );
                          }

                        return (
                          <div className="flex flex-col items-center justify-center h-full">
                            {/* Only show MAX input for regular categories OR for exams when NOT in full mode */}
                            {!(resultMode === 'full' && ic.categoryId.startsWith('exam_')) ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <input 
                                    type="text" 
                                    value={ic.label} 
                                    onChange={(e) => handleUpdateItemName(ic.subjectId, ic.categoryId, ic.itemIndex, e.target.value)}
                                    className={`w-14 bg-transparent text-center font-bold text-[10px] uppercase ${theme.text} outline-none hover:bg-white/20 focus:bg-white/50 focus:ring-1 focus:ring-blue-200 rounded`}
                                    placeholder={`Item ${ic.itemIndex + 1}`}
                                  />
                                  <div className="flex items-center whitespace-nowrap bg-slate-50/50 px-1 py-0.5 rounded border border-slate-200/30">
                                    <div className="flex items-center text-[10px] font-bold text-red-600">
                                      <input
                                        type="number"
                                        min="1"
                                        value={ic.maxScore}
                                        onChange={(e) =>
                                          handleUpdateMaxScore(
                                            ic.subjectId,
                                            ic.categoryId,
                                            ic.itemIndex,
                                            Number(e.target.value),
                                          )
                                        }
                                        className="w-8 no-spinners bg-transparent border-b border-red-200 focus:border-red-500 outline-none text-center font-bold text-red-700 text-[10px]"
                                        title="Set Full Raw Score"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button title="Paste scores from spreadsheet" onClick={() => handlePasteScores(ic)} className="text-slate-400 hover:text-blue-500"><ClipboardPaste className="w-3 h-3" /></button>
                                    <button title="Auto-fill blank scores" onClick={() => handleAutoFill(ic)} className="text-slate-400 hover:text-blue-500"><Wand2 className="w-3 h-3" /></button>
                                  </div>
                                </div>
                            ) : (
                              <span className="text-[10px] font-bold opacity-60 uppercase">{ic.label}</span>
                            )}
                          </div>
                        );
                      })()}

                    </th>
                  );
                })}
              </tr>
            );
          })()}

          {/* Closing CategoryCols loop correctly */}
          {(resultMode !== 'full') && (
            <tr className="hidden" aria-hidden="true"></tr>
          )}
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredStudents.map((student, index) => {
            const metrics = studentMetrics[student.id] || {
              finalScore: 0,
              performancePct: 0,
              rank: "-",
              categoryAvgs: {},
              subjectScores: {},
            };
            const finalScore = metrics.finalScore;
            const rank = metrics.rank;

            const grade = calculateGrade(finalScore, resultMode, settings, level);
            const isMidtermOrFinal = resultMode === 'midterm' || resultMode === 'final';
            
            const computedAttendance = settings?.showAttendance !== false ? `${calculateAttendancePercentage(student, settings).toFixed(2)}%` : student.attendance;
            const status = calculateStatus(finalScore, resultMode, settings, computedAttendance, level);

            // Determine color for the average score
            let scoreColor = "text-slate-900";
            let scoreBg = "bg-blue-50/30";
            if (finalScore >= 90) {
              scoreColor = "text-purple-700";
              scoreBg = "bg-purple-50/50";
            } else if (finalScore >= 70) {
              scoreColor = "text-emerald-700";
              scoreBg = "bg-emerald-50/50";
            } else if (finalScore >= 60) {
              scoreColor = "text-orange-700";
              scoreBg = "bg-orange-50/50";
            } else if (finalScore > 0) {
              scoreColor = "text-red-600";
              scoreBg = "bg-red-50/50";
            }

            const { totalPointsEarned, maxPointsPossible } = (() => {
              let earned = 0;
              let possible = 0;
              itemCols.forEach(ic => {
                if (ic.isHidden || ic.isAvg || ic.itemIndex < 0) return;
                const scoreKey = `${ic.categoryId}_${ic.itemIndex}`;
                const score = student.scores[scoreKey];
                if (score !== undefined && score !== null && score !== "") {
                  const scoreNum = Number(score);
                  if (!isNaN(scoreNum)) {
                    earned += scoreNum;
                    possible += ic.maxScore;
                  }
                }
              });
              return { totalPointsEarned: earned, maxPointsPossible: possible };
            })();

            return (
              <React.Fragment key={student.id}>
                <tr
                  className={`hover:bg-blue-50/30 transition-colors group ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"} ${student.isHidden ? "bg-slate-100/40 text-slate-400 opacity-60 italic" : ""}`}
                >
                <td
                  className={`px-1 py-2 border-r border-b ${gridStyles.bodyBorderClass} text-center font-bold text-slate-400 text-xs sm:sticky left-0 z-10 sm:${gridStyles.shadowBody} ${currentPaper.bgClass}`}
                  style={{ ...currentPaper.customStyle, left: 0 }}
                >
                  {index + 1}
                </td>
                <td
                  className={`py-2 border-r border-b ${gridStyles.bodyBorderClass} sm:sticky left-10 z-10 sm:${gridStyles.shadowBody} transition-colors w-[220px] min-w-[220px] max-w-[220px] ${currentPaper.bgClass} ${settings?.rowIndent ? 'pl-8 pr-1' : 'px-3'}`}
                  style={{ ...currentPaper.customStyle, left: "2.5rem" }}
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleStudentExpansion(student.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
                      title="Toggle Student Performance Summary"
                    >
                      {expandedStudentIds.includes(student.id) ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <input
                      type="text"
                      id={`grid-input-${index}-name`}
                      value={settings?.hideStudentNames ? `Student ${index + 1}` : student.name}
                      onChange={(e) =>
                        onUpdateStudentField(student.id, "name", e.target.value)
                      }
                      onKeyDown={(e) => handleGridKeyDown(e, index, "name")}
                      disabled={student.isHidden || settings?.hideStudentNames}
                      className={`w-full bg-transparent border border-transparent focus:bg-white focus:ring-1 focus:ring-blue-100 rounded px-1.5 py-0.5 font-black text-slate-900 transition-all outline-none truncate text-sm disabled:opacity-50 ${settings?.hideStudentNames ? 'filter blur-[3px] select-none' : ''}`}
                      placeholder="Enter Name"
                    />
                    {!student.isHidden && metrics?.categoryAvgs && (
                      <TrendLine data={level.subjects.flatMap(s => s.categories.map(c => metrics.categoryAvgs[c.id]))} />
                    )}
                  </div>
                </td>
                <td className={`px-1 py-2 border-r border-b ${gridStyles.bodyBorderClass} text-center`}>
                  <select
                    value={student.sex || 'Male'}
                    onChange={(e) => onUpdateStudentField(student.id, "sex", e.target.value)}
                    disabled={student.isHidden}
                    className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer text-slate-700 disabled:opacity-50"
                  >
                    <option value="Male">M</option>
                    <option value="Female">F</option>
                  </select>
                </td>
                {resultMode === 'full' && (
                  <td className={`px-1 py-2 border-r border-b ${gridStyles.bodyBorderClass}`}>
                    {settings?.showAttendance !== false ? (
                      <div className="w-full bg-slate-50 border border-transparent rounded px-1 py-0.5 text-center text-sm font-bold text-blue-700 disabled:opacity-50">
                        {calculateAttendancePercentage(student, settings).toFixed(2)}%
                      </div>
                    ) : (
                      <input
                        type="text"
                        id={`grid-input-${index}-attendance`}
                        value={student.attendance || ""}
                        onChange={(e) =>
                          onUpdateStudentField(
                            student.id,
                            "attendance",
                            e.target.value,
                          )
                        }
                        onKeyDown={(e) => handleGridKeyDown(e, index, "attendance")}
                        disabled={student.isHidden}
                        className={`w-full bg-transparent border border-transparent ${gridStyles.inputBorderClass} focus:bg-white focus:ring-1 focus:ring-blue-100 rounded px-1 py-0.5 text-center transition-all outline-none text-sm disabled:opacity-50`}
                        placeholder="e.g. 95%"
                      />
                    )}
                  </td>
                )}

                {itemCols.map((ic, i) => {
                  if (ic.isHiddenSubject) {
                    return (
                      <td
                        key={`${ic.subjectId}_hidden_sub_${i}`}
                        className={`px-1 py-1 border-r border-b ${gridStyles.bodyBorderClass} bg-slate-200/50 text-slate-400 text-center italic text-[10px]`}
                      >
                        -
                      </td>
                    );
                  }

                  if (ic.isHidden) {
                    return (
                      <td
                        key={`${ic.subjectId}_hidden_cat_${ic.categoryId}_${i}`}
                        className={`px-1 py-1 border-r border-b ${gridStyles.bodyBorderClass} bg-slate-50 text-slate-300 text-center italic text-[10px] w-12 min-w-[3rem]`}
                      >
                        -
                      </td>
                    );
                  }

                  const theme = ic.theme;

                  // FIND THE ACTUAL SCORE
                  const scoreKey = `${ic.categoryId}_${ic.itemIndex}`;
                  let scoreValue = student.scores[scoreKey];
                  let isManual = true;

                  if (resultMode === 'full' && ic.categoryId.startsWith('exam_')) {
                    const isMid = ic.categoryId.includes('midterm');
                    const isManualKey = isMid 
                      ? `exam_midterm_is_manual_${ic.subjectId}`
                      : `exam_final_is_manual_${ic.subjectId}`;
                    const computedKey = isMid
                      ? `exam_midterm_computed_${ic.subjectId}`
                      : `exam_final_computed_${ic.subjectId}`;

                    isManual = metrics.subjectScores?.[isManualKey] === 1;
                    if (!isManual) {
                      scoreValue = metrics.subjectScores?.[computedKey];
                    }
                  }

                    if (ic.categoryId.startsWith('exam_')) {
                      const score = scoreValue;
                      const isFullMode = resultMode === 'full';
                      const weight = ic.categoryId.includes('midterm') ? (ic.subjectWeightMidterm || 0) : (ic.subjectWeightFinal || 0);
                      
                      return (
                        <td
                          key={`${ic.categoryId}_exam_${i}`}
                          className={`px-0.5 py-1 border-r border-b ${gridStyles.bodyBorderClass} ${theme.bg} ${isFullMode ? 'w-24 min-w-[6rem]' : 'w-20 min-w-[5rem]'}`}
                        >
                          {isFullMode ? (
                            <div className="flex flex-col items-center">
                              <div className={`text-center text-sm font-bold ${getScoreColorClass(settings)}`} title={`Raw Score: ${score !== undefined ? score : '-'} / ${ic.maxScore}`}>
                                {(() => {
                                  if (score === undefined || score === null) return '-';
                                  if (weight <= 0) return score; // Fallback to raw if no weight
                                  const weighted = (score / ic.maxScore) * weight;
                                  return weighted.toFixed(1);
                                })()}
                              </div>
                              <div className="text-[9px] text-slate-400 uppercase font-medium">
                                {isManual ? "Manual" : "Auto-Taken"}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <input
                                type="number"
                                id={`grid-input-${index}-${i}`}
                                min="0"
                                max={ic.maxScore}
                                value={score === undefined || score === null ? "" : typeof score === 'number' ? parseFloat(score.toFixed(2)) : score}
                                onChange={(e) =>
                                  onUpdateStudent(
                                    student.id,
                                    ic.categoryId,
                                    ic.itemIndex,
                                    e.target.value === "" ? undefined : Number(e.target.value)
                                  )
                                }
                                onKeyDown={(e) => handleGridKeyDown(e, index, i)}
                                className={`w-full no-spinners border rounded px-0.5 py-0.5 text-center transition-all outline-none text-sm font-bold
                                  ${score !== undefined && score !== null && score > ic.maxScore 
                                     ? "bg-red-600 text-white border-red-700 ring-2 ring-red-200 z-10" 
                                     : `bg-white border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 ${getScoreColorClass(settings)} shadow-sm`
                                  }`}
                                placeholder="-"
                              />
                            </div>
                          )}
                        </td>
                      );
                    }

                  if (ic.itemIndex === -6) {
                    const subPct = metrics.subjectScores?.[`${ic.subjectId}_pct`] || 0;
                    const isLow = subPct < 70;
                    const style = getManualStyle('result', isLow ? 'text-red-600' : 'text-orange-900', `bg-orange-50/${op.special}`);
                    return (
                      <td
                        key={`${ic.categoryId}_subavg_pct_${i}`}
                        className={`px-1 py-1 border-r border-b ${style.borderClass} font-bold text-center text-sm ${style.textClass} ${style.bgClass} w-20 min-w-[5rem]`}
                        title="Average performance in subject (100% scale)"
                      >
                        {subPct.toFixed(1)}
                      </td>
                    );
                  }

                  if (ic.itemIndex === -3) {
                    const subWtd = metrics.subjectScores?.[ic.subjectId] || 0;
                    const style = getManualStyle('result', 'text-purple-900', `bg-purple-100/${op.special}`);
                    return (
                      <td
                        key={`${ic.categoryId}_subavg_wtd_${i}`}
                        className={`px-1 py-1 border-r border-b ${style.borderClass} font-bold text-center text-sm ${style.bgClass} ${style.textClass} w-20 min-w-[5rem]`}
                        title="Weighted points earned in subject"
                      >
                        {subWtd.toFixed(1)}
                      </td>
                    );
                  }

                  if (ic.itemIndex === -2) {
                    const subPct = metrics.subjectScores?.[`${ic.subjectId}_pct`] || 0;
                    const grade = calculateGrade(subPct, resultMode, settings, level);
                    return (
                      <td
                        key={`${ic.categoryId}_subgrade_${i}`}
                        className={`px-1 py-1 border-r border-b ${gridStyles.bodyBorderClass} font-bold text-center text-xs ${theme.avgBg} ${theme.text} w-16 min-w-[4rem]`}
                        title={`Grade based on ${subPct.toFixed(1)}% performance`}
                      >
                        {grade}
                      </td>
                    );
                  }

                  if (ic.itemIndex === -5) {
                    const weighted = metrics.categoryAvgs[`${ic.categoryId}_weighted`] || 0;
                    return (
                      <td
                        key={`${ic.categoryId}_weighted_${i}`}
                        className={`px-1 py-1 border-r border-b ${gridStyles.bodyBorderClass} font-bold text-center text-sm bg-purple-50/${op.special} text-purple-900 w-20 min-w-[5rem]`}
                        title="Weighted contribution to subject/total"
                      >
                        {weighted.toFixed(1)}
                      </td>
                    );
                  }

                  if (ic.itemIndex === -98) {
                    const subPct = metrics.subjectScores?.[`${ic.subjectId}_pct`] || 0;
                    const isLow = subPct < 70;
                    const style = getManualStyle('result', isLow ? 'text-red-600' : 'text-blue-900', 'bg-blue-50/50');
                    return (
                      <td
                        key={`combined_avg_${ic.subjectId}_${i}`}
                        className={`px-1 py-1 border-r border-l ${gridStyles.totalBorderClass} border-b ${style.borderClass} font-bold text-center text-sm ${style.textClass} ${style.bgClass} w-24 min-w-[6rem] shadow-[-1px_0_0_0_#cbd5e1]`}
                        title={`Subject Percentage Score: ${subPct.toFixed(1)}%`}
                      >
                        {subPct.toFixed(1)}%
                      </td>
                    );
                  }

                  if (ic.itemIndex === -99) {
                    const subPct = metrics.subjectScores?.[`${ic.subjectId}_pct`] || 0;
                    const subject = level.subjects.find(s => s.id === ic.subjectId);
                    const targetWeight = subject?.targetWeight ?? 100;
                    const contribution = (subPct / 100) * targetWeight;
                    const isLow = subPct < 70;
                    const isFirst = settings?.resultDisplayMode === 'wtd' || !settings?.resultDisplayMode;
                    const style = getManualStyle('result', isLow ? 'text-red-600' : 'text-blue-900', 'bg-blue-50/50');
                    return (
                      <td
                        key={`combined_${ic.subjectId}_${i}`}
                        className={`px-1 py-1 border-r ${isFirst ? `border-l ${gridStyles.totalBorderClass}` : ''} border-b ${style.borderClass} font-bold text-center text-sm ${style.textClass} ${style.bgClass} w-24 min-w-[6rem] ${isFirst ? 'shadow-[-1px_0_0_0_#cbd5e1]' : ''}`}
                        title={`Subject Percentage Score: ${subPct.toFixed(1)}% (Weight: ${targetWeight}%)`}
                      >
                        {contribution.toFixed(1)}
                      </td>
                    );
                  }

                  if (ic.itemIndex === -11 || ic.itemIndex === -12) {
                    const isMid = ic.itemIndex === -11;
                    const pct = metrics.categoryAvgs[ic.categoryId] || 0;
                    const weight = level.subjects.find(s => s.id === ic.subjectId)?.categories.find(c => c.id === ic.categoryId)?.weight || 0;
                    const weighted = (pct / 100) * weight;
                    const rawScoreKey = `exam_${isMid ? 'midterm' : 'final'}_${ic.subjectId}_-1`;
                    const rawScore = student.scores[rawScoreKey];
                    const maxScore = level.subjects.find(s => s.id === ic.subjectId)?.[isMid ? 'midtermMaxScore' : 'finalMaxScore'] || 100;
                    const isManual = typeof rawScore === 'number';

                    return (
                      <td
                        key={`${ic.categoryId}_auto_${i}`}
                        className={`px-0.5 py-1 border-r border-b ${gridStyles.bodyBorderClass} ${theme.bg} w-24 min-w-[6rem]`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="number"
                            id={`grid-input-${index}-${i}`}
                            min="0"
                            max={maxScore}
                            value={rawScore !== undefined && rawScore !== null ? rawScore : ""}
                            onChange={(e) =>
                              onUpdateStudent(
                                student.id,
                                isMid ? 'exam_midterm' : 'exam_final',
                                -1,
                                e.target.value === "" ? undefined : Number(e.target.value)
                              )
                            }
                            onKeyDown={(e) => handleGridKeyDown(e, index, i)}
                            className={`w-full bg-transparent border-b border-dashed ${isManual ? 'border-blue-400 text-blue-700' : 'border-transparent text-slate-500'} focus:border-blue-500 focus:bg-white text-center text-sm font-bold outline-none transition-all`}
                            placeholder="-"
                          />
                        </div>
                      </td>
                    );
                  }

                  if (ic.isAvg) {
                    const avg = metrics.categoryAvgs[ic.categoryId] || 0;
                    const isRawAvg = ic.label === "Average" || ic.label === "Score";
                    return (
                      <td
                        key={`${ic.categoryId}_avg_${i}`}
                        className={`px-1 py-1 border-r border-b ${gridStyles.bodyBorderClass} font-bold text-center text-sm ${isRawAvg ? `bg-orange-50/${op.special} text-orange-900` : `bg-purple-50/${op.special} text-purple-900`} w-20 min-w-[5rem]`}
                        title={isRawAvg ? "Raw average (100% scale)" : "Weighted average"}
                      >
                        {avg.toFixed(1)}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={`${ic.categoryId}_item_${ic.itemIndex}_${i}`}
                      className={`px-0.5 py-1 border-r border-b ${gridStyles.bodyBorderClass} ${theme.bg} w-16 min-w-[4rem]`}
                    >
                      {(() => {
                        const isExceeding = scoreValue !== undefined && scoreValue !== null && scoreValue > ic.maxScore;
                        return (
                          <input
                            type="number"
                            id={`grid-input-${index}-${i}`}
                            min="0"
                            max={ic.maxScore}
                            value={scoreValue === undefined || scoreValue === null ? "" : typeof scoreValue === 'number' ? parseFloat(scoreValue.toFixed(2)) : scoreValue}
                            onChange={(e) =>
                              onUpdateStudent(
                                student.id,
                                ic.categoryId,
                                ic.itemIndex,
                                e.target.value === "" ? undefined : Number(e.target.value)
                              )
                            }
                            onKeyDown={(e) => handleGridKeyDown(e, index, i)}
                            className={`w-full no-spinners border rounded px-0.5 py-0.5 text-center transition-all outline-none text-sm font-semibold
                              ${isExceeding 
                                ? "bg-red-600 text-white border-red-700 ring-2 ring-red-200 z-10" 
                                : `bg-transparent border-transparent hover:bg-white/50 ${gridStyles.inputBorderClass} focus:bg-white focus:ring-1 focus:ring-blue-100 ${getScoreColorClass(settings)}`
                              }`}
                            placeholder="-"
                            title={isExceeding ? `Warning: Score (${scoreValue}) exceeds Max Score (${ic.maxScore})` : ""}
                          />
                        );
                      })()}
                    </td>
                  );
                })}

                {(() => {
                  const style = getManualStyle('avg', scoreColor, scoreBg);
                  return (
                    <td className={`px-2 py-2 ${style.bgClass} font-bold text-center border-l border-b ${style.borderClass} shadow-[-1px_0_0_0_#eff6ff] text-sm ${style.textClass}`}>
                      <div className="flex flex-col items-center">
                        <span title="Average performance (100% scale)">
                          {metrics.performancePct.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  );
                })()}
                <td className={`px-2 py-2 ${scoreBg} font-bold text-slate-700 text-center border-l border-b ${gridStyles.totalBorderClass} text-sm`}>
                  {rank}
                </td>
                <td className={`px-2 py-2 ${scoreBg} text-center border-l border-b ${gridStyles.totalBorderClass} min-w-[70px]`}>
                  <div className="flex flex-col items-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black border shadow-sm ${
                        grade.startsWith("A")
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : grade.startsWith("B")
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : grade.startsWith("C")
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : grade.startsWith("D")
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : grade.startsWith("E")
                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                  : grade.startsWith("P") || grade.toLowerCase().includes("pass")
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {grade}
                    </span>
                  </div>
                </td>
                <td className={`px-2 py-2 ${scoreBg} text-center border-l border-b ${gridStyles.totalBorderClass} min-w-[70px]`}>
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-xs font-black px-2 py-1 rounded border ${
                        status.toLowerCase().includes("pass")
                          ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                          : status.toLowerCase().includes("repeat")
                            ? "text-orange-700 bg-orange-50 border-orange-100"
                            : "text-red-600 bg-red-50 border-red-100"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </td>
                <td className={`px-1 py-2 text-center border-l border-b ${gridStyles.bodyBorderClass} transition-colors`}>
                  <div className="flex items-center justify-center gap-1.5">
                    {student.isHidden ? (
                      <button
                        onClick={() => onUpdateStudentField(student.id, "isHidden", false)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors flex items-center justify-center"
                        title="Unhide Student"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateStudentField(student.id, "isHidden", true)}
                        className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors flex items-center justify-center"
                        title="Hide Student"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${student.name || "this student"}?`)) {
                          onDeleteStudent(student.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
                      title="Delete Student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedStudentIds.includes(student.id) && (
                <tr className="bg-slate-50/70">
                  <td colSpan={100} className="p-5 border-b border-slate-200/80">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto p-1">
                        {/* Bento Card 1: Performance Stats */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Final Average</span>
                            <span className="text-xl font-black text-slate-800">{metrics.performancePct.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Bento Card 2: Points Earned */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Points Earned</span>
                            <span className="text-xl font-black text-slate-800">
                              {totalPointsEarned.toFixed(1)}{" "}
                              <span className="text-xs text-slate-400 font-bold">/ {maxPointsPossible.toFixed(1)} pts</span>
                            </span>
                          </div>
                        </div>

                        {/* Bento Card 3: Letter Grade */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Letter Grade Conversion</span>
                            <span className="text-xl font-black text-slate-800">
                              {grade}{" "}
                              <span className="text-xs text-slate-400 font-bold uppercase">({calculateStatus(finalScore, resultMode, settings, computedAttendance, level)})</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Subject Performance */}
                      <div className="mt-4 max-w-5xl mx-auto bg-white border border-slate-200/60 rounded-xl p-4 shadow-xs">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          Subject-wise Performance Breakdown
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {level.subjects.map((sub, sIdx) => {
                            const subPct = metrics.subjectScores?.[`${sub.id}_pct`] || 0;
                            const subGrade = calculateGrade(subPct, resultMode, settings, level);
                            return (
                              <div key={sub.id} className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex items-center justify-between">
                                <div className="truncate pr-2">
                                  <span className="block text-xs font-bold text-slate-800 truncate">{sub.name}</span>
                                  <span className="text-[10px] text-slate-400">Target Weight: {resultMode === 'midterm' ? (sub.midtermTargetWeight ?? sub.targetWeight ?? 100) : resultMode === 'final' ? (sub.finalTargetWeight ?? sub.targetWeight ?? 100) : (sub.targetWeight ?? 100)}%</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-right">
                                    <span className="block text-xs font-black text-slate-700">{subPct.toFixed(1)}%</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Grade: {subGrade}</span>
                                  </div>
                                  <div className={`w-1.5 h-8 rounded-full ${
                                    subPct >= 90 ? 'bg-purple-500' :
                                    subPct >= 70 ? 'bg-emerald-500' :
                                    subPct >= 60 ? 'bg-orange-500' : 'bg-red-500'
                                  }`} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              )}
            </React.Fragment>
            );
          })}
          {students.length === 0 && (
            <tr>
              <td
                colSpan={itemCols.length + (resultMode === 'full' ? 8 : 7)}
                className="px-6 py-12 text-center text-slate-500"
              >
                No students added for this level yet. Click "Add Student" to
                begin.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

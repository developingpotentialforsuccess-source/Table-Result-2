import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ClassRecord, Level, Student, calculateGrade, calculateStatus } from '../types';
import { calculateAttendancePercentage } from './attendanceUtils';

export function exportToExcel(currentRecord: ClassRecord, currentLevel: Level, resultMode: 'full' | 'midterm' | 'final' = 'full', students?: Student[]) {
  const data = generateExportData(currentRecord, currentLevel, resultMode, students);
  
  // Calculate Dashboard Statistics
  const total = data.length;
  const passed = data.filter(r => r['Grade'] === 'Pass' || r['Grade'] === 'Promoted').length;
  const failed = total - passed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";
  
  const gradeDist = data.reduce((acc: any, r) => {
    const g = r['Grade'];
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const modeLabel = resultMode === 'midterm' ? 'Mid-term Test Results' : (resultMode === 'final' ? 'Final Test Results' : 'Termly Results');

  // 1. Grades Sheet
  const gradesWs = utils.json_to_sheet([]);
  
  utils.sheet_add_aoa(gradesWs, [
    [`Testing Period: ${modeLabel}`],
    [`Teacher: ${currentRecord.teacherName} | Level: ${currentLevel.name} | Class: ${currentRecord.className}`],
    []
  ], { origin: "A1" });

  utils.sheet_add_json(gradesWs, data, { origin: "A4", skipHeader: false });
  
  const today = new Date();
  const dateStr = `Date: Phnom Penh, ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const footerData = [
    [],
    ["Abbreviations:"],
    ["Alphabet Dict.: Alphabet Dictation", "", "", "", "", "", dateStr],
    ["Alphabet Recogn.: Alphabet Recognition", "", "", "", "", "", "Academic Manager"],
    ["Alphabet Writ.: Alphabet Writing"],
    ["Alphabet and W. Trac.: Alphabet and Word Tracing"],
    ["Individual Speak.: Individual Speaking"],
    ["Pair Conver.: Pair Conversation", "", "", "", "", "", "Sek Sokha"]
  ];

  utils.sheet_add_aoa(gradesWs, footerData, { origin: -1 });

  // Set column widths for grades
  const colWidths = [{ wch: 5 }, { wch: 25 }, { wch: 8 }];
  currentLevel.subjects.forEach(() => colWidths.push({ wch: 15 }));
  colWidths.push({ wch: 15 }, { wch: 10 }, { wch: 15 });
  gradesWs['!cols'] = colWidths;

  // 2. Dashboard Sheet
  const dashboardWs = utils.json_to_sheet([]);
  
  utils.sheet_add_aoa(dashboardWs, [
    [], [], [], [], [], // 5 empty rows for custom logo space
    [`DEVELOPING POTENTIAL FOR SUCCESS - GRADE BOOK SUMMARY`],
    [`Class: ${currentRecord.className}`],
    [`Term: ${currentRecord.termName}  |  Teacher: ${currentRecord.teacherName}  |  Level: ${currentLevel.name}`],
    [`Report Period: ${modeLabel}`],
    [],
    [`PERFORMANCE DASHBOARD`],
    [`Total Students: ${total}`],
    [`Passed: ${passed} (${passRate}%)`],
    [`Failed: ${failed}`],
    [],
    [`Grade Distribution:`],
    [`A: ${gradeDist['A'] || 0}`],
    [`B: ${gradeDist['B'] || 0}`],
    [`C: ${gradeDist['C'] || 0}`],
    [`D: ${gradeDist['D'] || 0}`],
    [`F: ${gradeDist['F'] || 0}`],
  ], { origin: "A1" });
  
  dashboardWs['!cols'] = [{ wch: 50 }];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, gradesWs, "Grades");
  utils.book_append_sheet(wb, dashboardWs, "Dashboard");

  const fileSuffix = resultMode === 'midterm' ? 'Midterm' : (resultMode === 'final' ? 'Final_Test' : 'Full_Term');
  writeFile(wb, `${currentRecord.className}_${currentRecord.termName}_${fileSuffix}_Summary.xlsx`.replace(/\s+/g, '_'));
}

export function exportToPDF(currentRecord: ClassRecord, currentLevel: Level, resultMode: 'full' | 'midterm' | 'final' = 'full', students?: Student[]) {
  const doc = new jsPDF('landscape');
  const data = generateExportData(currentRecord, currentLevel, resultMode, students);
  
  // Calculate Dashboard Statistics
  const total = data.length;
  const passed = data.filter(r => r['Grade'] === 'Pass' || r['Grade'] === 'Promoted').length;
  const failed = total - passed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";
  const gradeDist = data.reduce((acc: any, r) => {
    const g = r['Grade'];
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const modeLabel = resultMode === 'midterm' ? 'Mid-term Test Results' : (resultMode === 'final' ? 'Final Test Results' : 'Termly Results');

  // Leave top 28mm blank for logo positioning, start title at Y=34
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(`DEVELOPING POTENTIAL FOR SUCCESS`, 14, 34);
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`GRADE BOOK SUMMARY - ${modeLabel}`, 14, 40);
  doc.text(`Class: ${currentRecord.className} | Term: ${currentRecord.termName} | Teacher: ${currentRecord.teacherName} | Level: ${currentLevel.name}`, 14, 46);

  // Dashboard Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(180, 30, 100, 20, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text("PERFORMANCE DASHBOARD", 185, 36);
  doc.setFont(undefined, 'normal');
  doc.text(`Total: ${total} | Pass: ${passed} (${passRate}%) | Fail: ${failed}`, 185, 41);
  doc.text(`Grades: A:${gradeDist['A']||0} B:${gradeDist['B']||0} C:${gradeDist['C']||0} D:${gradeDist['D']||0} F:${gradeDist['F']||0}`, 185, 46);

  const headers = Object.keys(data[0] || {});
  const rows = data.map(row => headers.map(h => row[h as keyof typeof row]));

  // @ts-ignore
  doc.autoTable({
    startY: 52,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 8, fontStyle: 'bold', halign: 'center', textColor: 255 },
    styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 35, fontStyle: 'bold' }
    },
    didDrawCell: (data: any) => {
      if (data.section === 'body' && data.column.index > 1) {
        const text = data.cell.text[0];
        if (text === 'Pass' || text === 'Promoted' || text?.startsWith('A') || text?.startsWith('B')) {
          doc.setTextColor(21, 128, 61); // Green
        } else if (text === 'Fail' || text?.startsWith('F') || text?.startsWith('E') || text?.startsWith('D')) {
          doc.setTextColor(220, 38, 38); // Red
        }
      }
    }
  });

  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY || 40;
  const footerY = finalY + 12;
  
  doc.setFontSize(8);
  doc.text("Abbreviations:", 14, footerY);
  doc.text("Alphabet Dict.: Alphabet Dictation", 14, footerY + 4);
  doc.text("Alphabet Recogn.: Alphabet Recognition", 14, footerY + 8);
  doc.text("Alphabet Writ.: Alphabet Writing", 14, footerY + 12);
  doc.text("Alphabet and W. Trac.: Alphabet and Word Tracing", 14, footerY + 16);
  doc.text("Individual Speak.: Individual Speaking", 14, footerY + 20);
  doc.text("Pair Conver.: Pair Conversation", 14, footerY + 24);

  const rightX = 220; 
  const today = new Date();
  const dateStr = `Date: Phnom Penh, ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  
  doc.text(dateStr, rightX, footerY);
  doc.text("Academic Manager", rightX, footerY + 4);
  doc.text("Sek Sokha", rightX, footerY + 20);

  const fileSuffix = resultMode === 'midterm' ? 'Midterm' : (resultMode === 'final' ? 'Final_Test' : 'Full_Term');
  doc.save(`${currentRecord.className}_${currentRecord.termName}_${fileSuffix}_Summary.pdf`.replace(/\s+/g, '_'));
}

export function generateExportData(currentRecord: ClassRecord, currentLevel: Level, resultMode: 'full' | 'midterm' | 'final', students?: Student[], detailMode: 'subjects' | 'categories' | 'both' = 'subjects') {
  const isMidtermCategory = (name: string) => {
    const n = name.toUpperCase();
    return n.includes("MID-TERM") || n.includes("MID TERM") || n.includes("MIDTERM") || n.includes("MID EXAM") || n.includes("MID TEST");
  };

  const isFinalCategory = (name: string) => {
    const n = name.toUpperCase();
    return n.includes("FINAL");
  };

  const activeStudents = (students?.length ? students : (currentRecord.students || [])).filter(s => !s.isHidden);

  // Pre-calculate final scores and ranks
  const scores = activeStudents.map(student => {
    const subjectAvgs: Record<string, number> = {};
    const subjectWtds: Record<string, number> = {};
    let totalWeightedSum = 0;
    let totalWeightSum = 0;

    currentLevel.subjects.forEach(subject => {
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
            } else if (currentRecord.settings?.treatBlanksAsZero) {
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

      subjectAvgs[subject.name] = subjectPercentage;
      
      const subjectTargetWeight = resultMode === 'midterm' 
        ? (subject.midtermTargetWeight ?? subject.targetWeight ?? 100)
        : resultMode === 'final'
          ? (subject.finalTargetWeight ?? subject.targetWeight ?? 100)
          : (subject.targetWeight ?? 100);

      subjectWtds[subject.name] = (subjectPercentage / 100) * subjectTargetWeight;

      const divideByAll = currentRecord.settings?.divideByAllSubjects !== false;

      if (divideByAll || hasSubjectScore) {
        totalWeightSum += subjectTargetWeight;
      }
      if (hasSubjectScore) {
        totalWeightedSum += subjectWtds[subject.name];
      }
    });

    const effectiveDivisor = resultMode === 'midterm'
      ? (currentLevel?.midtermCustomDivisor ? currentLevel.midtermCustomDivisor * 100 : totalWeightSum)
      : resultMode === 'final'
        ? (currentLevel?.finalCustomDivisor ? currentLevel.finalCustomDivisor * 100 : totalWeightSum)
        : (currentLevel?.customDivisor ? currentLevel.customDivisor * 100 : totalWeightSum);

    const performancePct = effectiveDivisor > 0 ? (totalWeightedSum / effectiveDivisor) * 100 : 0;
    return { id: student.id, finalScore: performancePct, subjectAvgs, subjectWtds };
  });

  const sortedScores = [...scores].sort((a, b) => b.finalScore - a.finalScore);
  
  return activeStudents.map((student, index) => {
    const metrics = scores.find(s => s.id === student.id)!;
    const finalScore = metrics.finalScore;
    
    const computedAttendance = currentRecord.settings?.showAttendance !== false
      ? `${calculateAttendancePercentage(student, currentRecord.settings || ({} as any)).toFixed(2)}%` 
      : student.attendance;

    const status = calculateStatus(finalScore, resultMode, currentRecord.settings, computedAttendance, currentLevel);

    const row: any = {
      'No': index + 1,
      'Student\'s Full Name': currentRecord.settings?.hideStudentNames ? `Student ${index + 1}` : student.name,
      'Sex': student.sex === 'Female' ? 'F' : 'M',
    };

    if (resultMode === 'full') {
      const attRaw = computedAttendance ? computedAttendance.trim() : '';
      if (attRaw) {
        const cleaned = attRaw.replace('%', '');
        const parsed = parseFloat(cleaned);
        row['Attnd'] = isNaN(parsed) ? attRaw : parsed;
      } else {
        row['Attnd'] = 100;
      }
    }

    currentLevel.subjects.forEach(subject => {
      // Add Subject column if requested
      if (detailMode === 'subjects' || detailMode === 'both') {
        if (resultMode === 'full') {
          const subjectTargetWeight = subject.targetWeight ?? 100;
          const key = `${subject.name} (${subjectTargetWeight}%)`;
          const contribution = metrics.subjectWtds[subject.name] || 0;
          row[key] = parseFloat(contribution.toFixed(1));
        } else {
          row[`${subject.name}`] = parseFloat((metrics.subjectAvgs[subject.name] || 0).toFixed(1));
        }
      }

      // Add Category columns if requested
      if (detailMode === 'categories' || detailMode === 'both') {
        subject.categories.forEach(cat => {
          if (resultMode === 'midterm' && (cat.midtermWeight === undefined || cat.midtermWeight <= 0)) return;
          if (resultMode === 'final' && (cat.finalWeight === undefined || cat.finalWeight <= 0)) return;

          let earned = 0;
          let max = 0;
          let hasAny = false;
          for (let i = 0; i < cat.itemCount; i++) {
            const s = student.scores[`${cat.id}_${i}`];
            if (typeof s === 'number') {
              earned += s;
              max += (cat.itemMaxScores?.[i] || 100);
              hasAny = true;
            } else if (currentRecord.settings?.treatBlanksAsZero) {
              earned += 0;
              max += (cat.itemMaxScores?.[i] || 100);
              hasAny = true;
            }
          }
          const score = max > 0 ? (earned / max) * 100 : 0;
          
          const weight = resultMode === 'midterm' 
            ? (cat.midtermWeight || 0)
            : resultMode === 'final'
              ? (cat.finalWeight || 0)
              : cat.weight;

          let label = detailMode === 'both' ? `${subject.name}: ${cat.name}` : cat.name;
          if (weight > 0) {
            label += ` (${weight}%)`;
          }
          row[label] = parseFloat(score.toFixed(1));
        });
      }
    });

    row['Total'] = parseFloat(finalScore.toFixed(2));
    row['Grade'] = status;

    return row;
  });
}

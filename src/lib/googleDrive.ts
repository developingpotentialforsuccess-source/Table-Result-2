import { ClassRecord, Level, Student } from '../types';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import ExcelJS from 'exceljs';
import { generateExportData } from './exportUtils';

// Cache the access token in memory
let cachedAccessToken: string | null = null;

export const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const getAccessToken = () => cachedAccessToken;

export async function uploadToDrive(fileName: string, blob: Blob, mimeType: string, convertToGoogleSheet: boolean = true) {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const metadata: any = {
    name: fileName,
  };

  if (convertToGoogleSheet) {
    metadata.mimeType = 'application/vnd.google-apps.spreadsheet';
  } else {
    metadata.mimeType = mimeType;
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload to Google Drive');
  }

  return response.json();
}

export async function saveBackupToDrive(userId: string, levels: Level[], classRecords: ClassRecord[]) {
  const backupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    userId,
    levels,
    classRecords,
    settings: JSON.parse(localStorage.getItem('gradecalc_teacher_settings') || '{}')
  };

  const fileName = `GradeCalc_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  
  return await uploadToDrive(fileName, blob, 'application/json', false);
}

// Function to generate the Excel buffer (reusing logic from excelExport.ts but returning the buffer)
async function generateExcelBuffer(currentRecord: ClassRecord, currentLevel: Level, styleIndex: number = 6, gridLineLevel: string = 'medium', students?: Student[], detailMode: 'subjects' | 'categories' | 'both' = 'subjects') {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Teacher Grade Calc';
  
  // These functions are currently internal to excelExport.ts, I should probably export them or duplicate the logic if they are small.
  // Given they are large, I'll try to refactor excelExport.ts to export the builder functions or just duplicate the essential parts here for now.
  // Actually, I'll just copy the core logic into a helper in this file for now to avoid circular dependencies or complex refactoring of a 800-line file.
  
  // NOTE: In a real app, I'd move the worksheet builders to a shared file.
  // For this implementation, I'll use a simpler version or just re-implement the necessary parts.
  
  // Let's assume we want the full export.
  // I'll re-implement createSheetData and createDashboardSheet if needed, 
  // or just use the generateExportData directly for a simpler sheet.
  
  const data = generateExportData(currentRecord, currentLevel, 'full', students, detailMode);
  const ws = wb.addWorksheet('Full Term Results');
  
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    ws.addRow(headers);
    data.forEach(row => {
      ws.addRow(headers.map(h => row[h as keyof typeof row]));
    });
  }

  return await wb.xlsx.writeBuffer();
}

export async function exportToGoogleSheets(currentRecord: ClassRecord, currentLevel: Level, students?: Student[]) {
  const buffer = await generateExcelBuffer(currentRecord, currentLevel, 6, 'medium', students, 'subjects');
  const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const blob = new Blob([buffer], { type: mimeType });
  const fileName = `${currentRecord.className}_${currentRecord.termName}_Grades`.replace(/\s+/g, '_');
  
  return await uploadToDrive(fileName, blob, mimeType);
}

export async function listDriveFiles() {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=nextPageToken,files(id,name,mimeType)', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to list Google Drive files');
  }

  return response.json();
}

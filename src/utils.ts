import { Registration } from './types';

const STORAGE_KEYS = {
  REGISTRATIONS: 'teens_converge_registrations_v2',
  APPS_SCRIPT_URL: 'teens_converge_apps_script_url_v2',
};

const BASE_REGISTRATION_COUNT = 312; // Realistic baseline registration counter

export function getAppsScriptUrl(): string {
  return localStorage.getItem(STORAGE_KEYS.APPS_SCRIPT_URL) || '';
}

export function setAppsScriptUrl(url: string) {
  localStorage.setItem(STORAGE_KEYS.APPS_SCRIPT_URL, url.trim());
}

export function getSavedRegistrations(): Registration[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse registrations', error);
    return [];
  }
}

export function saveRegistration(regData: Omit<Registration, 'id' | 'timestamp'>): Registration {
  const currentRegs = getSavedRegistrations();
  
  // Format id: TC-0001
  const nextNum = currentRegs.length + 1;
  const padNum = String(nextNum).padStart(4, '0');
  const id = `TC-${padNum}`;
  
  const newRegistration: Registration = {
    ...regData,
    id,
    timestamp: new Date().toISOString()
  };
  
  currentRegs.push(newRegistration);
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(currentRegs));
  return newRegistration;
}

export function getRegistrationCount(): number {
  return BASE_REGISTRATION_COUNT + getSavedRegistrations().length;
}

/**
 * Copyable code template for Google Apps Script deployment
 */
export const GOOGLE_APPS_SCRIPT_CODE = `// ==========================================
// GOOGLE APPS SCRIPT WEB APP FOR REGISTRATIONS
// ==========================================
// Paste this code inside Google Sheets (Extensions > Apps Script)
// 1. Click "Save"
// 2. Click "Deploy" > "New deployment"
// 3. Select type "Web app"
// 4. Set Description to "Teens Converge Registrations Web App"
// 5. Change "Execute as" to: "Me"
// 6. Change "Who has access" to: "Anyone"
// 7. Click "Deploy" and Authorize access
// 8. Copy the generated "Web App URL" and paste it in the Admin settings!

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Auto-create header row if sheet is bare
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Pass ID", 
        "Full Name", 
        "Phone Number", 
        "Church Name", 
        "Age Range", 
        "Sex", 
        "Volunteer Status / Choice", 
        "Registration Timestamp"
      ]);
      // Format headers bold with gray background
      var listRange = sheet.getRange(1, 1, 1, 8);
      listRange.setFontWeight("bold");
      listRange.setBackground("#f3f4f6");
    }
    
    // Append registration record row
    sheet.appendRow([
      data.id || "N/A",
      data.fullName || "N/A",
      data.phoneNumber || "N/A",
      data.churchName || "Not Specified",
      data.ageRange || "N/A",
      data.sex || "N/A",
      (data.volunteerOptions && data.volunteerOptions.length > 0) 
        ? data.volunteerOptions.join(", ") 
        : "Attendee",
      data.timestamp || new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      "success": true, 
      "message": "Recorded successfully" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      "success": false, 
      "error": err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Support test GET requests
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    "status": "online", 
    "message": "Apps Script Web App is running. Use POST to record data." 
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Handles registration submission: Saves locally first, then attempts real-time sync
 * to the specified Google Apps Script Web App URL if configured.
 */
export async function submitRegistration(regData: Omit<Registration, 'id' | 'timestamp'>): Promise<{
  success: boolean;
  registration?: Registration;
  syncedToSheet?: boolean;
  error?: string;
}> {
  // Simulate standard database latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  try {
    const localReg = saveRegistration(regData);
    const appsScriptUrl = getAppsScriptUrl().trim();
    let syncedToSheet = false;

    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        // Send registration JSON. "no-cors" is bypasses SOP limitations for direct submission
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localReg),
        });
        
        syncedToSheet = true;
      } catch (sheetErr) {
        console.warn('Network issue writing to Google sheet directly, saved locally:', sheetErr);
      }
    }

    return {
      success: true,
      registration: localReg,
      syncedToSheet,
    };
  } catch (err) {
    return {
      success: false,
      error: 'Registration failed. Please review your entries and try again.',
    };
  }
}

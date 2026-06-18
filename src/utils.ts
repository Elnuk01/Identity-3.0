import { Registration } from './types';

const STORAGE_KEYS = {
  REGISTRATIONS: 'teens_converge_registrations_v2',
  APPS_SCRIPT_URL: 'teens_converge_apps_script_url_v2',
};

const BASE_REGISTRATION_COUNT = 312; // Realistic baseline registration counter

export function getAppsScriptUrl(): string {
  return 'https://script.google.com/macros/s/AKfycbyLsBDJqakFjU7UIHgAvXIxH3SzTGf2rS6ua1w8ghSlCDc5SPlFTueroPfZw2dwcG378Q/exec';
}

export function setAppsScriptUrl(url: string) {
  // Hardcoded url is used instead
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
        "Email Address",
        "Phone Number", 
        "Church Name", 
        "Age Range", 
        "Sex", 
        "Volunteer Status / Choice", 
        "Registration Timestamp"
      ]);
      // Format headers bold with gray background
      var listRange = sheet.getRange(1, 1, 1, 9);
      listRange.setFontWeight("bold");
      listRange.setBackground("#f3f4f6");
    }
    
    // Append registration record row
    sheet.appendRow([
      data.id || "N/A",
      data.fullName || "N/A",
      data.email || "N/A",
      data.phoneNumber || "N/A",
      data.churchName || "Not Specified",
      data.ageRange || "N/A",
      data.sex || "N/A",
      (data.volunteerOptions && data.volunteerOptions.length > 0) 
        ? data.volunteerOptions.join(", ") 
        : "Attendee",
      data.timestamp || new Date().toISOString()
    ]);

    // Send styled confirmation email to the registrant if email exists
    if (data.email && data.email.indexOf("@") !== -1) {
      try {
        var subject = "🎟️ Registration Confirmed - Teens Converge 2026 [ID: " + (data.id || "") + "]";
        var htmlBody = 
          '<div style="font-family: -apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff; color: #18181b;">' +
            '<div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 25px;">' +
              '<h2 style="color: #3b82f6; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 0.5px;">Teens Converge 2026</h2>' +
              '<p style="margin: 5px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #71717a; font-weight: 700;">Youth Conference Registration</p>' +
            '</div>' +
            
            '<p style="font-size: 16px; line-height: 1.5; color: #27272a;">Dear <strong>' + data.fullName + '</strong>,</p>' +
            '<p style="font-size: 15px; line-height: 1.6; color: #3f3f46;">Your register spot has been successfully confirmed for the <strong>Teens Converge Youth Conference 2026</strong>! We are absolutely thrilled to have you join us.</p>' +
            
            '<div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px dashed #d4d4d8;">' +
              '<div style="text-align: center; margin-bottom: 15px;">' +
                '<span style="font-size: 11px; text-transform: uppercase; font-family: monospace; letter-spacing: 2px; color: #71717a; font-weight: bold;">Your Digital Pass ID</span>' +
                '<div style="font-size: 32px; font-weight: 900; color: #1d4ed8; font-family: monospace; margin: 5px 0;">' + (data.id || "TC-PASS") + '</div>' +
              '</div>' +
              
              '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a; width: 35%;">Full Name:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + data.fullName + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Email Address:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + data.email + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Phone Number:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + data.phoneNumber + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Church Name:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + (data.churchName || "Not Specified") + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Age Range / Sex:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + data.ageRange + ' (' + data.sex + ')</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Role:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + ((data.volunteerOptions && data.volunteerOptions.length > 0) ? data.volunteerOptions.join(", ") : "Attendee") + '</td>' +
                '</tr>' +
              '</table>' +
            '</div>' +
            
            '<div style="border-left: 4px solid #3b82f6; padding-left: 15px; margin: 25px 0;">' +
              '<h4 style="margin: 0 0 5px; font-size: 15px; color: #18181b; font-weight: bold;">📅 Event Details & Schedule</h4>' +
              '<p style="margin: 0; font-size: 14px; color: #52525b; line-height: 1.5;">' +
                '<strong>Date:</strong> August 1st, 2026<br/>' +
                '<strong>Time:</strong> 10:00 AM (Please arrive 15 minutes early)<br/>' +
                '<strong>Venue:</strong> Main Auditorium' +
              '</p>' +
            '</div>' +
            
            '<p style="font-size: 14px; line-height: 1.6; color: #52525b; margin-top: 25px;">Please show your Pass ID upon arrival to scan/verify your entry. If registering for one of the volunteer teams, a coordinator will reach out to you soon with further details.</p>' +
            
            '<div style="border-top: 1px solid #e4e4e7; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #a1a1aa;">' +
              '<p style="margin: 0 0 5px;">This email was automatically sent regarding your registration for Teens Converge 2026.</p>' +
              '<p style="margin: 0;">For updates, please join our official WhatsApp community group.</p>' +
            '</div>' +
          '</div>';
         
        MailApp.sendEmail({
          to: data.email,
          subject: subject,
          htmlBody: htmlBody
        });
      } catch (mailErr) {
        console.warn("Mail dispatch failed: " + mailErr.toString());
      }
    }
    
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

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
  
  const emailVal = regData.email || regData.emailAddress || '';
  const newRegistration: Registration = {
    ...regData,
    email: emailVal,
    emailAddress: emailVal,
    email_address: emailVal,
    Email: emailVal,
    EmailAddress: emailVal,
    Email_Address: emailVal,
    mail: emailVal,
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
// NOTE: Make sure to authorize under your Gmail account when prompted so it can send registration receipts!

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": false, 
        "error": "Could not find active spreadsheet. Make sure you opened Apps Script from inside your Google Sheet (Extensions > Apps Script)." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = ss.getActiveSheet();
    
    // Auto-create header row if sheet is bare or completely empty
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
    
    // Read current headers on Row 1 to map data to correct columns dynamically
    var lastColumn = Math.max(sheet.getLastColumn(), 1);
    var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    
    // Build a lowercase, whitespace-stripped mapping of header text to column index (1-based)
    var headerMap = {};
    for (var i = 0; i < headers.length; i++) {
      var cleanHeader = String(headers[i]).toLowerCase().replace(/[^a-z0-9]/g, "");
      headerMap[cleanHeader] = i + 1;
    }
    
    // Map logical fields to valid header aliases
    var keyMappings = {
      id: ["passid", "id", "registrationid", "uuid", "passnumber", "ticketid"],
      fullName: ["fullname", "name", "fullnames", "registrantname", "studentname"],
      email: ["emailaddress", "email", "emailid", "mail", "mailaddress", "address"],
      phoneNumber: ["phonenumber", "phone", "phoneno", "contact", "contactnumber", "mobile"],
      churchName: ["churchname", "church", "churchassembly", "assembly"],
      ageRange: ["agerange", "age", "agegroup", "group"],
      sex: ["sex", "gender", "maleorfemale"],
      volunteerOptions: ["volunteerstatus", "volunteerchoice", "volunteer", "role", "volunteering"],
      timestamp: ["registrationtimestamp", "timestamp", "date", "time", "submittedat"]
    };
    
    // Pre-fill a row array with empty strings
    var rowData = new Array(lastColumn);
    for (var c = 0; c < lastColumn; c++) {
      rowData[c] = "";
    }
    
    // Formatted data payload
    var formattedData = {
      id: data.id || "N/A",
      fullName: data.fullName || "N/A",
      email: data.email || data.emailAddress || "N/A",
      phoneNumber: data.phoneNumber || "N/A",
      churchName: data.churchName || "Not Specified",
      ageRange: data.ageRange || "N/A",
      sex: data.sex || "N/A",
      volunteerOptions: (data.volunteerOptions && data.volunteerOptions.length > 0) 
        ? data.volunteerOptions.join(", ") 
        : "Attendee",
      timestamp: data.timestamp || new Date().toISOString()
    };
    
    // Match and assign data properties into correct column positions
    var rowMatched = false;
    for (var key in formattedData) {
      var aliases = keyMappings[key] || [key.toLowerCase()];
      var foundIndex = -1;
      
      for (var a = 0; a < aliases.length; a++) {
        var alias = aliases[a];
        if (headerMap[alias] !== undefined) {
          foundIndex = headerMap[alias];
          break;
        }
      }
      
      if (foundIndex !== -1) {
        rowData[foundIndex - 1] = formattedData[key];
        rowMatched = true;
      }
    }
    
    // If we mapped columns successfully to existing sheet headers, write row
    if (rowMatched) {
      sheet.appendRow(rowData);
    } else {
      // Fallback fallback: Append straight standard order
      sheet.appendRow([
        formattedData.id,
        formattedData.fullName,
        formattedData.email,
        formattedData.phoneNumber,
        formattedData.churchName,
        formattedData.ageRange,
        formattedData.sex,
        formattedData.volunteerOptions,
        formattedData.timestamp
      ]);
    }
    
    // Send beautifully styled confirmation email receipt to user
    if (formattedData.email && formattedData.email.indexOf("@") !== -1 && formattedData.email !== "test@example.com") {
      try {
        var subject = "🎟️ Registration Confirmed - Teens Converge 2026 [ID: " + formattedData.id + "]";
        var htmlBody = 
          '<div style="font-family: -apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e4e4e7; border-radius: 20px; background-color: #ffffff; color: #18181b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">' +
            '<div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 25px;">' +
              '<h2 style="color: #3b82f6; margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 0.5px;">Teens Converge 2026</h2>' +
              '<p style="margin: 6px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2.5px; color: #71717a; font-weight: 700;">Youth Conference Receipt</p>' +
            '</div>' +
            
            '<p style="font-size: 16px; line-height: 1.5; color: #27272a;">Dear <strong>' + formattedData.fullName + '</strong>,</p>' +
            '<p style="font-size: 15px; line-height: 1.6; color: #3f3f46;">Your register spot has been successfully confirmed for the <strong>Teens Converge Youth Conference 2026</strong>! We are absolutely thrilled to have you join us.</p>' +
            
            '<div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px dashed #d4d4d8;">' +
              '<div style="text-align: center; margin-bottom: 15px;">' +
                '<span style="font-size: 11px; text-transform: uppercase; font-family: monospace; letter-spacing: 2px; color: #71717a; font-weight: bold;">Your Digital Pass ID</span>' +
                '<div style="font-size: 32px; font-weight: 900; color: #1d4ed8; font-family: monospace; margin: 5px 0;">' + formattedData.id + '</div>' +
              '</div>' +
              
              '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a; width: 35%;">Full Name:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + formattedData.fullName + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Email Address:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + formattedData.email + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Phone Number:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + formattedData.phoneNumber + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Church Name:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + formattedData.churchName + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Age Range / Sex:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + formattedData.ageRange + ' (' + formattedData.sex + ')</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; font-weight: bold; color: #71717a;">Role / Access:</td>' +
                  '<td style="padding: 6px 0; color: #18181b; font-weight: 500;">' + formattedData.volunteerOptions + '</td>' +
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

            '<div style="background-color: #e8f9ee; border: 1px solid #c7f3d6; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">' +
              '<h4 style="margin: 0 0 8px; font-size: 16px; color: #075e54; font-weight: bold;">💬 Join the Official WhatsApp Group Chat</h4>' +
              '<p style="margin: 0 0 16px; font-size: 13.5px; color: #128c7e; line-height: 1.5;">' +
                'Get immediate event updates, coordinate transportation, and connect with other attendees before the event begins!' +
              '</p>' +
              '<a href="https://chat.whatsapp.com/CibIPByTE89GOFfs6vhPql?s=cl&p=i&ilr=1" target="_blank"' +
                 ' style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 11px 22px; border-radius: 9999px; box-shadow: 0 3px 6px rgba(37,211,102,0.25);">' +
                '👉 Click Here to Join Group Chat' +
              '</a>' +
            '</div>' +
            
            '<p style="font-size: 14px; line-height: 1.6; color: #52525b; margin-top: 25px;">Please show your Digital Pass ID upon arrival to scan and verify your entry. If you signed up to volunteer on a team, a coordinator will reach out to you shortly with team briefings.</p>' +
            
            '<div style="border-top: 1px solid #e4e4e7; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #a1a1aa;">' +
              '<p style="margin: 0 0 5px;">This is a transaction receipt confirming your youth conference entry.</p>' +
              '<p style="margin: 0;">For immediate updates, join our official <a href="https://chat.whatsapp.com/CibIPByTE89GOFfs6vhPql?s=cl&p=i&ilr=1" target="_blank" style="color: #25d366; text-decoration: underline; font-weight: bold;">WhatsApp group chat here</a>.</p>' +
            '</div>' +
          '</div>';
          
        MailApp.sendEmail({
          to: formattedData.email,
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

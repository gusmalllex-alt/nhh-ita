// --- ตั้งค่า Configuration ---
const FOLDER_ID = "10Sf4TgE-PF7P_k_2bOO1OATVcoVKcyQD";
const SHEET_ID = "1IBISX0fM5CUPUsxf_4MZirzSfedg2XwYMVRXRnMQKL8";
const SHEET_DATA_NAME = "ITA_Data";
const SHEET_USERS_NAME = "ITA_Users";
const SHEET_MOIT_NAME = "ITA_MOIT";

// --- Document Management ---

function getData() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_DATA_NAME);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const items = data.slice(1).map((row, index) => {
      let ts = row[0];
      if (ts instanceof Date) ts = ts.toISOString();

      return {
        id: index + 2,
        timestamp: ts,
        fiscalYear: row[1],
        moit: row[2],
        quarter: row[3],
        title: row[4],
        description: row[5],
        fileName: row[6],
        url: row[7],
        uploader: row[8]
      };
    });

    return items; 
  } catch (e) {
    Logger.log("Error in getData: " + e.toString());
    return [];
  }
}

function uploadFile(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const decoded = Utilities.base64Decode(data.file);
    const blob = Utilities.newBlob(decoded, data.mimeType, data.filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = file.getUrl();

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_DATA_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_DATA_NAME);
      sheet.appendRow(["Timestamp", "Year", "MOIT", "Quarter", "Title", "Description", "File Name", "File URL", "Uploaded By"]);
    }

    const timestamp = new Date();
    sheet.appendRow([
      timestamp,
      data.fiscalYear,
      data.moit,
      data.quarter,
      data.title,
      data.description,
      data.filename,
      fileUrl,
      data.user || "Anonymous"
    ]);

    return { status: "success" };

  } catch (error) {
    return { status: "error", message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function deleteItem(id) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_DATA_NAME);
    if (id < 2 || id > sheet.getLastRow()) return { status: 'error', message: 'ไม่พบเอกสาร' };
    sheet.deleteRow(id);
    return { status: 'success' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function editItem(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_DATA_NAME);
    const row = data.id; 
    if (row < 2 || row > sheet.getLastRow()) return { status: 'error', message: 'ไม่พบเอกสาร' };

    sheet.getRange(row, 2).setValue(data.fiscalYear);
    sheet.getRange(row, 3).setValue(data.moit);
    sheet.getRange(row, 4).setValue(data.quarter); 
    sheet.getRange(row, 5).setValue(data.title);
    sheet.getRange(row, 6).setValue(data.description);
    
    if (data.file) {
        const folder = DriveApp.getFolderById(FOLDER_ID);
        const decoded = Utilities.base64Decode(data.file);
        const blob = Utilities.newBlob(decoded, data.mimeType, data.filename);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const fileUrl = file.getUrl();
        sheet.getRange(row, 7).setValue(data.filename);
        sheet.getRange(row, 8).setValue(fileUrl);
    }
    sheet.getRange(row, 9).setValue(data.user + " (แก้ไข)");

    return { status: 'success' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// --- User Management ---

function getUsers() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_USERS_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_USERS_NAME);
      sheet.appendRow(["Username", "Password", "Name", "Role", "Status"]); 
      sheet.appendRow(["admin", "nonghan", "ผู้ดูแลระบบ (Admin)", "admin", "approved"]);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const users = data.slice(1).map((row, index) => ({
      id: index + 2,
      username: String(row[0]),
      password: String(row[1]),
      name: String(row[2]),
      role: String(row[3]) || "staff",
      status: String(row[4] || "approved") 
    }));

    return users;
  } catch (e) {
    return [];
  }
}

function registerUser(userData) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_USERS_NAME);
    
    const data = sheet.getDataRange().getValues();
    const exists = data.slice(1).some(row => String(row[0]) === userData.username);
    if (exists) return { status: 'error', message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' };

    sheet.appendRow([
      userData.username,
      userData.password,
      userData.name,
      "viewer",
      "pending"
    ]);
    return { status: 'success' };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function addUser(userData) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_USERS_NAME);
    
    const data = sheet.getDataRange().getValues();
    const exists = data.slice(1).some(row => String(row[0]) === userData.username);
    if (exists) return { status: 'error', message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' };

    sheet.appendRow([
      userData.username,
      userData.password,
      userData.name,
      userData.role || "staff",
      "approved"
    ]);
    return { status: 'success' };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function approveUser(username) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_USERS_NAME);
    const data = sheet.getDataRange().getValues();
    
    let rowToUpdate = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === username) {
        rowToUpdate = i + 1;
        break;
      }
    }

    if (rowToUpdate > 0) {
      sheet.getRange(rowToUpdate, 5).setValue("approved");
      return { status: 'success' };
    } else {
      return { status: 'error', message: 'ไม่พบผู้ใช้งาน' };
    }
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function deleteUser(username) {
  if (username === 'admin') return { status: 'error', message: 'ไม่สามารถลบ Admin หลักได้' };
  
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_USERS_NAME);
    const data = sheet.getDataRange().getValues();
    
    let rowToDelete = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === username) {
        rowToDelete = i + 1;
        break;
      }
    }

    if (rowToDelete > 0) {
      sheet.deleteRow(rowToDelete);
      return { status: 'success' };
    } else {
      return { status: 'error', message: 'ไม่พบผู้ใช้งาน' };
    }
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function updateUserRole(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_USERS_NAME);
    if (!sheet) return { status: 'error', message: 'ไม่พบ sheet ผู้ใช้' };
    
    const userData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (String(userData[i][0]) === data.username) {
        // Update role (column index 4)
        sheet.getRange(i + 1, 4).setValue(data.role);
        return { status: 'success' };
      }
    }
    
    return { status: 'error', message: 'ไม่พบผู้ใช้งาน' };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function updateUser(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_USERS_NAME);
    if (!sheet) return { status: 'error', message: 'ไม่พบ sheet ผู้ใช้' };
    
    const userData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (String(userData[i][0]) === data.username) {
        // Update name (column index 2)
        sheet.getRange(i + 1, 3).setValue(data.name);
        return { status: 'success' };
      }
    }
    
    return { status: 'error', message: 'ไม่พบผู้ใช้งาน' };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function changePassword(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_USERS_NAME);
    if (!sheet) return { status: 'error', message: 'ไม่พบ sheet ผู้ใช้' };
    
    const userData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (String(userData[i][0]) === data.username) {
        // Update password (column index 2)
        sheet.getRange(i + 1, 2).setValue(data.password);
        return { status: 'success' };
      }
    }
    
    return { status: 'error', message: 'ไม่พบผู้ใช้งาน' };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// --- MOIT Management ---

function getMoits() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_MOIT_NAME);
    if (!sheet) {
      // Create default MOIT sheet if it doesn't exist
      sheet = ss.insertSheet(SHEET_MOIT_NAME);
      sheet.appendRow(["ID", "Name", "Created At"]);
      // Add default MOIT 1-22
      for (let i = 1; i <= 22; i++) {
        sheet.appendRow([`MOIT ${i}`, `MOIT ${i}`, new Date()]);
      }
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    return data.slice(1).map((row, index) => ({
      id: row[0],
      name: row[1],
      createdAt: row[2] ? row[2].toISOString() : new Date().toISOString()
    }));
  } catch(e) {
    Logger.log("Error in getMoits: " + e.toString());
    return [];
  }
}

function addMoit(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_MOIT_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_MOIT_NAME);
      sheet.appendRow(["ID", "Name", "Created At"]);
    }

    const existingData = sheet.getDataRange().getValues();
    const exists = existingData.slice(1).some(row => String(row[0]) === data.id);
    if (exists) return { status: 'error', message: 'MOIT ID นี้มีอยู่แล้ว' };

    sheet.appendRow([data.id, data.name, new Date()]);
    return { status: 'success' };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function deleteMoit(moitId) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_MOIT_NAME);
    if (!sheet) return { status: 'error', message: 'ไม่พบ sheet MOIT' };

    const data = sheet.getDataRange().getValues();
    let rowToDelete = 0;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === moitId) {
        rowToDelete = i + 1;
        break;
      }
    }

    if (rowToDelete > 0) {
      sheet.deleteRow(rowToDelete);
      return { status: 'success' };
    } else {
      return { status: 'error', message: 'ไม่พบ MOIT' };
    }
  } catch(e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// --- Banner Management ---

function getBanner() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('BANNER_URL') || '';
  } catch(e) { 
    return ''; 
  }
}

function uploadBanner(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const decoded = Utilities.base64Decode(data.file);
    const blob = Utilities.newBlob(decoded, data.mimeType, data.filename);
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Convert to view URL suitable for <img> tag
    const fileId = file.getId();
    const viewUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
    
    const props = PropertiesService.getScriptProperties();
    props.setProperty('BANNER_URL', viewUrl);
    
    return { status: "success", url: viewUrl };
  } catch (error) {
    return { status: "error", message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

// --- CORS Support for Next.js Integration ---

function doPost(e) {
  const functionName = e.parameter.function;
  const data = JSON.parse(e.postData.contents);
  
  let result;
  
  switch(functionName) {
    case 'getData':
      result = getData();
      break;
    case 'uploadFile':
      result = uploadFile(data);
      break;
    case 'deleteItem':
      result = deleteItem(data.id);
      break;
    case 'editItem':
      result = editItem(data);
      break;
    case 'getUsers':
      result = getUsers();
      break;
    case 'registerUser':
      result = registerUser(data);
      break;
    case 'addUser':
      result = addUser(data);
      break;
    case 'approveUser':
      result = approveUser(data.username);
      break;
    case 'deleteUser':
      result = deleteUser(data.username);
      break;
    case 'updateUserRole':
      result = updateUserRole(data);
      break;
    case 'updateUser':
      result = updateUser(data);
      break;
    case 'changePassword':
      result = changePassword(data);
      break;
    case 'getMoits':
      result = getMoits();
      break;
    case 'addMoit':
      result = addMoit(data);
      break;
    case 'deleteMoit':
      result = deleteMoit(data.id);
      break;
    case 'getBanner':
      result = getBanner();
      break;
    case 'uploadBanner':
      result = uploadBanner(data);
      break;
    default:
      result = { status: 'error', message: 'Unknown function' };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const functionName = e.parameter.function;
  let result;
  
  switch(functionName) {
    case 'getData':
      result = { data: getData() };
      break;
    case 'getUsers':
      result = { data: getUsers() };
      break;
    case 'getBanner':
      result = { data: getBanner() };
      break;
    default:
      result = { data: [] };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

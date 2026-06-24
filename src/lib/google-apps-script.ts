// Google Apps Script Service Integration
// This service connects to your Google Apps Script for document and user management

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzjvrIy3eq8eopg3qPgYQvk3xm1abW7tLqJE_osZ24s3Nt6R7mvTvSLctzs0pDfOuV9CA/exec';

export interface Document {
  id: number;
  timestamp: string;
  fiscalYear: string | number;
  moit: string;
  quarter: string;
  title: string;
  description: string;
  fileName: string;
  url: string;
  uploader: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
  status: string;
}

export interface UploadData {
  fiscalYear: string;
  moit: string;
  quarter: string;
  title: string;
  description: string;
  file: string; // base64
  mimeType: string;
  filename: string;
  user?: string;
}

export interface EditData extends UploadData {
  id: number;
}

export interface UserData {
  username: string;
  password: string;
  name: string;
  role?: string;
}

// Call Google Apps Script function with CORS enabled
// This requires deploying the script as a Web App with "Anyone" access
async function callScriptWithCORS(functionName: string, data: unknown = {}) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ function: functionName, ...(data as Record<string, unknown>) }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    return { status: 'error', message: String(error) };
  }
}

// Document Management
// --- In-memory Caching ---
let cachedDocuments: Document[] | null = null;
let cachedDocumentsTime = 0;
let cachedMoits: any = null;
let cachedMoitsTime = 0;
const CACHE_TTL = 60000; // 60 seconds

export function clearGasCache() {
  cachedDocuments = null;
  cachedMoits = null;
}

export async function getDocuments(forceRefresh = false): Promise<Document[]> {
  if (!forceRefresh && cachedDocuments && Date.now() - cachedDocumentsTime < CACHE_TTL) {
    console.log('getDocuments: returning cached data');
    return cachedDocuments;
  }
  try {
    console.log('getDocuments: calling GAS directly');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('Timeout'), 60000); // 60 second timeout

    const response = await fetch(`${SCRIPT_URL}?function=getData`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const result = await response.json();
    const items = result.data || result || [];
    const finalItems = Array.isArray(items) ? items : [];
    
    cachedDocuments = finalItems;
    cachedDocumentsTime = Date.now();
    
    return finalItems;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return cachedDocuments || [];
  }
}

export async function uploadDocument(data: UploadData): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('uploadFile', data);
}

export async function deleteDocument(id: number): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('deleteItem', { id });
}

export async function editDocument(data: EditData): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('editItem', data);
}

// User Management
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${SCRIPT_URL}?function=getUsers`);
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function registerUser(userData: UserData): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('registerUser', userData);
}

export async function addUser(userData: UserData): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('addUser', userData);
}

export async function approveUser(username: string): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('approveUser', { username });
}

export async function deleteUser(username: string): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('deleteUser', { username });
}

export async function updateUserRole(data: { username: string; role: string }): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('updateUserRole', data);
}

export async function updateUser(data: { username: string; name: string }): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('updateUser', data);
}

export async function changePassword(data: { username: string; password: string }): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('changePassword', data);
}

export async function getMoits(forceRefresh = false): Promise<{ id: string; name: string; createdAt: string }[]> {
  if (!forceRefresh && cachedMoits && Date.now() - cachedMoitsTime < CACHE_TTL) {
    return cachedMoits;
  }
  
  try {
    const result = await callScriptWithCORS('getMoits', {});
    
    if (Array.isArray(result)) {
      cachedMoits = result;
      cachedMoitsTime = Date.now();
      return result;
    }
    
    console.error('getMoits returned non-array:', result);
    return cachedMoits || [];
  } catch (error) {
    console.error('Error fetching moits:', error);
    return cachedMoits || [];
  }
}

export async function addMoit(data: { id: string; name: string }): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('addMoit', data);
}

export async function deleteMoit(id: string): Promise<{ status: string; message?: string }> {
  return callScriptWithCORS('deleteMoit', { id });
}

// Authentication
export async function authenticateUser(username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password && u.status === 'approved');
  
  if (user) {
    return { success: true, user };
  } else {
    return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือบัญชียังไม่ได้รับอนุมัติ' };
  }
}

// Banner Management
export async function getBanner(): Promise<string> {
  try {
    const response = await fetch(`${SCRIPT_URL}?function=getBanner`);
    const result = await response.json();
    return result.data || '';
  } catch (error) {
    console.error('Error fetching banner:', error);
    return '';
  }
}

export async function uploadBanner(data: { file: string; mimeType: string; filename: string }): Promise<{ status: string; url?: string; message?: string }> {
  return callScriptWithCORS('uploadBanner', data);
}

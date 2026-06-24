import { google } from 'googleapis';

// Google Drive Configuration
const FOLDER_ID = '10Sf4TgE-PF7P_k_2bOO1OATVcoVKcyQD';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Initialize Google Drive client
export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

// Upload file to Google Drive folder
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  fileName: string
): Promise<string | null> {
  try {
    const drive = getDriveClient(accessToken);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: file,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = response.data.id;
    const webViewLink = response.data.webViewLink;
    const webContentLink = response.data.webContentLink;

    console.log('File uploaded successfully:', { fileId, webViewLink, webContentLink });

    return webContentLink || webViewLink || fileId;
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    return null;
  }
}

// Upload file from URL to Google Drive folder
export async function uploadFileFromUrl(
  accessToken: string,
  fileUrl: string,
  fileName: string
): Promise<string | null> {
  try {
    const drive = getDriveClient(accessToken);

    // Fetch the file from URL
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });

    return uploadFileToDrive(accessToken, file, fileName);
  } catch (error) {
    console.error('Error uploading file from URL to Drive:', error);
    return null;
  }
}

// Get file info from Drive
export async function getFileInfo(accessToken: string, fileId: string) {
  try {
    const drive = getDriveClient(accessToken);
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, webViewLink, webContentLink, mimeType, size',
    });
    return response.data;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}

// Delete file from Drive
export async function deleteFile(accessToken: string, fileId: string): Promise<boolean> {
  try {
    const drive = getDriveClient(accessToken);
    await drive.files.delete({
      fileId: fileId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting file from Drive:', error);
    return false;
  }
}

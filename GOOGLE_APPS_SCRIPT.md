# Google Apps Script Integration Guide

## Overview
This guide explains how to deploy and integrate the Google Apps Script with your Next.js ITA Portal.

## Prerequisites
- Google Account with access to the specified Google Drive folder and Google Sheets
- Google Apps Script access

## Step 1: Upload code.gs to Google Apps Script

1. Open your Google Apps Script project
2. Copy the contents of `code.gs` from this repository
3. Paste it into your Google Apps Script editor
4. Save the file

## Step 2: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Configure:
   - **Description**: "ITA Portal API"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (required for Next.js integration)
4. Click **Deploy**
5. Copy the **Web app URL**

## Step 3: Configure Next.js Environment

Add to your `.env.local` file:
```
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwYh2qrMJy9vbgcFtdAzVItF1swLjkIR9-VtjiEHGohMIgazC6MOSRkVfMypO04JW4Euw/exec
```

## Step 4: Test Integration

1. Start your Next.js development server: `npm run dev`
2. Test document upload functionality
3. Test user registration and login
4. Verify data appears in Google Sheets

## Benefits of This Approach

✅ **Simpler Setup**: No need for Google Cloud Console configuration
✅ **Built-in Authentication**: User management already implemented
✅ **Direct Integration**: Files stored directly in your Google Drive
✅ **Data in Sheets**: Easy to view and manage data in Google Sheets
✅ **No Backend**: No server needed, Google Apps Script handles everything

## Google Resources Used

- **Google Apps Script**: https://script.google.com/macros/s/AKfycbwYh2qrMJy9vbgcFtdAzVItF1swLjkIR9-VtjiEHGohMIgazC6MOSRkVfMypO04JW4Euw/exec
- **Drive Folder**: https://drive.google.com/drive/folders/1iwoIgf0Oqp1aHsUHiveOyrJ-MCkaEgpK
- **Google Sheet**: https://docs.google.com/spreadsheets/d/15B6cT2IYQn-RFTimgWnZK_1gcK7IO9hnWa18kqooL-U/edit?gid=0#gid=0
- **Sheet Names**: 
  - ITA_Data (documents)
  - ITA_Users (users)

## Configuration Details

The `code.gs` file is configured with:
- **FOLDER_ID**: 1iwoIgf0Oqp1aHsUHiveOyrJ-MCkaEgpK
- **SHEET_ID**: 15B6cT2IYQn-RFTimgWnZK_1gcK7IO9hnWa18kqooL-U

Make sure your Google account has access to both the Drive folder and the Google Sheet.

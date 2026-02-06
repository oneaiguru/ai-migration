const fs = require('fs');
const path = require('path');
const Dropbox = require('dropbox').Dropbox;
const fetch = require('node-fetch');

// Replace with your access token
const accessToken = 'YOUR_DROPBOX_ACCESS_TOKEN';

// Initialize the Dropbox API client
const dbx = new Dropbox({ accessToken, fetch });

// Specify the remote Dropbox folder and local destination folder
const dropboxFolderPath = '/path/to/dropbox/folder';
const localFolderPath = './local/folder';

// Download a file from Dropbox and save it locally
async function downloadFile(file) {
    const localFilePath = path.join(localFolderPath, file.name);
    const fileContent = await dbx.filesDownload({ path: file.path_lower });

    // Write the file content to the local disk
    fs.writeFileSync(localFilePath, fileContent.fileBinary);
}

// List all files in the Dropbox folder and download them
async function downloadFilesInFolder() {
    try {
        // Get the list of files in the Dropbox folder
        const result = await dbx.filesListFolder({ path: dropboxFolderPath });

        // Ensure the local folder exists
        if (!fs.existsSync(localFolderPath)) {
            fs.mkdirSync(localFolderPath, { recursive: true });
        }

        // Download each file in the folder
        for (const file of result.entries) {
            if (file['.tag'] === 'file') {
                await downloadFile(file);
                console.log(`Downloaded: ${file.name}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

downloadFilesInFolder();

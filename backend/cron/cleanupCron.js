import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const uploadsFolder = path.join(path.resolve(), 'uploads');

const emptyUploadsFolder = () => {
    fs.rm(uploadsFolder, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error(`Error clearing uploads folder: ${err.message}`);
        } else {
            console.log('Uploads folder cleared successfully.');
            fs.mkdir(uploadsFolder, { recursive: true }, (mkdirErr) => {
                if (mkdirErr) {
                    console.error(`Error recreating uploads folder: ${mkdirErr.message}`);
                } else {
                    console.log('Uploads folder recreated.');
                }
            });
        }
    });
};

export const cleanupCron = cron.schedule('0 0 * * *', () => {
    console.log('Running daily cleanup of uploads folder');
    emptyUploadsFolder();
});

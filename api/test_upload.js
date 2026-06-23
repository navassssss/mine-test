import { uploadImage } from './api.js';

const base64Image = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function run() {
    try {
        console.log("Uploading image...");
        const fileId = await uploadImage("data:image/jpeg;base64," + base64Image);
        console.log("Uploaded successfully. File ID:", fileId);
    } catch(err) {
        console.error("Upload failed:", err);
    }
}
run();

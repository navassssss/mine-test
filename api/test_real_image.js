import fs from 'fs';
import path from 'path';

// 1. Define the path to your real image
// Make sure you place an image named 'sample.jpg' (or .png) in the same folder before running this!
const imagePath = path.join(process.cwd(), 'sample.jpg'); 

if (!fs.existsSync(imagePath)) {
    console.error(`[ERROR] Image not found!\nPlease place an image named 'sample.jpg' in the api folder: ${process.cwd()}`);
    process.exit(1);
}

// 2. Read the image and convert it to a base64 string
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');
const ext = path.extname(imagePath).replace('.', '').toLowerCase();
const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

// 3. Construct the OpenAI-compatible payload
const payload = {
    model: "k2d6",
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "Please describe everything you see in this image in detail."
                },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:${mimeType};base64,${base64Image}`
                    }
                }
            ]
        }
    ]
};

console.log(`Loading image from ${imagePath}`);
console.log("Sending vision request to local gateway (http://localhost:3000/v1/chat/completions)...");
console.log("Waiting for AI response...");

// 4. Send the request to your local gateway
fetch("http://localhost:3000/v1/chat/completions", {
    method: "POST",
    headers: {
        "Authorization": "Bearer mine_pub_a932571ef4554dfdbc04d8e53224841f",
        "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
})
.then(r => r.json().then(j => ({status: r.status, body: j})))
.then(res => {
    console.log("\n=======================");
    console.log("Status Code:", res.status);
    console.log("AI Output:\n", res.body.choices ? res.body.choices[0].message.content : JSON.stringify(res.body, null, 2));
    console.log("=======================\n");
})
.catch(console.error);

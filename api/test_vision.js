const base64Image = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

const payload = {
    model: "k2d6",
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "What color is the pixel in this image? Reply with just the color name."
                },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`
                    }
                }
            ]
        }
    ]
};

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
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(res.body, null, 2));
})
.catch(console.error);

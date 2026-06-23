import requests

# This is a tiny 1x1 pixel solid red JPEG image encoded in base64
base64_image = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="

payload = {
    "model": "k2d6",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What color is the pixel in this image? Reply with just the color name."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
}

headers = {
    "Authorization": "Bearer mine_pub_a932571ef4554dfdbc04d8e53224841f", # Ensure this key is valid in your DB
    "Content-Type": "application/json"
}

print("Sending request with image to local gateway...")
response = requests.post("http://localhost:3000/v1/chat/completions", json=payload, headers=headers)

print(f"Status Code: {response.status_code}")
print("Response Output:")
try:
    import json
    print(json.dumps(response.json(), indent=2))
except Exception:
    print(response.text)

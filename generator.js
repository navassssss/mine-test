/**
 * gRPC Connect Body Generator
 * Generates the framed body for mine-test/Moonshot chat API requests
 */

/**
 * Generates the Connect protocol prefix for a given JSON body length.
 * Format: \x00\x00\x00\x01 + chr(bodyLength % 256)
 * @param {number} bodyLength - The UTF-8 byte length of the JSON body
 * @returns {string} The 5-character prefix
 */
function generateConnectPrefix(bodyLength) {
    const lengthByte = String.fromCharCode(bodyLength % 256);
    return "\x00\x00\x00\x01" + lengthByte;
}

/**
 * Builds the full framed body for a chat message.
 * @param {string} message - The user's message text
 * @param {string} chatId - The chat session ID (UUID)
 * @param {string} parentId - The parent message ID (UUID)
 * @returns {string} The full body string ready for the fetch request
 */
function buildChatBody(message, chatId = "19ee2ed3-02e2-81cb-8000-0970018c0a1d", parentId = "19ee4972-2dc2-8aa1-8000-0a70bc104345") {
    const payload = {
        chat_id: chatId,
        scenario: "SCENARIO_K2D5",
        tools: [{ type: "TOOL_TYPE_SEARCH", search: {} }],
        message: {
            parent_id: parentId,
            role: "user",
            blocks: [{ message_id: "", text: { content: message } }],
            scenario: "SCENARIO_K2D5"
        },
        options: { thinking: false, enable_plugin: false }
    };

    // Compact JSON: no spaces after separators
    const jsonBody = JSON.stringify(payload);

    // Calculate UTF-8 byte length
    const bodyLength = new TextEncoder().encode(jsonBody).length;

    // Generate prefix
    const prefix = generateConnectPrefix(bodyLength);

    return prefix + jsonBody;
}

// ============== USAGE EXAMPLES ==============

// Example 1: Generate body for "lets crack it what abt you"
const body1 = buildChatBody("Im checking sth serious bro");
console.log("Body 1:", JSON.stringify(body1));

// Example 2: Generate body for custom message
const body2 = buildChatBody("Hello, how are you?");
console.log("Body 2:", JSON.stringify(body2));

// Example 3: With custom chat and parent IDs
const body3 = buildChatBody(
    "Custom message here",
    "your-chat-id-here",
    "your-parent-id-here"
);
console.log("Body 3:", JSON.stringify(body3));

// // Example 4: Use in a fetch request
// /*
// fetch("https://www.mine-test.com/apiv2/mine-test.gateway.chat.v1.ChatService/Chat", {
//     headers: {
//         "accept": "*/*",
//         "content-type": "application/connect+json",
//         "connect-protocol-version": "1",
//         // ... other headers
//     },
//     body: buildChatBody("Your message here"),
//     method: "POST"
// });
// */

// Export for module use
if (typeof module !== "undefined" && module.exports) {
    module.exports = { generateConnectPrefix, buildChatBody };
}

// Visual Email Editor - Background Script

console.log("Visual Email Editor initializing...");

browser.browserAction.onClicked.addListener(async () => {
  console.log("Button clicked - opening editor");
  try {
    await browser.tabs.create({
      url: browser.runtime.getURL("editor/index.html")
    });
  } catch (error) {
    console.error("Error opening editor:", error);
  }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message.action);

  if (message.action === "insertHtmlToCompose") {
    insertHtmlToCompose(message.html).then(sendResponse);
    return true;
  }

  sendResponse({ success: true });
  return false;
});

// Insert HTML while preserving the signature
async function insertHtmlToCompose(html) {
  console.log("Inserting HTML to compose, length:", html.length);

  try {
    // Count base64 images
    const base64Count = (html.match(/data:image\/[^;]+;base64,/gi) || []).length;
    console.log("Base64 images:", base64Count);

    // Step 1: Create empty compose window first (this will include the signature)
    const tab = await browser.compose.beginNew({
      deliveryFormat: "html"
    });
    console.log("Compose window created, tab:", tab.id);

    // Step 2: Wait a moment for the window to initialize with signature
    await new Promise(resolve => setTimeout(resolve, 300));

    // Step 3: Get current compose details (includes signature)
    const details = await browser.compose.getComposeDetails(tab.id);
    console.log("Got compose details, body length:", details.body?.length || 0);

    // Step 4: Combine our HTML with the existing signature
    let finalBody = html;

    if (details.body) {
      // Extract the body content from the existing compose (might have signature)
      const existingBody = details.body;

      // Check if there's meaningful content (signature)
      // Signatures often have separator like "-- " or specific patterns
      const signaturePatterns = [
        /<div[^>]*class="[^"]*signature[^"]*"[^>]*>/i,
        /<div[^>]*id="[^"]*signature[^"]*"[^>]*>/i,
        /--\s*<br/i,
        /<pre[^>]*class="moz-signature"/i
      ];

      let hasSignature = signaturePatterns.some(pattern => pattern.test(existingBody));

      // If no pattern found, check if there's any non-empty content
      if (!hasSignature) {
        const strippedContent = existingBody.replace(/<[^>]*>/g, '').trim();
        hasSignature = strippedContent.length > 0;
      }

      if (hasSignature) {
        // Insert our HTML before the signature
        // Try to find where the body content ends (before signature)
        // Most signatures are at the end, so we append our content at the start
        console.log("Signature detected, preserving it");

        // Check if existing body has a wrapper
        if (existingBody.includes('<body')) {
          // Insert our content after body tag, before existing content
          finalBody = existingBody.replace(/(<body[^>]*>)/i, `$1${html}`);
        } else {
          // Just prepend our HTML
          finalBody = html + '<br><br>' + existingBody;
        }
      }
    }

    // Step 5: Set the combined body
    await browser.compose.setComposeDetails(tab.id, {
      body: finalBody
    });
    console.log("Body set with preserved signature, length:", finalBody.length);

    return { success: true, newCompose: true, embeddedImages: base64Count };

  } catch (error) {
    console.error("Error inserting HTML:", error);
    return { success: false, error: error.message || String(error) };
  }
}

console.log("Visual Email Editor background script loaded");

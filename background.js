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

/**
 * Converts a Base64 data URI to a File object
 */
function base64ToFile(base64Data, filename) {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new File([uInt8Array], filename, { type: contentType });
}

/**
 * Generate a unique Content-ID for inline images
 */
function generateContentId() {
  return `img${Date.now()}${Math.random().toString(36).substr(2, 9)}@visualeditor`;
}

/**
 * Process HTML to find base64 images, convert them to inline attachments
 * with proper Content-ID references
 */
async function processInlineImages(html, tabId) {
  // Match img tags with base64 src
  const imgRegex = /<img([^>]*)src="(data:image\/([^;]+);base64,([^"]+))"([^>]*)>/gi;
  let processedHtml = html;
  let imageCount = 0;
  const processedImages = [];

  // Find all base64 images first
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    processedImages.push({
      fullMatch: match[0],
      beforeSrc: match[1],
      dataUri: match[2],
      extension: match[3],
      base64Data: match[4],
      afterSrc: match[5]
    });
  }

  console.log(`Found ${processedImages.length} base64 images to process`);

  // Process each image
  for (const img of processedImages) {
    const contentId = generateContentId();
    const filename = `image_${imageCount}.${img.extension}`;

    console.log(`Processing image ${imageCount}: ${filename}, CID: ${contentId}`);

    try {
      const fileObj = base64ToFile(img.dataUri, filename);

      // Add attachment with contentId for inline display
      await browser.compose.addAttachment(tabId, {
        file: fileObj,
        name: filename,
        contentId: contentId  // This makes it an inline attachment
      });

      // Replace the data URI with cid: reference
      processedHtml = processedHtml.replace(
        img.dataUri,
        `cid:${contentId}`
      );

      console.log(`Image ${imageCount} attached with CID: ${contentId}`);
      imageCount++;
    } catch (e) {
      console.error(`Failed to process image ${imageCount}:`, e);
      // Keep the original base64 if attachment fails
    }
  }

  return { html: processedHtml, count: imageCount };
}

// Insert HTML while preserving the signature and handling inline images
async function insertHtmlToCompose(html) {
  console.log("Inserting HTML to compose, length:", html.length);

  try {
    // Step 1: Create empty compose window first (this will include the signature)
    const tab = await browser.compose.beginNew({
      deliveryFormat: "html"
    });
    console.log("Compose window created, tab:", tab.id);

    // Step 2: Wait a moment for the window to initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Get current compose details (includes signature)
    const details = await browser.compose.getComposeDetails(tab.id);
    console.log("Got compose details, body length:", details.body?.length || 0);

    // Step 4: Process inline images BEFORE setting body
    const { html: processedHtml, count: attachmentCount } = await processInlineImages(html, tab.id);
    console.log(`Processed ${attachmentCount} inline images`);

    // Step 5: Combine our HTML with the existing signature
    let finalBody = processedHtml;

    if (details.body) {
      const existingBody = details.body;
      const signaturePatterns = [
        /<div[^>]*class="[^"]*signature[^"]*"[^>]*>/i,
        /<div[^>]*id="[^"]*signature[^"]*"[^>]*>/i,
        /--\s*<br/i,
        /<pre[^>]*class="moz-signature"/i
      ];

      let hasSignature = signaturePatterns.some(pattern => pattern.test(existingBody));

      if (!hasSignature) {
        const strippedContent = existingBody.replace(/<[^>]*>/g, '').trim();
        hasSignature = strippedContent.length > 0;
      }

      if (hasSignature) {
        console.log("Signature detected, preserving it");
        if (existingBody.includes('<body')) {
          finalBody = existingBody.replace(/(<body[^>]*>)/i, `$1${processedHtml}`);
        } else {
          finalBody = processedHtml + '<br><br>' + existingBody;
        }
      }
    }

    // Step 6: Set the body with CID references
    await browser.compose.setComposeDetails(tab.id, {
      body: finalBody
    });

    console.log("Email body set successfully with inline images");

    return {
      success: true,
      newCompose: true,
      inlineImages: attachmentCount
    };

  } catch (error) {
    console.error("Error inserting HTML:", error);
    return { success: false, error: error.message || String(error) };
  }
}

console.log("Visual Email Editor background script loaded");

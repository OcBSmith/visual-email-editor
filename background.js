// Visual Email Editor - Background Script

browser.browserAction.onClicked.addListener(async () => {
  try {
    await browser.tabs.create({ url: browser.runtime.getURL("editor/index.html") });
  } catch (error) {
    console.error("Error opening editor:", error);
  }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "insertHtmlToCompose") {
    insertHtmlToCompose(message.html).then(sendResponse);
    return true;
  }
  sendResponse({ success: true });
  return false;
});

// Find an already-open compose window (the user may have one with their signature)
async function findOpenComposeTab() {
  try {
    const allWindows = await browser.windows.getAll({ populate: true });
    for (const win of allWindows) {
      if (win.type === 'messageCompose' && win.tabs && win.tabs.length > 0) {
        console.log('[insertHtml] Found existing compose window, id:', win.id);
        return win.tabs[0].id;
      }
    }
  } catch (e) {
    console.warn('[insertHtml] Could not enumerate windows:', e);
  }
  return null;
}

async function insertHtmlToCompose(html) {
  try {
    // 1. Separate <style> blocks from body content so styles go in <head>
    const styleBlocks = [];
    const bodyContent = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, match => {
      styleBlocks.push(match);
      return '';
    }).trim();
    const stylesHtml = styleBlocks.join('\n');
    console.log('[insertHtml] style blocks:', styleBlocks.length, '| body chars:', bodyContent.length);

    // 2. Use existing compose window if open, otherwise open a new one
    let tabId = await findOpenComposeTab();

    if (tabId) {
      console.log('[insertHtml] Reusing existing compose tab:', tabId);
    } else {
      console.log('[insertHtml] No compose window found — opening new one');
      const tab = await browser.compose.beginNew({ deliveryFormat: "html" });
      tabId = tab.id;
      // Give Thunderbird time to load the signature into the new window
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 3. Read the current compose body (contains signature if configured)
    const details = await browser.compose.getComposeDetails(tabId);
    const existingBody = details.body || '';

    // --- Diagnostic logging (first 500 chars so we can see the format) ---
    console.log('[insertHtml] existingBody length:', existingBody.length);
    console.log('[insertHtml] existingBody[0..500]:\n', existingBody.substring(0, 500));
    console.log('[insertHtml] has </head>:', /<\/head>/i.test(existingBody));
    console.log('[insertHtml] has <body>:',  /<body[^>]*>/i.test(existingBody));
    // -----------------------------------------------------------------------

    // 4. Build final HTML — always put styles in <head>, email first, then signature
    let finalBody;

    if (/<\/head>/i.test(existingBody)) {
      // Full HTML document returned by Thunderbird
      finalBody = existingBody
        .replace(/(<\/head>)/i,    `${stylesHtml}\n$1`)
        .replace(/(<body[^>]*>)/i, `$1\n${bodyContent}\n<br><br>`);
      console.log('[insertHtml] Strategy: full-doc injection');

    } else if (/<body[^>]*>/i.test(existingBody)) {
      // Has <body> tag but no <html>/<head>
      finalBody = `${stylesHtml}\n` +
        existingBody.replace(/(<body[^>]*>)/i, `$1\n${bodyContent}\n<br><br>`);
      console.log('[insertHtml] Strategy: body-tag injection');

    } else {
      // Plain body content (no wrapper tags) — prepend our email
      const sep = existingBody.trim().length > 0 ? '\n<br><br>' : '';
      finalBody = `${stylesHtml}\n${bodyContent}${sep}${existingBody}`;
      console.log('[insertHtml] Strategy: plain concat');
    }

    console.log('[insertHtml] finalBody length:', finalBody.length);
    console.log('[insertHtml] finalBody[0..300]:\n', finalBody.substring(0, 300));

    // 5. Apply the final body
    await browser.compose.setComposeDetails(tabId, { body: finalBody });
    console.log('[insertHtml] setComposeDetails OK');

    return { success: true };

  } catch (error) {
    console.error('[insertHtml] Error:', error);
    return { success: false, error: error.message || String(error) };
  }
}

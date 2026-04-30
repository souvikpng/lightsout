async function applyReaderMode(tabId, enabled) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["reader.js"] });
    await chrome.tabs.sendMessage(tabId, { type: "LIGHTS_OUT_READER_SET", enabled });
  } catch (error) {
    console.warn("LightsOut could not apply reader mode.", error);
  }
}

function getOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !/^https?:\/\//.test(tab.url ?? "")) {
    return;
  }

  const origin = getOrigin(tab.url);

  if (!origin) {
    return;
  }

  const key = `tab:${tabId}:origin:${origin}:enabled`;
  let stored;

  try {
    stored = await chrome.storage.session.get(key);
  } catch (error) {
    console.warn("LightsOut could not read tab state.", error);
    return;
  }

  if (stored[key]) {
    await applyReaderMode(tabId, true);
  }
});

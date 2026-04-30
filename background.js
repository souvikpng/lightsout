async function applyReaderMode(tabId, enabled) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["reader.js"] });
  await chrome.tabs.sendMessage(tabId, { type: "LIGHTS_OUT_READER_SET", enabled });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !/^https?:\/\//.test(tab.url ?? "")) {
    return;
  }

  const key = `tab:${tabId}:enabled`;
  const stored = await chrome.storage.session.get(key);

  if (stored[key]) {
    await applyReaderMode(tabId, true);
  }
});

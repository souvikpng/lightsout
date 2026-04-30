const toggle = document.querySelector("#toggle");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function isSupportedTab(tab) {
  return tab?.id && /^https?:\/\//.test(tab.url ?? "");
}

function getOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

async function sendToggle(tabId, enabled) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "LIGHTS_OUT_READER_SET", enabled });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["reader.js"] });
    await chrome.tabs.sendMessage(tabId, { type: "LIGHTS_OUT_READER_SET", enabled });
  }
}

async function init() {
  const tab = await getActiveTab();

  if (!isSupportedTab(tab)) {
    toggle.disabled = true;
    return;
  }

  const origin = getOrigin(tab.url);

  if (!origin) {
    toggle.disabled = true;
    return;
  }

  const key = `tab:${tab.id}:origin:${origin}:enabled`;
  const stored = await chrome.storage.session.get(key);
  const enabled = Boolean(stored[key]);

  toggle.checked = enabled;

  if (enabled) {
    await sendToggle(tab.id, true);
  }

  toggle.addEventListener("change", async () => {
    const nextEnabled = toggle.checked;
    await chrome.storage.session.set({ [key]: nextEnabled });
    await sendToggle(tab.id, nextEnabled);
  });
}

init().catch((error) => {
  toggle.disabled = true;
  console.error(error);
});

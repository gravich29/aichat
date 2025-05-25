export function saveSettings(settings) {
  chrome.storage.local.set({ settings });
}

export function getSettings(callback) {
  chrome.storage.local.get(['settings'], callback);
}
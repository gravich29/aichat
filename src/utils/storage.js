export function saveSettings(settings) {
  chrome.storage.local.set({ settings });
}
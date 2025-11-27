// Systeme de mise a jour IA Helper

const VERSION_URL = 'https://raw.githubusercontent.com/Gohanado/ia-helper/main/version.json';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures

export async function getCurrentVersion() {
  const manifest = chrome.runtime.getManifest();
  return manifest.version;
}

export async function checkForUpdates() {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!response.ok) return null;
    
    const data = await response.json();
    const currentVersion = await getCurrentVersion();
    
    if (compareVersions(data.version, currentVersion) > 0) {
      return {
        currentVersion,
        newVersion: data.version,
        releaseDate: data.releaseDate,
        downloadUrl: data.downloadUrl,
        changelogUrl: data.changelogUrl,
        releaseNotes: data.releaseNotes
      };
    }
    return null;
  } catch (error) {
    console.error('IA Helper: Erreur verification mise a jour', error);
    return null;
  }
}

export function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export async function getLastCheckTime() {
  return new Promise(resolve => {
    chrome.storage.local.get(['lastUpdateCheck'], result => {
      resolve(result.lastUpdateCheck || 0);
    });
  });
}

export async function setLastCheckTime() {
  return new Promise(resolve => {
    chrome.storage.local.set({ lastUpdateCheck: Date.now() }, resolve);
  });
}

export async function shouldCheckForUpdates() {
  const lastCheck = await getLastCheckTime();
  return (Date.now() - lastCheck) > CHECK_INTERVAL;
}

export async function getUpdateInfo() {
  return new Promise(resolve => {
    chrome.storage.local.get(['updateAvailable'], result => {
      resolve(result.updateAvailable || null);
    });
  });
}

export async function setUpdateInfo(info) {
  return new Promise(resolve => {
    chrome.storage.local.set({ updateAvailable: info }, resolve);
  });
}

export async function clearUpdateInfo() {
  return new Promise(resolve => {
    chrome.storage.local.remove(['updateAvailable'], resolve);
  });
}

export async function performUpdateCheck() {
  if (await shouldCheckForUpdates()) {
    const update = await checkForUpdates();
    await setLastCheckTime();
    if (update) {
      await setUpdateInfo(update);
    }
    return update;
  }
  return await getUpdateInfo();
}


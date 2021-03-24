function scamSwatterBaseUrl() {
  // return 'http://localhost:8888';
  return 'https://www.scamswatter.com';
}

async function scamSwatterToken() {
  return await new Promise(resolve => {
    chrome.storage.local.get(['longTermToken'], (values) => {
      resolve(values.longTermToken);
    });
  });
}

async function scamSwatterSetToken(token) {
  await new Promise(resolve => {
    chrome.storage.local.set({longTermToken: token}, resolve);
  });
  await ensureUninstallUrl();
}

async function ensureUninstallUrl() {
  const token = await scamSwatterToken();
  const baseUrl = await scamSwatterBaseUrl();
  const url = token ?
    `${baseUrl}/chrome-extension-uninstalled?token=${token}` :
    `${baseUrl}/chrome-extension-uninstalled`;

  await new Promise(resolve => chrome.runtime.setUninstallURL(url, resolve));
}

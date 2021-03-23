async function scamSwatterBaseUrl() {
  const installType = await new Promise(resolve => {
    chrome.management.get(
      chrome.runtime.id,
      extensionInfo => resolve(extensionInfo.installType)
    );
  });

  return installType === "development" ?
      "http://localhost:8888" :
      "https://www.scamswatter.com";
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
}

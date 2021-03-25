var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    initializeScamSwatter();
  }
}, 10);

function initializeScamSwatter() {
  console.log("ScamSwatter initializing...");

  onInspectorOpened(
      function() { reportSuspiciousActivity(InspectorOpened); });

  if (includesRemoteAccessDownload()) {
    reportSuspiciousActivity(RemoteAccessDownloadsOnSite);
  }
}

async function reportSuspiciousActivity(activityClass) {
  const instance = await activityClass.create();

  chrome.runtime.sendMessage({
    scamSwatter: {
      type: 'suspicious_activity',
      data: instance.typedObject(),
    },
  });
}

function onInspectorOpened(callback) {
  var callbackCalled = false;

  var image = new Image();

  var interval = setInterval(
      function() { console.debug('ScamSwatter inspector test:', image); }, 1000);

  image.__defineGetter__('id', function() {
    if (!callbackCalled) {
      callbackCalled = true;
      clearInterval(interval);
      callback();
    }
  });
}

var REMOTE_ACCESS_SOFTWARE_HOSTS = [
  '150.co.il',
  'anydesk.com',
  'pchelponline.us',
  'secure.logmeinrescue.com',
  'secure.logmeinrescue-enterprise.com',
  'www.teamviewer.com',
  'www.zoho.com',
];

function includesRemoteAccessDownload() {
  console.log('ScamSwatter: Current hostname - "' + location.hostname + '"');
  var onSoftwareHost =
      REMOTE_ACCESS_SOFTWARE_HOSTS.indexOf(location.hostname) != -1;
  if (onSoftwareHost) {
    return true;
  }

  var containsDownload =
      Array.from(document.getElementsByTagName('a')).find(function(anchor) {
        try {
          var url = new URL(anchor.href);
          var inSoftwareHosts =
              REMOTE_ACCESS_SOFTWARE_HOSTS.indexOf(url.hostname) != -1;
          return inSoftwareHosts;
        } catch (e) {
          return false;
        }
      }) != null;
  if (containsDownload) {
    return true;
  }

  return false;
}

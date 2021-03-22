var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    initializeScamSwatter();
  }
}, 10);

var SUSPICIOUS_ACTIVITY = {
  INSPECTOR_OPENED: {

  },
  REMOTE_ACCESS_DOWNLOADS_ON_SITE: {

  },
}

function initializeScamSwatter() {
  console.log("ScamSwatter initializing...");

  onInspectorOpened(
      function() { reportSuspiciousActivity(SUSPICIOUS_ACTIVITY.INSPECTOR_OPENED); });

  if (includesRemoteAccessDownload()) {
    reportSuspiciousActivity(SUSPICIOUS_ACTIVITY.REMOTE_ACCESS_DOWLOADS_ON_SITE);
  }
}

function reportSuspiciousActivity(activityDescription) {
  alert('Suspicious activity!');
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

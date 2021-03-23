var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    initializeScamSwatter();
  }
}, 10);

var SUSPICIOUS_ACTIVITY = {
  INSPECTOR_OPENED: {
    type: 'INSPECTOR_OPENED',
    data: {
      url() {
        return window.location.href;
      },
    },
  },
  REMOTE_ACCESS_DOWNLOADS_ON_SITE: {
    type: 'REMOTE_ACCESS_DOWNLOADS_ON_SITE',
    data: {
      url() {
        return window.location.href;
      },
    },
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

async function reportSuspiciousActivity(activityDescription) {
  const evaluated = await evaluateFunctions(activityDescription);

  chrome.runtime.sendMessage({
    scamSwatter: {
      type: 'suspicious_activity',
      data: evaluated,
    },
  });
}

async function evaluateFunctions(obj) {
  const result = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const val = obj[key];
    if (typeof val === 'function') {
      result[key] = await val();
    } else if (val == null) {
      result[key] = null;
    } else if (typeof val === 'object') {
      result[key] = await evaluateFunctions(val);
    } else {
      result[key] = val;
    }
  }
  return result;
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

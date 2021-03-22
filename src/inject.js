chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      initializeScamSwatter();
    }
  }, 10);
});

var WARNING_HEADER =
    '<span style="font-size: 3rem; line-height: 3rem">WARNING: POTENTIAL SCAMMER ACTIVITY DETECTED</span>';
var WARNINGS = {
  INSPECTOR_OPENED : [
    "Chrome's developer tools have been opened.",
    "This is a tactic frequently used by scammers to change the contents of a website.",
    "Do not trust the contents of this page, they may have been changed.",
    "We recommend you <a href='javascript:window.location.reload()'>refresh the page</a> to reset the contents."
  ].join('\n'),
  REMOTE_ACCESS_TOOL : [
    "This website contains download links for Remote Access Software.",
    "Remote Access Software is commonly used by scammers to gain access to victim's computers.",
    "Most legitimate technical support and refund processing does not require Remote Access Software.",
    "Read more about these scams from:",
    "<a href='https://en.wikipedia.org/wiki/Technical_support_scam'>Wikipedia (Technical Support Scam)</a>",
    "<a href='https://www.scamwatch.gov.au/types-of-scams/attempts-to-gain-your-personal-information/remote-access-scams'>Australian Government ScamWatch</a>",
    "<a href='https://www.consumer.ftc.gov/features/scam-alerts'>FTC Scam Alerts</a>",
    "",
    "If you trust the person directing you to this site, you can safely dismiss this warning.",
  ].join('\n'),
};

function initializeScamSwatter() {
  console.log("ScamSwatter initializing...");

  onInspectorOpened(
      function() { showPersistentWarning(WARNINGS.INSPECTOR_OPENED); });

  if (includesRemoteAccessDownload()) {
    showDismissableWarning(WARNINGS.REMOTE_ACCESS_TOOL);
  }
}

function onInspectorOpened(callback) {
  var callbackCalled = false;

  var image = new Image();

  var interval = setInterval(
      function() { console.log('ScamSwatter inspector test:', image); }, 1000);

  image.__defineGetter__('id', function() {
    if (!callbackCalled) {
      callbackCalled = true;
      clearInterval(interval);
      callback();
    }
  });
}

function showPersistentWarning(warning) {
  var element;
  function replaceWarning() {
    if (element != null) {
      element.remove();
    }
    element = createWarningElement(warning);
    placeElementRandomly(document.body, element);
  }

  replaceWarning();
  setInterval(replaceWarning, 10000);
}

function createWarningElement(text) {
  var result = document.createElement('scam-warning-' + randomString());
  result.innerHTML = WARNING_HEADER + '\n' + text;

  var styles = {
    position : 'fixed',
    top : '0',
    left : '0',
    right : '0',
    minHeight : '30vh',
    padding : '1rem',

    zIndex : '999999999',
    textAlign : 'center',
    whiteSpace : 'pre-wrap',
    backgroundColor : 'red',

    fontSize : '2rem',
    lineHeight : '2rem',
    color : 'black',
  };
  Object.assign(result.style, styles);

  return result;
}

function randomString() { return Math.random().toString().split('.')[1]; }

/**
 * Places an element randomly in its parent.
 */
function placeElementRandomly(destination, element) {
  var childrenCount = destination.children.length;
  if (childrenCount == 0) {
    destination.append(element);
    return;
  } else if (childrenCount == 1) {
    if (Math.random < 0.5) {
      destination.prepend(element);
    } else {
      destination.append(element);
    }
    return;
  }

  var index = Math.floor(Math.random() * (childrenCount + 1));
  if (index == childrenCount) {
    destination.append(element);
  } else {
    destination.insertBefore(element, destination.children[index]);
  }
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

function showDismissableWarning(warning) {
  var element = createWarningElement(warning);
  element.append(dismissButton(function() { element.remove(); }));
  document.body.append(element);
}

var DISMISS_HTML =
    '<button aria-label="Dismiss Scam Swatter warning.">X</button>';

function dismissButton(callback) {
  var element = htmlToElement(DISMISS_HTML);
  var styles = {
    position : 'absolute',
    top : '16px',
    right : '16px',
  };
  Object.assign(element.style, styles);

  element.addEventListener('click', function() { callback(); });

  return element;
}

function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Don't return whitespace nodes
  template.innerHTML = html;
  return template.content.firstChild;
}

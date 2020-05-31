chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      initializeScamSwatter();
    }
  }, 10);
});

var WARNING_HEADER =
    '<span style="font-size: 3rem; line-height: 3rem">WARNING: POTENTIAL SCAMMER BEHAVIOR DETECTED</span>';
var WARNINGS = {
  INSPECTOR_OPENED : [
    "Chrome's developer tools have been opened.",
    "This is a tactic frequently used by scammers to change the contents of a website.",
    "Do not trust the contents of this page, they may have been changed.",
    "We recommend you <a href='javascript:window.location.reload()'>refresh the page</a> to reset the contents."
  ].join('\n'),
};

function initializeScamSwatter() {
  console.log("ScamSwatter initializing...");
  onInspectorOpened(function() {
    console.log('Inspector opened');
    showPersistentWarning(WARNINGS.INSPECTOR_OPENED);
  });
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
    element = createWarningElement(WARNING_HEADER + '\n' + warning);
    placeElementRandomly(document.body, element);
  }

  replaceWarning();
  setInterval(replaceWarning, 10000);
}

function createWarningElement(text) {
  var result = document.createElement('scam-warning-' + randomString());
  result.innerHTML = text;

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

    fontSize: '2rem',
    lineHeight: '2rem',
    color: 'black',
  };
  Object.assign(result.style, styles);

  return result;
}

function randomString() {
  return Math.random().toString().split('.')[1];
}

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

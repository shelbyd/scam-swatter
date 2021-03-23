chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: 'https://www.scamswatter.com/chrome-extension-post-install',
    });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, respond) {
  if (request.scamSwatter == null) return;

  switch (request.scamSwatter.type) {
    case 'suspicious_activity':
      reportSuspiciousActivity(request.scamSwatter.data);
      return;
    default:
      console.error(`Unhandled message request '${request.scamSwatter.type}'`)
  }
});

async function reportSuspiciousActivity(activity) {
  const decorated = {
    activityData: activity,
    detectedAt: (new Date()).toISOString(),
  };

  const response = await fetch(`${await scamSwatterBaseUrl()}/.netlify/functions/report-suspicious-activity`, {
    headers: {
      'ScamSwatter-Device-Token': await scamSwatterToken(),
    },
    method: 'POST',
    body: JSON.stringify(decorated),
  });

  if (!response.ok) {
    // TODO(shelbyd): Try reporting activity later if server is down for some reason.
    console.error('Failed to report suspicious activity', response);
  }
}

const ACTIVITY_MAP = {};

class SuspiciousActivity {
  typedObject() {
    return {
      type: this.constructor.id(),
      data: this.toObject(),
    };
  }

  static parseTyped(obj) {
    const klass = ACTIVITY_MAP[obj.type];
    return klass.parse(obj.data);
  }

  toObject() { return {}; }

  details() { return null; }
}

class InspectorOpened extends SuspiciousActivity {
  static id() { return 'INSPECTOR_OPENED'; }

  constructor(url) {
    super();
    this.url = url;
  }

  static create() {
    return new InspectorOpened(window.location.href);
  }

  toObject() {
    return {
      url: this.url,
    };
  }

  static parse(obj) {
    return new InspectorOpened(obj.url);
  }

  details() {
    const host = new URL(this.url).host;
    return `Developer tools opened on ${host}.`;
  }
}

class RemoteAccessDownloadsOnSite extends SuspiciousActivity {
  static id() { return 'REMOTE_ACCESS_DOWNLOADS_ON_SITE'; }

  constructor(url) {
    super();
    this.url = url;
  }

  static create() {
    return new RemoteAccessDownloadsOnSite(window.location.href);
  }

  toObject() {
    return {
      url: this.url,
    };
  }

  static parse(obj) {
    return new RemoteAccessDownloadsOnSite(obj.url);
  }

  details() {
    return 'Visited a site with remote access downloads.';
  }
}

class ExtensionUninstalled extends SuspiciousActivity {
  static id() { return 'CHROME_EXTENSION_UNINSTALLED'; }

  static create() {
    return new ExtensionUninstalled();
  }

  static parse(obj) {
    return new ExtensionUninstalled();
  }

  details() {
    return 'Browser extension uninstalled.';
  }
}

[
  InspectorOpened,
  RemoteAccessDownloadsOnSite,
  ExtensionUninstalled,
].forEach(klass => {
  ACTIVITY_MAP[klass.id()] = klass;
});

try {
  exports.SuspiciousActivity = SuspiciousActivity;
  exports.ACTIVITY_MAP = ACTIVITY_MAP;
} catch (e) {}

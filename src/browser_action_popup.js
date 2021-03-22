var app = new Vue({
  el: '#page',
  data: {
    token: null,
    setupCode: '',
    errorMessage: '',
    setupInProgress: false,
  },
  methods: {
    async trySetup() {
      this.setupInProgress = true;

      const installType = await new Promise(resolve => {
        chrome.management.get(
          chrome.runtime.id,
          extensionInfo => resolve(extensionInfo.installType)
        );
      });

      const baseUrl =
          installType === "development" ?
          "http://localhost:8888" :
          "https://www.scamswatter.com";
      const response = await fetch(`${baseUrl}/.netlify/functions/setup-new-device`, {
        body: JSON.stringify({setupCode: this.setupCode.trim()}),
        method: 'POST',
      });
      const body = await response.json();

      if (response.ok) {
        this.errorMessage = '';
      } else {
        this.errorMessage = body.error;
        this.setupInProgress = false;
        return;
      }

      const token = body.newDevice.longTermToken;
      await new Promise(resolve => {
        chrome.storage.local.set({longTermToken: token}, resolve);
      });
      this.token = token;

      this.setupInProgress = false;
    },
    close() {
      window.close();
    },
  },
  async mounted() {
    this.token = await new Promise(resolve => {
      chrome.storage.local.get(['longTermToken'], (values) => {
        resolve(values.longTermToken);
      });
    });
  }
})

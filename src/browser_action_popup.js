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

      const response = await fetch(`${await scamSwatterBaseUrl()}/.netlify/functions/setup-new-device`, {
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
      await scamSwatterSetToken(token);
      this.token = token;

      this.setupInProgress = false;
    },
    close() {
      window.close();
    },
  },
  async mounted() {
    this.token = await scamSwatterToken();
  }
})

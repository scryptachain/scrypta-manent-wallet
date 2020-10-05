<template>
  <div class="popup">
    <div v-if="!wallet">
      <Login v-on:logged="logWithWallet" />
    </div>
    <div v-if="wallet">
      <a
        :href="standaloneURL"
        target="_blank"
        style="position: absolute; top: 10px; right: 10px"
      >
        <b-icon icon="export-variant" size="is-small"></b-icon>
      </a>
      <div style="word-break: break-word">
        {{ wallet }}
      </div>
    </div>
  </div>
</template>

<script>
const ScryptaCore = require("@scrypta/core");
const User = require("../libs/user");
import Login from "../components/Login.vue";

export default {
  components: { Login },
  name: "App",
  data() {
    return {
      standaloneURL: "",
      scrypta: new ScryptaCore(true),
      user: User,
      error: false,
      recover: false,
      created: false,
      newSeed: "",
      wallet: "",
      password: "",
      passwordrepeat: "",
      mnemonic: "",
      label: "New Identity",
    };
  },
  async mounted() {
    const app = this;
    app.wallet = await app.user.auth();
    app.standaloneURL = chrome.runtime.getURL("/index.html");
  },
  methods: {
    async logWithWallet(value) {
      const app = this;
      app.wallet = await app.user.auth();
    },
  },
};
</script>

<style>
html {
  padding: 40px 10px !important;
  font-family: "Sen", sans-serif !important;
}
.popup {
  min-width: 350px;
  width: 100%;
  text-align: center;
}
</style>
<template>
  <div class="popup">
    <div v-if="!wallet && $route.path !== '/login'">
      <Create v-on:logged="logWithWallet" />
    </div>
    <div v-if="!wallet && $route.path === '/login'">
      <Login v-on:logged="logWithWallet" />
    </div>
    <div v-if="wallet">
      <div id="nav">
        <router-link to="/">Home</router-link> |
        <router-link to="/about">About</router-link>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script>
const ScryptaCore = require("@scrypta/core");
const User = require("../libs/user");
import Create from "../components/Create.vue";
import Login from "../components/Login.vue";

export default {
  components: { Create, Login },
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
    logWithWallet(value) {
      const app = this;
      app.wallet = value;
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
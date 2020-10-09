<template>
  <div class="popup">
    <div v-if="!wallet && $route.path !== '/login'">
      <Create v-on:logged="logWithWallet" />
    </div>
    <div v-if="!wallet && $route.path === '/login'">
      <img src="../assets/logo.png" width="150px" /><br /><br />
      <div class="container">
        <div class="columns">
          <div class="column"></div>
          <div class="column is-three-quarters">
            <div class="card">
              <div class="card-content">
                <div class="content">
                  <Login :embed="false" v-on:logged="logWithWallet" />
                </div>
              </div>
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
    </div>
    <div v-if="wallet">
      <img src="../assets/logo.png" width="150px" /><br /><br />
      <div class="container">
        <div class="columns">
          <div class="column"></div>
          <div class="column is-three-quarters">
            <div class="card">
              <v-gravatar
                style="
                  position: absolute;
                  cursor: pointer;
                  top: -60px;
                  height: 32px;
                  width: 32px;
                  z-index: 25;
                  left: 0px;
                  border-radius: 3px;
                "
                :email="wallet.master"
              />
              <a href="#" v-on:click="logout">
                <b-icon
                  icon="logout"
                  size="is-medium"
                  style="
                    position: absolute;
                    cursor: pointer;
                    top: -60px;
                    z-index: 25;
                    right: 0px;
                  "
                ></b-icon
              ></a>
              <div class="card-content">
                <div class="content">
                  <div
                    id="nav"
                    style="
                      border-bottom: 1px solid #ddd;
                      padding-bottom: 15px;
                      margin-bottom: 15px;
                    "
                  >
                    <div class="columns">
                      <div class="column">
                        <router-link to="/"
                          ><b-icon
                            class="menu-icon"
                            icon="view-dashboard"
                          ></b-icon>
                          <br />
                          {{ $t("menu.dashboard") }}</router-link
                        >
                      </div>
                      <div class="column">
                        <router-link to="/payments"
                          ><b-icon class="menu-icon" icon="send"></b-icon>
                          <br />
                          {{ $t("menu.payments") }}</router-link
                        >
                      </div>
                      <div class="column">
                        <router-link to="/portfolio"
                          ><b-icon class="menu-icon" icon="wallet"></b-icon>
                          <br />
                          {{ $t("menu.portfolio") }}</router-link
                        >
                      </div>
                      <!-- <div class="column">
                        <router-link to="/contacts"
                          ><b-icon class="menu-icon" icon="contacts"></b-icon>
                          <br />
                          {{ $t("menu.contacts") }}</router-link
                        >
                      </div> -->
                      <div class="column">
                        <router-link to="/identities"
                          ><b-icon
                            class="menu-icon"
                            icon="account-box-multiple"
                          ></b-icon>
                          <br />
                          {{ $t("menu.identities") }}</router-link
                        >
                      </div>
                      <div class="column">
                        <router-link to="/notarize"
                          ><b-icon class="menu-icon" icon="package-down"></b-icon>
                          <br />
                          {{ $t("menu.notarize") }}</router-link
                        >
                      </div>
                      <!-- <div class="column">
                        <router-link to="/settings"
                          ><b-icon class="menu-icon" icon="wrench"></b-icon>
                          <br />
                          {{ $t("menu.settings") }}</router-link
                        >
                      </div> -->
                    </div>
                  </div>
                  <router-view />
                </div>
              </div>
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
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
      avatar: "",
      mnemonic: "",
      label: "New Identity",
    };
  },
  async mounted() {
    const app = this;
    app.wallet = await app.user.auth();
    if(chrome !== undefined && chrome.runtime !== undefined && chrome.runtime.getURL !== undefined){
      app.standaloneURL = chrome.runtime.getURL("/index.html");
    }else{
      app.standaloneURL = '/#/'
    }
  },
  methods: {
    logWithWallet(value) {
      const app = this;
      app.wallet = value;
      if (app.wallet.indexOf("xpub") === -1) {
        localStorage.setItem("SID", app.wallet);
      } else {
        localStorage.setItem("xSID", app.wallet);
      }
      window.location = app.standaloneURL;
    },
    logout() {
      const app = this;
      app.$buefy.dialog.confirm({
        message: "Do you really want to exit?",
        onConfirm: () => {
          localStorage.setItem("xSID", "");
          localStorage.setItem("SID", "");
          localStorage.setItem("wallet", "[]");
          localStorage.setItem("xsid", "[]");
          window.location = app.standaloneURL;
        },
      });
    },
  },
};
</script>

<style>
#nav {
  font-size: 12px;
}
html {
  background-color: #edeae5!important;
  background-size: cover;
  background-position: center;
  background-attachment: fixed !important;
  background-repeat: no-repeat;
  overflow-y: inherit;
  padding: 40px 10px !important;
  height: 100vh;
  font-family: "Sen", sans-serif !important;
}
.popup {
  min-width: 350px;
  width: 100%;
  text-align: center;
}
</style>
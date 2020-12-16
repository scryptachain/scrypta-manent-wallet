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
      <div class="container">
        <div class="columns">
          <div class="column">
            <div></div>
          </div>
          <div class="column is-three-quarters" style="text-align: center">
            <div class="columns">
              <div class="column">
                <b-dropdown aria-role="list" style="float:left;">
                  <button
                    style="
                      border: 0 !important;
                      border-radius: 300px;
                      margin:0px!important;
                      padding:0px!important;
                      background: transparent;
                      padding-top:4px;
                    "
                    slot="trigger"
                  >
                    <v-gravatar
                      class="avatar"
                      style="
                          float: left;
                          border-radius: 300px;
                          margin:0px!important;
                          margin-top:-4px!important;
                          padding:0!important;
                          width: 35px;
                          height: 35px;
                          text-align: left !important;
                      "
                      :email="wallet.master"
                    />
                  </button>
                  <b-dropdown-item
                    aria-role="listitem"
                    v-for="identity in xsid"
                    v-bind:key="identity.wallet"
                    style="cursor: pointer"
                  >
                    <div v-on:click="setAsDefault(identity.wallet)">
                      <v-gravatar
                        :email="identity.xpub"
                        style="
                          float: left;
                          border-radius: 300px;
                          margin-top: -2px;
                          margin-right: 8px;
                          width: 35px;
                          height: 35px;
                          text-align: left !important;
                        "
                      />
                      <b style="font-size: 12px">{{ identity.label }}</b
                      ><br />
                      <span style="font-size: 9px"
                        >{{ identity.xpub.substr(0, 10) }}...{{
                          identity.xpub.substr(-10)
                        }}</span
                      >
                    </div>
                  </b-dropdown-item>
                  <b-dropdown-item
                    aria-role="listitem"
                    v-for="identity in sid"
                    v-bind:key="identity.wallet"
                    style="cursor: pointer"
                  >
                    <div v-on:click="setAsDefault(identity.wallet)">
                      <v-gravatar style="
                          float: left;
                          border-radius: 300px;
                          margin-top: -2px;
                          margin-right: 8px;
                          width: 35px;
                          height: 35px;
                          text-align: left !important;" :email="identity.address" />
                      <b style="font-size: 12px">{{ identity.label }}</b
                      ><br />
                      <span style="font-size: 9px"
                        >{{ identity.address.substr(0, 10) }}...{{
                          identity.address.substr(-10)
                        }}</span
                      >
                    </div>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <div class="column">
                <img
                  class="logo"
                  src="../assets/logo.png"
                  width="150px"
                /><br /><br />
              </div>
              <div class="column">
                <a href="#" v-on:click="logout">
                  <b-icon icon="logout" style="float:right" class="logout" size="is-medium"></b-icon
                ></a>
              </div>
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
      <div class="container">
        <div class="columns">
          <div class="column"></div>
          <div class="column is-three-quarters">
            <div class="card">
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
                    <div class="columns is-mobile">
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
                          ><b-icon
                            class="menu-icon"
                            icon="package-down"
                          ></b-icon>
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
const ScryptaDB = require("../libs/db");

export default {
  components: { Create, Login },
  name: "App",
  data() {
    return {
      standaloneURL: "",
      scrypta: new ScryptaCore(true),
      db: new ScryptaDB(true),
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
      sid: [],
      xsid: [],
      label: "New Identity",
    };
  },
  async mounted() {
    const app = this;
    app.wallet = await app.user.auth();
    app.sid = await app.db.get("wallet");
    app.xsid = await app.db.get("xsid");
    if (navigator.userAgent.indexOf("Firefox") === -1) {
      if (
        chrome !== undefined &&
        chrome.runtime !== undefined &&
        chrome.runtime.getURL !== undefined
      ) {
        app.standaloneURL = chrome.runtime.getURL("/index.html");
      } else {
        app.standaloneURL = "/#/";
      }
    } else {
      app.standaloneURL = "index.html#";
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
    async setAsDefault(wallet) {
      const app = this;
      localStorage.setItem("default", wallet);
      app.wallet = await app.user.auth();
      let balance = await app.scrypta.get("/balance/" + app.wallet.master);
      app.balance = balance.balance;
      location.reload();
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
          location.reload();
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
  background-color: #edeae5 !important;
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
.dropdown-item {
  text-align: left !important;
  line-height: 15px !important;
}

@media screen and (max-width: 768px) {
  .media-content {
    padding-right: 70px;
  }
  #nav .mdi-24px.mdi-set,
  #nav .mdi-24px.mdi:before {
    font-size: 18px !important;
  }
  #nav a {
    font-size: 10px !important;
  }
  .column {
    padding: 0 !important;
  }
  .logout {
    right: 25px !important;
    top: -52px !important;
  }
  .avatar {
    left: 25px !important;
    top: -52px !important;
  }
  .logo {
    margin-top: 16px !important;
  }
  html {
    padding-top: 0px !important;
  }
  .qr {
    width: 100% !important;
  }
  .modal-card {
    width: 100% !important;
  }
  .media-left {
    display: none !important;
  }
}
</style>
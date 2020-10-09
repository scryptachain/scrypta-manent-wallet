<template>
  <div class="popup">
    <div v-if="!wallet">
      <Create v-on:logged="logWithWallet" />
    </div>
    <div v-if="wallet">
      <a
        :href="standaloneURL"
        target="_blank"
        style="position: absolute; top: 10px; right: 10px; z-index: 9"
      >
        <b-icon icon="export-variant" size="is-small"></b-icon>
      </a>
      <div
        style="
          float: left;
          position: absolute;
          top: 13px;
          left: 10px;
          text-align: left !important;
          width: 100%;
        "
      >
        <div v-clipboard="wallet.master" style="cursor: pointer">
          <v-gravatar
            :email="wallet.master"
            style="
              float: left;
              border-radius: 4px;
              margin-top: -2px;
              margin-right: 8px;
              width: 35px;
              height: 35px;
            "
          />
          <b style="font-size: 12px">{{ wallet.label }}</b
          ><br />
          <span style="font-size: 9px">{{ wallet.master }}</span>
        </div>
      </div>
      <div
        style="
          border-top: 1px solid #ccc;
          width: 100%;
          margin-top: 20px;
          padding-top: 20px;
        "
      >
        <div v-if="injected.dapp !== undefined">
          <div style="margin: 15px 0">
            <span v-if="!injected.sid && !injected.xsid">{{
              $t("popup.compatible")
            }}</span>
            <span v-if="injected.sid || injected.xsid">{{
              $t("popup.connected")
            }}</span>
            <br />
            <h1 class="title is-2">{{ injected.dapp }}</h1>
          </div>
          <div v-if="showChange">
            <hr />
            {{ $t("popup.updatedversionfound") }}<br /><br />
            <b-button expanded v-on:click="updateIdentity" type="is-primary">{{
              $t("popup.updateidentity")
            }}</b-button>
            <hr />
          </div>
          <b-button
            v-if="!injected.sid && !injected.xsid"
            expanded
            v-on:click="useIdentity"
            type="is-primary"
            >{{ $t("popup.useidentity") }}</b-button
          >
          <b-button
            v-if="injected.sid || injected.xsid"
            expanded
            v-on:click="disconnectIdentity"
            type="is-primary"
            >{{ $t("popup.disconnect") }}</b-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const ScryptaCore = require("@scrypta/core");
const ScryptaDB = require("../libs/db");
const User = require("../libs/user");
import Create from "../components/Create.vue";
import Dapp from "../libs/dapp.js";

export default {
  components: { Create },
  name: "App",
  data() {
    return {
      standaloneURL: "",
      scrypta: new ScryptaCore(true),
      db: new ScryptaDB(true),
      user: User,
      dapp: Dapp,
      error: false,
      recover: false,
      created: false,
      newSeed: "",
      wallet: "",
      password: "",
      passwordrepeat: "",
      injected: "",
      mnemonic: "",
      label: "New Identity",
    };
  },
  async mounted() {
    const app = this;
    app.standaloneURL = chrome.runtime.getURL("/index.html");
    app.injected = await app.dapp.check();
    if (
      app.injected !== undefined &&
      app.injected !== false &&
      app.injected.sid !== undefined &&
      app.injected.xsid !== undefined
    ) {
      if (app.injected.sid !== null) {
        let SIDS = app.injected.sid.split(":");
        let check = await app.db.get("wallet", "address", SIDS[0]);
        if (check.address !== undefined) {
          app.wallet = await app.user.auth(app.injected.sid);
          if (app.wallet.sid !== app.injected.sid) {
            app.showChange = true;
          }
        } else {
          app.injected.sid = "";
          app.injected.xsid = "";
          app.wallet = await app.user.auth();
        }
      } else if (app.injected.xsid !== null) {
        let SIDS = app.injected.xsid.split(":");
        let check = await app.db.get("xsid", "xpub", SIDS[0]);
        if (check.address !== undefined) {
          app.wallet = await app.user.auth(app.injected.xsid);
        } else {
          app.injected.sid = "";
          app.injected.xsid = "";
          app.wallet = await app.user.auth();
        }
      } else {
        app.injected.sid = "";
        app.injected.xsid = "";
        app.wallet = await app.user.auth();
      }
    } else {
      app.wallet = await app.user.auth();
    }
  },
  methods: {
    async logWithWallet() {
      const app = this;
      app.wallet = await app.user.auth();
    },
    async useIdentity() {
      const app = this;
      if (app.wallet.master.indexOf("xpub") !== -1) {
        app.dapp.inject(app.wallet.xsid);
      } else {
        app.dapp.inject(app.wallet.sid);
      }
      app.injected = await app.dapp.check();
    },
    async disconnectIdentity() {
      const app = this;
      app.dapp.disconnect();
      app.injected = await app.dapp.check();
    },
    async updateIdentity() {
      const app = this;
      app.$buefy.dialog.confirm({
        title: app.$t("popup.updateid"),
        message: app.$t("popup.updateconfirm"),
        confirmText: app.$t("popup.updateid"),
        type: "is-danger",
        hasIcon: true,
        onConfirm: async () => {
          if (app.wallet.master.indexOf("xpub") !== -1) {
            app.wallet.wallet = app.injected.xsid
            await app.db.update("xsid", "xpub", app.wallet.master, app.wallet)
            app.wallet = await app.user.auth(app.injected.xsid)
          } else {
            app.wallet.wallet = app.injected.sid
            await app.db.update("wallet", "address", app.wallet.master, app.wallet)
            app.wallet = await app.user.auth(app.injected.sid)
          }
          app.showChange = false
        },
      });
    },
  },
};
</script>

<style>
html {
  padding: 40px 10px !important;
  font-family: "Sen", sans-serif !important;
  line-height: 1 !important;
}
body {
  line-height: 1 !important;
}
.popup {
  min-width: 350px;
  width: 100%;
  text-align: center;
}
.card,
.card-content {
  margin: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
}
</style>
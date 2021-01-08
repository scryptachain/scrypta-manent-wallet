<template>
  <div class="popup">
    <div v-if="!wallet">
      <Create v-on:logged="logWithWallet" />
    </div>
    <div v-if="wallet && !showSwitch">
      <a
        :href="standaloneURL"
        target="_blank"
        style="position: absolute; top: 18px; right: 10px; z-index: 9"
      >
        <b-icon icon="export-variant"></b-icon>
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
            v-on:click="toggleSwitch"
            :email="wallet.master"
            style="
              float: left;
              border-radius: 300px;
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
        <div style="margin-top: 5px" v-if="!tosign.message || !tosign.tosign">
          <b>{{ $t("popup.balance") }}</b
          ><br />
          {{ balance }} LYRA
          <hr />
        </div>
        <div v-if="injected !== undefined && injected.dapp !== undefined">
          <div style="margin: 15px 0">
            <span v-if="!injected.sid && !injected.xsid">{{
              $t("popup.compatible")
            }}</span>
            <span v-if="injected.sid || injected.xsid">{{
              $t("popup.connected")
            }}</span>
            <br />
            <h1 class="title is-2">{{ injected.dapp }}</h1>
            <div v-if="tosign.message && tosign.tosign">
              <div v-if="!showUnlock">
                {{ $t("popup.tosign") }}:
                <hr />
                {{ tosign.message }}
                <hr />
                <b-button
                  expanded
                  v-on:click="showUnlock = true"
                  type="is-success"
                  >{{ $t("popup.sign") }}</b-button
                >
                <b-button
                  expanded
                  v-on:click="dismissTransaction"
                  type="is-primary"
                  >{{ $t("popup.dismiss") }}</b-button
                >
              </div>
              <div v-if="showUnlock">
                <hr />
                <b-field :label="$t('popup.insertpassword')">
                  <b-input
                    type="password"
                    v-model="password"
                    password-reveal
                  ></b-input>
                </b-field>
                <b-button
                  expanded
                  v-on:click="sendTransaction"
                  type="is-success"
                  >{{ $t("popup.sendtransaction") }}</b-button
                >
              </div>
            </div>
            <div v-if="!tosign.message || !tosign.tosign">
              <b-button
                v-if="injected.sid || injected.xsid"
                expanded
                v-on:click="disconnectIdentity"
                type="is-primary"
                >{{ $t("popup.disconnect") }}</b-button
              >
            </div>
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
        </div>
      </div>
    </div>
    <div v-if="wallet && showSwitch" style="text-align: left">
      <div class="text-center" style="margin-top: -15px">
        <div
          v-on:click="toggleSwitch"
          style="position: absolute; top: 25px; left: 15px"
        >
          <img src="/img/back.png" style="height: 20px; cursor: pointer" />
        </div>
        <b>{{ $t("popup.selectid") }}</b>
      </div>
      <hr />
      <div
        v-for="identity in xsid"
        v-bind:key="identity.wallet"
        style="cursor: pointer"
      >
        <div v-on:click="setAsDefault(identity.wallet)">
          <v-gravatar
            :email="identity.master"
            style="
              float: left;
              border-radius: 300px;
              margin-top: -2px;
              margin-right: 8px;
              width: 35px;
              height: 35px;
            "
          />
          <b style="font-size: 12px">{{ identity.label }}</b
          ><br />
          <span style="font-size: 9px"
            >{{ identity.xpub.substr(0, 10) }}...{{
              identity.xpub.substr(-10)
            }}</span
          ><br /><br />
        </div>
      </div>
      <div
        v-for="identity in sid"
        v-bind:key="identity.wallet"
        style="cursor: pointer"
      >
        <div v-on:click="setAsDefault(identity.wallet)">
          <v-gravatar
            :email="identity.address"
            style="
              float: left;
              border-radius: 300px;
              margin-top: -2px;
              margin-right: 8px;
              width: 35px;
              height: 35px;
            "
          />
          <b style="font-size: 12px">{{ identity.label }}</b
          ><br />
          <span style="font-size: 9px"
            >{{ identity.address.substr(0, 10) }}...{{
              identity.address.substr(-10)
            }}</span
          ><br /><br />
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
      showChange: false,
      showSwitch: false,
      showUnlock: false,
      balance: 0,
      newSeed: "",
      wallet: "",
      password: "",
      passwordrepeat: "",
      tosign: "",
      injected: "",
      mnemonic: "",
      label: "New Identity",
      sid: [],
      xsid: [],
    };
  },
  async mounted() {
    const app = this;
    if (navigator.userAgent.indexOf("Firefox") === -1) {
      if (
        chrome !== undefined &&
        chrome.runtime !== undefined &&
        chrome.runtime.getURL !== undefined
      ) {
        let url = chrome.runtime.getURL("/index.html");
        app.standaloneURL = url + "#";
      } else {
        app.standaloneURL = "/#";
      }
    } else {
      app.standaloneURL = "index.html#";
    }
    app.injected = await app.dapp.check();
    app.tosign = await app.dapp.tosign();
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
        app.wallet = await app.user.auth(app.injected.xsid);
      } else {
        app.injected.sid = "";
        app.injected.xsid = "";
        app.wallet = await app.user.auth();
      }
    } else {
      app.wallet = await app.user.auth();
    }
    let balance = await app.scrypta.get("/balance/" + app.wallet.master);
    app.balance = balance.balance;
  },
  methods: {
    async logWithWallet() {
      const app = this;
      app.wallet = await app.user.auth();
    },
    async toggleSwitch() {
      const app = this;
      app.sid = await app.db.get("wallet");
      app.xsid = await app.db.get("xsid");
      for (let k in app.xsid) {
        let master = await app.scrypta.deriveKeyfromXPub(
          app.xsid[k].xpub,
          "m/0"
        );
        app.xsid[k].master = master.pub;
      }
      if (app.showSwitch === true) {
        app.showSwitch = false;
      } else {
        app.showSwitch = true;
      }
    },
    async useIdentity() {
      const app = this;
      if (app.wallet.xsid !== undefined) {
        app.dapp.inject(app.wallet.xsid);
      } else {
        app.dapp.inject(app.wallet.sid);
      }
      app.injected = await app.dapp.check();
    },
    async sendTransaction() {
      const app = this;
      if (app.password !== undefined) {
        let privkey = "";
        let key;
        let SIDS;
        if (app.wallet !== false && app.wallet.sid !== undefined) {
          key = await app.scrypta.readKey(app.password, app.wallet.sid);
          if (key !== false) {
            key.sid = app.wallet.sid;
          }
        } else if (app.wallet.xsid !== undefined) {
          let xkey = await app.scrypta.readxKey(app.password, app.wallet.xsid);
          if (xkey !== false) {
            key = await app.scrypta.deriveKeyFromSeed(xkey.seed, "m/0");
            let importkey = await app.scrypta.importPrivateKey(
              key.prv,
              app.password,
              false
            );
            key.sid = importkey.walletstore;
          }
        }
        if (key !== false) {
          let SIDS = key.sid.split(":");
          key.address = SIDS[0];
          app.isSending = true;

          let estimatedlength = app.tosign.tosign;
          let fees = Math.ceil(app.tosign.tosign / 7500) * 0.001;
          let balance = await app.scrypta.get("/balance/" + key.address);

          if (balance.balance >= parseFloat(fees)) {
            let signed = await app.scrypta.signRawTransaction(
              app.tosign.tosign,
              key.prv
            );
            let sent = await app.scrypta.sendRawTransaction(signed);
            if (sent.length === 64) {
              app.dapp.confirm(sent);
              app.dapp.dismiss();
              app.tosign = {};
              app.$buefy.toast.open({
                message: app.$t("popup.transactionsent"),
                type: "is-success",
              });
            } else {
              app.$buefy.toast.open({
                message: app.$t("payments.transactionerror"),
                type: "is-danger",
              });
            }
          } else {
            app.isSending = false;
            app.$buefy.toast.open({
              message: app.$t("payments.notenoughfunds"),
              type: "is-danger",
            });
          }
        } else {
          app.isSending = false;
          app.$buefy.toast.open({
            message: app.$t("payments.wrongpassword"),
            type: "is-danger",
          });
        }
      }
    },
    async dismissTransaction() {
      const app = this;
      app.tosign = {};
      app.dapp.dismiss();
    },
    async disconnectIdentity() {
      const app = this;
      app.dapp.disconnect();
      app.dapp.dismiss();
      app.tosign = {};
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
            app.wallet.wallet = app.injected.xsid;
            await app.db.update("xsid", "xpub", app.wallet.master, app.wallet);
            app.wallet = await app.user.auth(app.injected.xsid);
          } else {
            app.wallet.wallet = app.injected.sid;
            await app.db.update(
              "wallet",
              "address",
              app.wallet.master,
              app.wallet
            );
            app.wallet = await app.user.auth(app.injected.sid);
          }
          app.showChange = false;
        },
      });
    },
    async setAsDefault(wallet) {
      const app = this;
      localStorage.setItem("default", wallet);
      app.wallet = await app.user.auth();
      let balance = await app.scrypta.get("/balance/" + app.wallet.master);
      app.balance = balance.balance;
      app.dapp.dismiss();
      app.tosign = {};
      app.useIdentity();
      app.toggleSwitch();
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
  margin-bottom: -20px;
  padding-bottom: 0;
  text-align: center;
}
.card,
.card-content {
  margin: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
}
</style>
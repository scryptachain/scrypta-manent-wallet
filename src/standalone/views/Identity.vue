<template>
  <div class="text-left">
    <h1 class="title is-2">
      {{ $t("identities.manage") }}<br />
      <span style="font-size: 12px">{{ identity }}</span>
    </h1>
    <b-tabs :animated="false" expanded>
      <b-tab-item :label="$t('identities.management')">
        <br />
        <b-button v-on:click="setAsDefault" type="is-primary" expanded
          >SET AS DEFAULT</b-button
        ><br />
        <b-button v-on:click="toggleChangePassword" type="is-primary" expanded
          >CHANGE PASSWORD</b-button
        ><br />
        <b-button v-on:click="deleteIdentity" type="is-primary" expanded
          >DELETE IDENTITY</b-button
        >
      </b-tab-item>
      <b-tab-item :label="$t('identities.did')">
        <br />
        <b-button type="is-primary" expanded>REGISTER DID NAME WITH SC</b-button
        ><br />
        <b-button type="is-primary" expanded>OPEN SCRYPTAID</b-button>
      </b-tab-item>
      <b-tab-item :label="$t('identities.backup')">
        <br />
        <b-button
          v-if="identity.indexOf('xpub') !== -1"
          type="is-primary"
          expanded
          >SHOW MNEMONIC</b-button
        ><br v-if="identity.indexOf('xpub') !== -1" />
        <b-button
          v-if="identity.indexOf('xpub') === -1"
          type="is-primary"
          expanded
          >SHOW PRIVATE KEY</b-button
        ><br v-if="identity.indexOf('xpub') === -1" />
        <b-button
          v-if="identity.indexOf('xpub') === -1"
          type="is-primary"
          expanded
          >BACKUP .SID FILE</b-button
        ><br v-if="identity.indexOf('xpub') === -1" />
        <b-button type="is-primary" expanded>PRINT PAPER WALLET</b-button>
      </b-tab-item>
    </b-tabs>
    <b-modal
      v-model="showChangePassword"
      has-modal-card
      trap-focus
      :destroy-on-hide="true"
      aria-role="dialog"
      aria-modal
    >
      <template>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">{{ $t('identities.changepassword') }}</p>
            <button type="button" class="delete" @click="toggleChangePassword" />
          </header>
          <section class="modal-card-body">
            <b-field :label="$t('identities.oldpassword')">
              <b-input
                type="password"
                :value="password"
                v-model="password"
                password-reveal
                required
              >
              </b-input>
            </b-field>

            <b-field :label="$t('identities.newpassword')">
              <b-input
                type="password"
                :value="password"
                v-model="newpassword"
                password-reveal
                required
              >
              </b-input>
            </b-field>

            <b-field :label="$t('identities.repeatnewpassword')">
              <b-input
                type="password"
                :value="password"
                v-model="repeatnewpassword"
                password-reveal
                required
              >
              </b-input>
            </b-field>
          </section>
          <footer class="modal-card-foot">
            <button v-on:click="changePassword" class="button is-primary" style="width:100%">{{ $t('identities.changepassword') }}</button>
          </footer>
        </div>
      </template>
    </b-modal>
  </div>
</template>


<script>
let ScryptaCore = require("@scrypta/core");
import User from "../../libs/user";
import ScryptaDB from "../../libs/db";

export default {
  name: "Identities",
  data() {
    return {
      scrypta: new ScryptaCore(true),
      db: new ScryptaDB(true),
      address: "",
      wallet: "",
      identity: "",
      showChangePassword: false,
      details: {},
      sid: [],
      xsid: [],
      isLogging: true,
      isLoading: true,
      searcher: "",
      password: "",
      newpassword: "",
      repeatnewpassword: ""
    };
  },
  async mounted() {
    const app = this;
    app.scrypta.staticnodes = true;
    app.wallet = await User.auth();
    app.isLogging = false;
    app.identity = app.$route.params.identity;
    app.getIdentity();
  },
  methods: {
    toggleChangePassword() {
      const app = this;
      if (app.showChangePassword === false) {
        app.showChangePassword = true;
      } else {
        app.showChangePassword = false;
      }
    },
    async getIdentity() {
      const app = this;
      if (app.identity.indexOf("xpub") !== -1) {
        app.details = await app.db.get("xsid", "xpub", app.identity);
      } else {
        app.details = await app.db.get("wallet", "address", app.identity);
      }
    },
    setAsDefault() {
      const app = this;
      localStorage.setItem("default", app.identity);
      app.$buefy.toast.open({
        message: app.$t("identities.identityselected"),
        type: "is-success",
      });
    },
    deleteIdentity() {
      const app = this;
      this.$buefy.dialog.confirm({
        title: "Deleting account",
        confirmText: "Delete Account",
        type: "is-danger",
        hasIcon: true,
        message: app.$t("identities.continuedelete"),
        onConfirm: async () => {
          app.sid = await app.db.get("wallet");
          app.xsid = await app.db.get("xsid");
          if (app.sid.length >= 1 || app.xsid.length >= 1) {
            app.$buefy.toast.open({
              message: app.$t("identities.deleted"),
              type: "is-success",
            });

            let defaultsid = await localStorage.getItem("default");
            if (app.identity.indexOf("xpub") !== -1) {
              await app.db.delete("xsid", "xpub", app.identity);
              await localStorage.setItem("xSID", "");
            } else {
              await app.db.delete("wallet", "address", app.identity);
              await localStorage.setItem("SID", "");
            }

            app.sid = await app.db.get("wallet");
            app.xsid = await app.db.get("xsid");

            if (app.xsid > 0 && app.xsid[0] !== undefined) {
              await localStorage.setItem("default", app.xsid[0].wallet);
              await localStorage.setItem("xSID", app.xsid[0].wallet);
            } else if (app.sid > 0 && app.sid[0] !== undefined) {
              await localStorage.setItem("default", app.xsid[0].wallet);
              await localStorage.setItem("SID", app.xsid[0].wallet);
            }
            let url = chrome.runtime.getURL("/index.html");
            window.location = url + "#/identities";
            app.$forceUpdate();
          } else {
            app.$buefy.toast.open({
              message: app.$t("identities.cantdelete"),
              type: "is-danger",
            });
          }
        },
      });
    },
    async changePassword(){
      const app = this;
      if(app.password !== '' && app.newpassword !== '' && app.repeatnewpassword !== '' && app.newpassword === app.repeatnewpassword){
        if(app.identity.indexOf('xpub') !== -1){
          let check = await app.scrypta.readxKey(app.password, app.wallet)
          if(check !== false){
            console.log(check)
          }else{
            app.$buefy.toast.open({
              message: app.$t("identities.wrongpassword"),
              type: "is-danger",
            });
          }
        }else{
          let check = await app.scrypta.readKey(app.password, app.details.wallet)
          if(check !== false){
            let updated = await app.scrypta.importPrivateKey(check.prv, app.newpassword, false)
            let old = await app.db.get('wallet', 'address', app.identity)
            old.wallet = updated.walletstore
            await app.db.update('wallet', 'address', app.identity, old)
            app.$buefy.toast.open({
              message: app.$t("identities.passwordchanged"),
              type: "is-success",
            });
            app.getIdentity();
            app.toggleChangePassword()
            app.password = ''
            app.newpassword = ''
            app.repeatnewpassword = ''
          }else{
            app.$buefy.toast.open({
              message: app.$t("identities.wrongpassword"),
              type: "is-danger",
            });
          }
        }
      }else{
        app.$buefy.toast.open({
          message: app.$t("identities.fillallfields"),
          type: "is-danger",
        });
      }
    }
  },
};
</script>
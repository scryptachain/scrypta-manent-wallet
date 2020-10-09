<template>
  <div class="text-left">
    <h1 class="title is-2">
      {{ $t("identities.manage") }}<br>
      <span style="font-size:12px">{{identity}}</span>
    </h1>
      <b-tabs :animated="false" expanded>
        <b-tab-item :label="$t('identities.management')">
          <br>
          <b-button v-on:click="setAsDefault" type="is-primary" expanded>SET AS DEFAULT</b-button><br>
          <b-button type="is-primary" expanded>CHANGE PASSWORD</b-button><br>
          <b-button v-on:click="deleteIdentity" type="is-primary" expanded>DELETE IDENTITY</b-button>
        </b-tab-item>
        <b-tab-item :label="$t('identities.did')">
          <br>
          <b-button type="is-primary" expanded>REGISTER DID NAME WITH SC</b-button><br>
          <b-button type="is-primary" expanded>OPEN SCRYPTAID</b-button>
        </b-tab-item>
        <b-tab-item :label="$t('identities.backup')">
          <br>
          <b-button v-if="identity.indexOf('xpub') !== -1" type="is-primary" expanded>SHOW MNEMONIC</b-button><br v-if="identity.indexOf('xpub') !== -1">
          <b-button v-if="identity.indexOf('xpub') === -1" type="is-primary" expanded>SHOW PRIVATE KEY</b-button><br v-if="identity.indexOf('xpub') === -1">
          <b-button v-if="identity.indexOf('xpub') === -1" type="is-primary" expanded>BACKUP .SID FILE</b-button><br v-if="identity.indexOf('xpub') === -1">
          <b-button type="is-primary" expanded>PRINT PAPER WALLET</b-button>
        </b-tab-item>
      </b-tabs>      

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
      details: {},
      sid: [],
      xsid: [],
      isLogging: true,
      isLoading: true,
      searcher: "",
    };
  },
  async mounted() {
    const app = this;
    app.scrypta.staticnodes = true;
    app.wallet = await User.auth();
    app.isLogging = false;
    app.identity = app.$route.params.identity
    app.getIdentity();
  },
  methods: {
    async getIdentity(){
      const app = this
      if(app.identity.indexOf('xpub') !== -1){
        app.details = await app.db.get('xsid','xpub',app.identity)
      }else{
        app.details = await app.db.get('wallet','address',app.identity)
      }
    },
    setAsDefault(){
      const app = this
      localStorage.setItem('default', app.identity)
      app.$buefy.toast.open({
        message: app.$t("identities.identityselected"),
        type: "is-success",
      });
    },
    deleteIdentity(){
      const app = this
      app.$buefy.dialog.confirm({
          message: app.$t('identities.continuedelete'),
          onConfirm: async () => {
            app.sid = await app.db.get("wallet");
            app.xsid = await app.db.get("xsid");
            if(app.sid.length >= 1 || app.xsid.length >= 1){
              app.$buefy.toast.open({
                message: app.$t('identities.deleted'),
                type: "is-success",
              })
              let defaultsid = await localStorage.getItem('default')
              if(app.identity.indexOf('xpub') !== -1){
                await app.db.delete('xsid', 'xpub', app.identity)
                await localStorage.setItem('xSID', '')
              }else{
                await app.db.delete('wallet', 'address', app.identity)
                await localStorage.setItem('SID', '')
              }
              app.sid = await app.db.get("wallet");
              app.xsid = await app.db.get("xsid");
              if(app.xsid > 0 && app.xsid[0] !== undefined){
                await localStorage.setItem('default', app.xsid[0].wallet)
                await localStorage.setItem('xSID', app.xsid[0].wallet)
              }else if(app.sid > 0 && app.sid[0] !== undefined){
                await localStorage.setItem('default', app.xsid[0].wallet)
                await localStorage.setItem('SID', app.xsid[0].wallet)
              }
              let url = chrome.runtime.getURL("/index.html");
              window.location = url + '#/identities'
              app.$forceUpdate();
            }else{
              app.$buefy.toast.open({
                message: app.$t('identities.cantdelete'),
                type: "is-danger",
              })
            }
          }
      })
    }
  },
};
</script>
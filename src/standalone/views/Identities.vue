<template>
  <div class="text-left">
    <h1 class="title is-2">
      {{ $t("identities.youridentities") }}
      <div
        @click="toggleLogin"
        style="float: right; color: #D8213B; cursor:pointer"
        ><b-icon style="" icon="plus"></b-icon
      ></div>
    </h1>
    <div v-if="sid.length > 0">
      <h1 class="title is-4" style="font-size: 14px !important">
        {{ $t("identities.legacy") }}
      </h1>
      <div
        v-for="identity in sid"
        v-bind:key="identity.address"
        style="margin-bottom: 15px"
      >
        <div class="card">
          <div class="card-content text-left" style="padding: 10px">
            <div class="media">
              <div class="media-left">
                <figure style="margin-top: 5px" class="image is-32x32">
                  <v-gravatar
                    style="border-radius: 4px"
                    :email="identity.address"
                  />
                </figure>
              </div>
              <div class="media-content" style="position: relative">
                <p class="title is-5" style="margin: 0">
                  {{ identity.label }}
                </p>
                <p class="title is-6" style="margin: 0 0 3px 0">
                  {{ identity.address }}
                  <button v-clipboard="identity.address">copy</button>
                </p>
                <a :href="standaloneURL + '/identity/' + identity.address">
                  <div
                    style="position: absolute; top: 7px; right: 7px; color: #D8213B"
                    ><b-icon style="" icon="eye"></b-icon
                  ></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="xsid.length > 0">
      <h1 class="title is-4" style="font-size: 14px !important">
        {{ $t("identities.advanced") }}
      </h1>
      <div
        v-for="identity in xsid"
        v-bind:key="identity.xpub"
        style="margin-bottom: 15px"
      >
        <div class="card">
          <div class="card-content text-left" style="padding: 10px">
            <div class="media">
              <div class="media-left">
                <figure style="margin-top: 5px" class="image is-32x32">
                  <v-gravatar
                    style="border-radius: 4px"
                    :email="identity.master"
                  />
                </figure>
              </div>
              <div class="media-content" style="position: relative">
                <p class="title is-5" style="margin: 0">
                  {{ identity.label }}
                </p>
                <p class="title is-6" style="margin: 0 0 3px 0">
                  {{ identity.xpub.substr(0, 17) }}...{{
                    identity.xpub.substr(-17)
                  }}
                  <button v-clipboard="identity.xpub">copy</button>
                </p>
                <a :href="standaloneURL + '/identity/' + identity.xpub">
                  <div
                    style="position: absolute; top: 7px; right: 7px; color: #D8213B"
                    ><b-icon style="" icon="eye"></b-icon
                  ></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      v-model="showLogin"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
    >
      <template>
        <div class="modal-card" style="width: 600px">
          <header class="modal-card-head">
            <p class="modal-card-title">{{ $t("identities.addnew") }}</p>
            <button type="button" class="delete" @click="toggleLogin" />
          </header>
          <section class="modal-card-body">
            <Login embed="true" v-on:logged="logWithWallet" />
          </section>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
let ScryptaCore = require("@scrypta/core");
import User from "../../libs/user";
import ScryptaDB from "../../libs/db";
import Login from "../../components/Login";

export default {
  components: { Login },
  name: "Identities",
  data() {
    return {
      scrypta: new ScryptaCore(true),
      db: new ScryptaDB(true),
      standaloneURL: "",
      showLogin: false,
      address: "",
      wallet: "",
      sid: [],
      xsid: [],
      isLogging: true,
      isLoading: true,
      searcher: "",
    };
  },
  async mounted() {
    const app = this;
    app.wallet = await User.auth();
    app.scrypta.staticnodes = true
    app.isLogging = false;
    if (navigator.userAgent.indexOf("Firefox") === -1) {
      if(chrome !== undefined && chrome.runtime !== undefined && chrome.runtime.getURL !== undefined){
        let url = chrome.runtime.getURL("/index.html");
        app.standaloneURL = url + '#'
      }else{
        app.standaloneURL = '/#'
      }
    }else{
      app.standaloneURL = '/#'
    }
    app.fetchIdentities();
  },
  methods: {
    async fetchIdentities() {
      const app = this;
      app.sid = await app.db.get("wallet");
      let xsid = await app.db.get("xsid");
      for(let k in xsid){
        let master = await app.scrypta.deriveKeyfromXPub(xsid[k].xpub, 'm/0')
        xsid[k].master = master.pub
      }
      app.xsid = xsid
    },
    logWithWallet(value) {
      const app = this;
      app.wallet = value;
      if (app.wallet.indexOf("xpub") === -1) {
        localStorage.setItem("SID", app.wallet);
      } else {
        localStorage.setItem("xSID", app.wallet);
      }
      location.reload();
    },
    toggleLogin() {
      const app = this;
      if (app.showLogin === true) {
        app.showLogin = false;
      } else {
        app.showLogin = true;
      }
    },
  },
};
</script>
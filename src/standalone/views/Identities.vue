<template>
  <div class="text-left">
    <h1 class="title is-2">
      {{ $t("identities.youridentities") }}
      <b-button
        @click="toggleLogin"
        style="float: right"
        type="is-primary"
        size="is-small"
        ><b-icon style="margin-top: 1px" icon="plus"></b-icon
      ></b-button>
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
                <a :href="'/index.html#/identity/' + identity.address">
                  <b-button
                    style="position: absolute; top: 7px; right: 7px"
                    type="is-primary"
                    size="is-small"
                    ><b-icon style="margin-top: 1px" icon="eye"></b-icon
                  ></b-button>
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
                    :email="identity.xpub"
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
                <a :href="'/index.html#/identity/' + identity.xpub">
                  <b-button
                    style="position: absolute; top: 7px; right: 7px"
                    type="is-primary"
                    size="is-small"
                    ><b-icon style="margin-top: 1px" icon="eye"></b-icon
                  ></b-button>
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
    app.isLogging = false;
    app.fetchIdentities();
  },
  methods: {
    async fetchIdentities() {
      const app = this;
      app.sid = await app.db.get("wallet");
      app.xsid = await app.db.get("xsid");
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
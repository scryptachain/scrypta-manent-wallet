<template>
  <div class="text-left">
    <h1 class="title is-2">
      {{ $t("notarize.notarize") }}
      <div
        @click="toggleNew"
        style="float: right; color: #D8213B; cursor:pointer"
        ><b-icon icon="plus"></b-icon
      ></div>
    </h1>
    <div v-if="written.length > 0">
      <br>
      <div
        v-for="data in written"
        v-bind:key="data.uuid"
        style="margin-bottom: 15px"
      >
        <a v-if="data.protocol !== 'chain://'" :href="'https://proof.scryptachain.org/#/uuid/' + data.uuid" target="_blank">
          <div class="card">
            <div class="card-content text-left" style="padding: 10px">
              <div class="media">
                <div class="media-left">
                  <figure style="margin-top: 5px" class="image is-32x32">
                    <v-gravatar
                      style="border-radius: 4px"
                      :email="data.uuid"
                    />
                  </figure>
                </div>
                <div class="media-content" style="word-break: break-word; padding-right:5px!important">
                  <p v-if="data.refID" class="title is-5" style="margin: 0">
                    {{ data.refID }}
                  </p>
                  <p v-if="!data.refID" class="title is-5" style="margin: 0">
                    {{ data.uuid }}
                  </p>
                  <p class="title is-6" style="margin-bottom: 3px">
                    {{ $t('notarize.block') }}: {{ data.block }}
                  </p>
                  <p>{{ data.data }}</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
    <div v-if="written.length === 0" class="text-center">
      {{ $t("notarize.nothingtoshow") }}
    </div>
    <b-modal
      v-model="showNotarize"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
    >
      <template>
        <div class="modal-card" style="width: 600px">
          <header class="modal-card-head">
            <p class="modal-card-title">{{ $t("notarize.addnew") }}</p>
            <button type="button" class="delete" @click="toggleNew" />
          </header>
          <section class="modal-card-body">
            <b-field :label="$t('notarize.title')">
              <b-input v-model="notarize.title"></b-input>
            </b-field>
            <b-field :label="$t('notarize.encrypt')">
              <b-select
                v-model="notarize.encrypt"
                :placeholder="$t('notarize.encrypt')"
              >
                <option value="false">{{ $t("notarize.noencrypt") }}</option>
                <option value="true">{{ $t("notarize.yesencrypt") }}</option>
              </b-select>
            </b-field>
            <b-field
              v-if="notarize.encrypt === true || notarize.encrypt === 'true'"
              :label="$t('notarize.password')"
            >
              <b-input
                type="password"
                v-model="notarize.password"
                password-reveal
              >
              </b-input>
            </b-field>
            <b-tabs :animated="false" expanded>
              <b-tab-item :label="$t('notarize.message')">
                <br>
                <b-field :label="$t('notarize.message')">
                  <b-input
                    v-model="notarize.message"
                    maxlength="7000"
                    type="textarea"
                  ></b-input>
                </b-field>
              </b-tab-item>
              <b-tab-item :label="$t('notarize.file')">
                <br>
                <b-upload v-if="!filename" v-on:input="calculateHash" v-model="dropFile" drag-drop>
                  <section class="section">
                    <div class="content has-text-centered">
                      <p>
                        <b-icon icon="upload" size="is-large"> </b-icon>
                      </p>
                      <p>Drop a file to calculate hash</p>
                    </div>
                  </section>
                </b-upload>
                <div v-if="filename" class="text-center">
                  <b>Selected file:</b> {{
                    filename
                  }}<br><br>
                  <b>Details:</b>
                  <pre style="text-align:left;">{{JSON.parse(notarize.message)}}</pre>
                  <b-button type="is-primary" v-on:click="deleteFile">REMOVE FILE</b-button>
                </div>
              </b-tab-item>
            </b-tabs>
            <b-button
              type="is-primary"
              v-if="!isSending"
              v-on:click="notarizeData"
              expanded
              >{{ $t("notarize.notarizenow") }}</b-button
            >
            <div v-if="isSending" class="text-center">
              {{ $t("notarize.iswriting") }}
            </div>
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
const crypto = require('crypto')

export default {
  name: "Notarize",
  data() {
    return {
      scrypta: new ScryptaCore(true),
      db: new ScryptaDB(true),
      showNotarize: false,
      address: "",
      wallet: "",
      sid: [],
      xsid: [],
      notarize: {
        title: "",
        message: "",
        encrypt: false,
        password: "",
      },
      written: [],
      isLogging: true,
      filename: '',
      isLoading: true,
      isSending: false,
      dropFile: {}
    };
  },
  async mounted() {
    const app = this;
    app.scrypta.staticnodes = true
    app.wallet = await User.auth();
    app.isLogging = false;
    app.fetchIdentities();
  },
  methods: {
    async fetchIdentities() {
      const app = this;
      app.sid = await app.db.get("wallet");
      app.xsid = await app.db.get("xsid");
      app.fetchWritten();
    },
    async fetchWritten() {
      const app = this;
      let written = await app.scrypta.post("/read", {
        address: app.wallet.master,
      });
      app.written = written.data;
    },
    toggleNew() {
      const app = this;
      if (app.showNotarize === false) {
        app.showNotarize = true;
      } else {
        app.showNotarize = false;
      }
    },
    async calculateHash(){
      const app = this
      let file = app.dropFile
      var reader = new FileReader();
      reader.onload = function(event) {
        var readed = event.target.result;
        let hash = crypto.createHash("sha256").update(new Uint8Array(readed)).digest("hex");
        app.notarize.message = JSON.stringify({
          hash: hash,
          filename: file.name,
          size: file.size,
          lastModified: file.lastModified,
          type: file.type
        })
        app.filename = file.name
      };

      reader.readAsArrayBuffer(file);
    },
    deleteFile(){
      const app = this
      app.filename = ''
      app.notarize.message = ''
    },
    notarizeData() {
      const app = this;
      if (app.notarize.message !== "") {
        app.$buefy.dialog.prompt({
          message: app.$t("payments.insertpassword"),
          inputAttrs: {
            type: "password",
          },
          trapFocus: false,
          onConfirm: async (password) => {
            let key;
            let SIDS
            if (app.wallet !== false && app.wallet.sid !== undefined) {
              key = await app.scrypta.readKey(password, app.wallet.sid);
              if (key !== false) {
                key.sid = app.wallet.sid;
              }
            } else if (app.wallet.xsid !== undefined) {
              let xkey = await app.scrypta.readxKey(password, app.wallet.xsid);
              if (xkey !== false) {
                key = await app.scrypta.deriveKeyFromSeed(xkey.seed, "m/0");
                let importkey = await app.scrypta.importPrivateKey(
                  key.prv,
                  password,
                  false
                )
                key.sid = importkey.walletstore
              }
            }
            if (key !== false) {
              let SIDS = key.sid.split(":");
              key.address = SIDS[0];
              app.isSending = true;
              // WRITING DATA
              let rawdata = app.notarize.message;
              let protocol = "";
              if (
                app.notarize.encrypt === true ||
                app.notarize.encrypt === "true"
              ) {
                rawdata = await app.scrypta.cryptData(
                  rawdata,
                  app.notarize.password
                );
                protocol = "E://";
              }

              let estimatedlength = rawdata + "***" + app.notarize.title;
              let fees = Math.ceil(estimatedlength.length / 7500) * 0.001;
              let balance = await app.scrypta.get("/balance/" + key.address);

              if (balance.balance >= parseFloat(fees)) {
                let written = await app.scrypta.write(
                  key.sid,
                  password,
                  rawdata,
                  "",
                  app.notarize.title,
                  protocol
                );
                if (
                  written.uuid !== undefined &&
                  written.txs !== undefined &&
                  written.txs.length > 0
                ) {
                  app.isSending = false;
                  app.$buefy.toast.open({
                    message: app.$t("notarize.writesuccess"),
                    type: "is-success",
                  });
                  app.showNotarize = false;
                  app.notarize = {
                    title: "",
                    message: "",
                    encrypt: false,
                    password: "",
                  };
                } else {
                  app.isSending = false;
                  app.$buefy.toast.open({
                    message: app.$t("notarize.writeerror"),
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
          },
        });
      } else {
        app.$buefy.toast.open({
          message: this.$t("notarize.writemessage"),
          type: "is-danger",
        });
      }
    },
  },
};
</script>

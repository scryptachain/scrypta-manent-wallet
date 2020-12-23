<template>
  <div class="home container">
    <div class="columns">
      <div class="column text-left">
        <b-tabs :animated="false" expanded>
          <b-tab-item :label="$t('payments.send')">
            <br />
            <h1 class="title is-2">{{ $t("payments.makepayment") }}</h1>
            <b-field label="Send to user">
              <b-autocomplete
                  v-model="name"
                  :data="filteredNameObj"
                  placeholder="Search an user by its name"
                  icon="magnify"
                  clearable
                  @select="option => selected = option">
                  <template slot="empty">No results found</template>
              </b-autocomplete>
            </b-field>
            <b-field :label="'Send to address'">
              <b-input class="text-left" v-model="payment.to"></b-input>
            </b-field>
            <b-field :label="$t('payments.asset')">
              <b-select
                v-model="selectedasset"
                placeholder="Select a character"
                expanded
              >
                <option value="LYRA">Scrypta (LYRA)</option>
                <option
                  v-for="sidechain in sidechains"
                  v-bind:key="sidechain.address"
                  :value="sidechain.address"
                >
                  {{ sidechain.name }} ({{ sidechain.address }})
                </option>
              </b-select>
            </b-field>
            <div style="position: relative">
              <div
                style="
                  position: absolute;
                  top: 30px;
                  z-index: 25;
                  right: 0;
                  cursor: pointer;
                "
                v-on:click="setMax"
              >
                <b-tag rounded>{{ assetbalance }}</b-tag>
              </div>
              <b-field :label="$t('payments.amount')">
                <b-input class="text-left" v-model="payment.amount"></b-input>
              </b-field>
            </div>
            <br />
            <b-field :label="$t('payments.memo')">
              <b-input
                class="text-left"
                maxlength="5000"
                type="textarea"
              ></b-input>
            </b-field>
            <b-button
              type="is-primary"
              v-if="!isSending"
              v-on:click="sendPayment()"
              expanded
              >{{ $t("payments.send") }}</b-button
            >
            <div v-if="isSending" style="text-align: center; padding: 15px 0">
              {{ $t("payments.sending") }}
            </div>
          </b-tab-item>
          <b-tab-item :label="$t('payments.receive')">
            <br />
            <div class="text-center">
              <vue-qrcode v-if="wallet && wallet.master !== undefined" class="qr" style="width:50%" :value="wallet.master" /><br>
              {{ wallet.master }} <button v-clipboard="wallet.master">copy</button>
            </div>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
    <b-loading
      :is-full-page="true"
      :active.sync="isLoading"
      :can-cancel="false"
    ></b-loading>
  </div>
</template>

<script>
let ScryptaCore = require("@scrypta/core");
import User from "../../libs/user";
import VueQrcode from 'vue-qrcode'

export default {
  components: { VueQrcode },
  name: "Payments",
  data() {
    return {
      scrypta: new ScryptaCore(true),
      address: "",
      wallet: "",
      sidechains: [],
      names: [],
      name: "", 
      selected: null,
      isLogging: true,
      isLoading: true,
      isSending: false,
      searcher: "",
      assetbalance: 0,
      selectedasset: "LYRA",
      payment: {
        to: "",
        asset: "LYRA",
        amount: "",
        memo: "",
      },
    };
  },
  computed: {
      filteredNameObj() {
        const app = this
        let ban = ["register:turinglabs"]
        let filtered = []
        app.names.map(name => {
          if(ban.indexOf(name.name) === -1 && (name.name.toLowerCase().indexOf(app.name.toLowerCase()) >= 0)){
            filtered.push(name.name.toLowerCase())
          }
        })
        return filtered
      }
  },
  async mounted() {
    const app = this;
    app.wallet = await User.auth();
    app.scrypta.staticnodes = true
    app.isLogging = false;
    let balancelyra = await app.scrypta.get("/balance/" + app.wallet.master);
    app.assetbalance = balancelyra.balance;
    let ban = ["register:turinglabs"]
    let address = await app.scrypta.createAddress('-', false)
    let request = await app.scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
    let response = await app.scrypta.sendContractRequest(request)
    let registered = []
    for (let k in response) {
      if (response[k].owner !== app.wallet.master && registered.indexOf(response[k].name) === -1) {
        registered.push(response[k])
      }
    }
    console.log(registered)
    app.names = registered
    app.fetchSidechains();
  },
  watch: {
    name () {
      const app = this
      app.names.map(name => {
        if(name.name === app.name){
          app.payment.to = name.owner
        }
      })
    },
    selectedasset: async function (change) {
      const app = this;
      if (change === "LYRA") {
        let balancelyra = await app.scrypta.get(
          "/balance/" + app.wallet.master
        );
        app.assetbalance = balancelyra.balance;
      } else {
        let balanceplanum = await app.scrypta.post("/sidechain/balance", {
          dapp_address: app.wallet.master,
          sidechain_address: change,
        });
        app.assetbalance = balanceplanum.balance;
      }
    },
  },
  methods: {
    fetchSidechains() {
      const app = this;
      app.scrypta
        .post("/sidechain/scan/address", { dapp_address: app.wallet.master })
        .then(async (response) => {
          let sidechains = [];
          for (let x in response.data) {
            let sidechain = response.data[x];
            let details = await app.scrypta.post("/sidechain/get", {
              sidechain_address: sidechain.sidechain,
            });
            let parsed = {
              name:
                details.sidechain[0].data.genesis.name +
                " (" +
                details.sidechain[0].data.genesis.symbol +
                ")",
              address: details.sidechain[0].address,
              symbol: details.sidechain[0].data.genesis.symbol,
              supply:
                details.sidechain[0].data.genesis.supply +
                " " +
                details.sidechain[0].data.genesis.symbol,
              owner: details.sidechain[0].data.genesis.owner,
              balance: sidechain.balance,
            };
            sidechains.push(parsed);
          }
          app.sidechains = sidechains;
          app.isLoading = false;
        });
    },
    setMax() {
      const app = this;
      if (app.selectedasset === "LYRA") {
        app.payment.amount = (app.assetbalance - 0.001).toFixed(8);
      } else {
        app.payment.amount = app.assetbalance;
      }
    },
    sendPayment() {
      const app = this;
      app.payment.asset = app.selectedasset;
      if (
        app.payment.amount > 0 &&
        app.payment.to !== "" &&
        app.isSending === false
      ) {
        app.$buefy.dialog.prompt({
          message: app.$t("payments.insertpassword"),
          inputAttrs: {
            type: "password",
          },
          trapFocus: false,
          onConfirm: async (password) => {
            let key;
            if (app.wallet.sid !== undefined) {
              key = await app.scrypta.readKey(password, app.wallet.sid);
              if(key !== false){
                key.sid = app.wallet.sid;
              }
            } else if (app.wallet.xsid !== undefined) {
              let xkey = await app.scrypta.readxKey(password, app.wallet.xsid);
              if(xkey !== false){
                key = await app.scrypta.deriveKeyFromSeed(xkey.seed, "m/0");
                let sid =  await app.scrypta.importPrivateKey(
                  key.prv,
                  password,
                  false
                );
                key.sid = sid.walletstore
              }
            }
            let SIDS = key.sid.split(":");
            key.address = SIDS[0];
            if (key !== false) {
              app.isSending = true;
              if (app.payment.asset !== "LYRA") {
                app.scrypta.usePlanum(app.payment.asset);
                // SENDING ASSET
                let balance = await app.scrypta.post("/sidechain/balance", {
                  dapp_address: key.address,
                  sidechain_address: app.payment.asset,
                });
                if (balance.balance >= parseFloat(app.payment.amount)) {
                  let balancelyra = await app.scrypta.get(
                    "/balance/" + key.address
                  );
                  if (balancelyra.balance >= 0.001) {
                    let sxid = false;
                    let success = false;
                    let retries = 0;
                    while (success === false) {
                      sxid = await app.scrypta.sendPlanumAsset(
                        key.sid,
                        password,
                        app.payment.to,
                        parseFloat(app.payment.amount)
                      );
                      if (sxid) {
                        success = true;
                      }
                      retries++;
                      if (retries > 10) {
                        success = true;
                      }
                    }
                    if (success && sxid !== undefined && sxid.length === 64) {
                      app.payment = {
                        to: "",
                        amount: "",
                        memo: "",
                      };
                      app.$buefy.toast.open({
                        message: this.$t("payments.sentsuccess"),
                        type: "is-success",
                      });
                      app.isSending = false;
                    } else {
                      app.isSending = false;
                      app.$buefy.toast.open({
                        message: this.$t("payments.sentfailed"),
                        type: "is-danger",
                      });
                    }
                  } else {
                    app.isSending = false;
                    app.$buefy.toast.open({
                      message: this.$t("payments.notenoughlyra"),
                      type: "is-danger",
                    });
                  }
                } else {
                  app.isSending = false;
                  app.$buefy.toast.open({
                    message: this.$t("payments.notenoughfunds"),
                    type: "is-danger",
                  });
                }
              } else {
                // SENDING LYRA
                let amountLyraFixed = parseFloat(
                  parseFloat(app.payment.amount).toFixed(8)
                );
                let amountLyraNeeded = amountLyraFixed + 0.001;
                if (amountLyraFixed > 0) {
                  let balance = await app.scrypta.get(
                    "/balance/" + key.address
                  );
                  if (balance.balance >= amountLyraNeeded) {
                    let sendsuccess = false;
                    let valid = false;
                    let yy = 0;
                    let checkto = await app.scrypta.get(
                      "/validate/" + app.payment.to
                    );
                    if (
                      checkto.data.isvalid === true ||
                      checkto.data.isvalid === "true"
                    ) {
                      while (sendsuccess === false) {
                        let txid = await app.scrypta.send(
                          key.sid,
                          password,
                          app.payment.to,
                          amountLyraFixed,
                          app.payment.memo
                        );
                        if (
                          txid !== undefined &&
                          txid !== null &&
                          txid.length === 64
                        ) {
                          sendsuccess = true;
                          valid = true;
                        }
                        if (yy > 19) {
                          valid = false;
                          sendsuccess = true;
                        }
                        yy++;
                      }
                      app.isSending = false;
                      if (valid) {
                        app.payment = {
                          to: "",
                          amount: "",
                          memo: "",
                        };
                        app.$buefy.toast.open({
                          message: app.$t("payments.sentsuccess"),
                          type: "is-success",
                        });
                      } else {
                        app.$buefy.toast.open({
                          message: app.$t("payments.sentfailed"),
                          type: "is-danger",
                        });
                      }
                    } else {
                      app.isSending = false;
                      app.$buefy.toast.open({
                        message: app.$t("payments.sentfailed"),
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
                }
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
          message: app.$t("payments.fillallfields"),
          type: "is-danger",
        });
      }
    },
  },
};
</script>
<style>
.select.is-fullwidth select{
  text-align: left!important;
}
</style>
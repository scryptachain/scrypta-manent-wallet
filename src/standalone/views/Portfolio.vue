<template>
  <div class="home container">
    <div class="columns">
      <div class="column text-left">
        <h1 class="title is-2">{{ $t("portfolio.yourassets") }}</h1>
        <div v-if="sidechains.length > 0">
          <div
            v-for="sidechain in sidechains"
            v-bind:key="sidechain.address"
            style="margin-bottom: 15px"
          >
            <a :href="standaloneURL + '/planum/' + sidechain.address">
              <div class="card">
                <div class="card-content text-left" style="padding: 10px">
                  <div class="media">
                    <div class="media-left">
                      <figure style="margin-top: 5px" class="image is-32x32">
                        <v-gravatar
                          style="border-radius: 4px"
                          :email="sidechain.address"
                        />
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-5" style="margin: 0">
                        {{ sidechain.name }}
                      </p>
                      <p class="title is-6" style="margin-bottom: 3px">
                        {{ sidechain.address }}
                      </p>
                      <div
                        style="
                          position: absolute;
                          top: 10px;
                          right: 10px;
                          padding: 0px;
                          text-align: right;
                        "
                      >
                        <b style="color: #000">{{ $t("portfolio.balance") }}</b
                        ><br />{{ sidechain.balance }} {{ sidechain.symbol }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
        <div v-if="sidechains.length === 0">
          {{ $t("portfolio.nothingtoshow") }}
        </div>
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

export default {
  name: "Portfolio",
  data() {
    return {
      scrypta: new ScryptaCore(true),
      address: "",
      wallet: "",
      sidechains: [],
      isLogging: true,
      isLoading: true,
      searcher: "",
      standaloneURL: ""
    };
  },
  computed: {
    filteredList() {
      return this.sidechains.filter((sidechains) => {
        return (
          sidechains.name.toLowerCase().includes(this.searcher.toLowerCase()) ||
          sidechains.address.toLowerCase().includes(this.searcher.toLowerCase())
        );
      });
    },
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
      app.standaloneURL = '/#/'
    }
    app.fetchSidechains();
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
  },
};
</script>
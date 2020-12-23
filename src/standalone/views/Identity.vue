<template>
  <div class="text-left">
    <h1 class="title is-2">
      {{ $t("identities.manage") }} {{ details.label }}
    </h1>
    <b-tabs :animated="false" expanded>
      <b-tab-item :label="$t('identities.management')">
        <br />
        <b-button v-on:click="setAsDefault" type="is-primary" expanded>{{
          $t("identities.actions.setdefault")
        }}</b-button
        ><br />
        <b-button v-on:click="changeLabel" type="is-primary" expanded>{{
          $t("identities.actions.changelabel")
        }}</b-button
        ><br />
        <b-button
          v-on:click="toggleChangePassword"
          type="is-primary"
          expanded
          >{{ $t("identities.actions.changepassword") }}</b-button
        ><br />
        <b-button
          v-if="identity.indexOf('xpub') === -1"
          v-on:click="toggleSyncManent"
          type="is-primary"
          expanded
          >{{ $t("identities.actions.syncmanentapp") }}</b-button
        ><br v-if="identity.indexOf('xpub') === -1" />
        <b-button v-on:click="deleteIdentity" type="is-primary" expanded>{{
          $t("identities.actions.deleteid")
        }}</b-button>
      </b-tab-item>
      <b-tab-item
        v-if="identity.indexOf('xpub') !== -1"
        :label="$t('identities.did')"
      >
        <br />
        <p>
          Those names are managed by
          <a href="https://names.scryptachain.org" target="_blank"
            >Scrypta Decentralized Names</a
          >
          dApp and will allow people find you by using this name.
          <span style="color: #f00"
            >Remember that those names are
            <span style="text-decoration: underline">public</span> and
            <span style="text-decoration: underline">immutable</span>, please
            use the service only if understand and accept that condition.</span
          >
        </p>
        <b-table :data="names" :columns="columns"></b-table>
        <div v-if="names.length === 0" style="text-align: center">
          Nothing registered yet, please register a name first.<br /><br />
        </div>
        <b-button
          v-on:click="showRegistrationModal = true"
          type="is-primary"
          expanded
          >REGISTER NEW NAME</b-button
        >
      </b-tab-item>
      <b-tab-item :label="$t('identities.backup')">
        <br />
        <b-button
          v-if="identity.indexOf('xpub') !== -1"
          type="is-primary"
          expanded
          v-on:click="showMnemonic"
          >{{ $t("identities.actions.showmnemonic") }}</b-button
        ><br v-if="identity.indexOf('xpub') !== -1" />
        <b-button
          v-if="identity.indexOf('xpub') === -1"
          type="is-primary"
          expanded
          v-on:click="showPrivateKey"
          >{{ $t("identities.actions.showprivkey") }}</b-button
        ><br v-if="identity.indexOf('xpub') === -1" />
        <!--<b-button v-on:click="toggleShamirBackup" type="is-primary" expanded>{{
          $t("identities.actions.shamirbackup")
        }}</b-button>
        <br />-->
        <b-button
          v-if="identity.indexOf('xpub') === -1"
          type="is-primary"
          expanded
          v-on:click="downloadSid"
          >{{ $t("identities.actions.backupsid") }}</b-button
        >
        <b-button
          v-if="identity.indexOf('xpub') !== -1"
          type="is-primary"
          expanded
          v-on:click="downloadxSid"
          >{{ $t("identities.actions.backupxsid") }}</b-button
        ><br />
        <a id="downloadsid" style="display: none"></a>
        <a id="downloadxsid" style="display: none"></a>
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
            <p class="modal-card-title">
              {{ $t("identities.changepassword") }}
            </p>
            <button
              type="button"
              class="delete"
              @click="toggleChangePassword"
            />
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
            <button
              v-on:click="changePassword"
              class="button is-primary"
              style="width: 100%"
            >
              {{ $t("identities.changepassword") }}
            </button>
          </footer>
        </div>
      </template>
    </b-modal>
    <b-modal
      v-model="showSyncManent"
      has-modal-card
      trap-focus
      :destroy-on-hide="true"
      aria-role="dialog"
      aria-modal
    >
      <template>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">
              {{ $t("identities.syncmanent") }}
            </p>
            <button type="button" class="delete" @click="toggleSyncManent" />
          </header>
          <section class="modal-card-body text-center" style="width: 350px">
            <p>{{ $t("identities.syncmanentinstructions") }}</p>
            <vue-qrcode style="width: 100%" :value="wallet.sid" /><br />
          </section>
        </div>
      </template>
    </b-modal>
    <b-modal
      v-model="showRegistrationModal"
      has-modal-card
      trap-focus
      :destroy-on-hide="true"
      aria-role="dialog"
      aria-modal
    >
      <template>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">Register name</p>
            <button type="button" class="delete" @click="showRegistrationModal = false" />
          </header>
          <section class="modal-card-body text-center" style="width: 450px">
            <div v-if="!canRegister">
              If the name is available the registration will cost 10 LYRA,
              please make sure you have enough balance.
              <br /><br />
              <b-input
                type="text"
                v-model="name"
                placeholder="Search a name here..."
                required
              >
              </b-input>
              <br />
              <b-button
                type="is-primary"
                expanded
                v-if="!isSearching"
                v-on:click="searchName"
                >CHECK AVAILABILITY</b-button
              >
            </div>
            <div v-if="canRegister">
              You're registering <b>{{ name }}</b> spending 10 LYRA.
              <br /><br />
              <input
                type="password"
                v-model="password"
                class="input"
                placeholder="Insert wallet password here..."
                password-reveal
              >
              <br /><br>
              <b-button
                type="is-primary"
                expanded
                v-if="!isRegistering"
                v-on:click="registerName"
                >REGISTER NAME</b-button
              >
            </div>
            <div v-if="isRegistering">Registering, please wait...</div>
            <div v-if="isSearching">Searching, please wait...</div>
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
import VueQrcode from "vue-qrcode";

export default {
  components: { VueQrcode },
  name: "Identities",
  data() {
    return {
      scrypta: new ScryptaCore(true),
      db: new ScryptaDB(true),
      address: "",
      wallet: "",
      identity: "",
      isRegistering: false,
      isSearching: false,
      canRegister: false,
      showChangePassword: false,
      showSyncManent: false,
      showRegistrationModal: false,
      details: {},
      searchResponse: {},
      sid: [],
      xsid: [],
      isLogging: true,
      isLoading: true,
      searcher: "",
      password: "",
      name: "",
      newpassword: "",
      repeatnewpassword: "",
      names: [],
      columns: [
        {
          field: "uuid",
          label: "UUID",
          width: "180",
        },
        {
          field: "name",
          label: "Registered name",
        },
      ],
    };
  },
  watch: {
    name() {
      const app = this;
      app.name = app.name.toLowerCase();
      app.name = app.name.replace(/ /g, "-");
      app.name = app.name.replace(/[^\w\s]/gi, "");
    },
  },
  async mounted() {
    const app = this;
    app.wallet = await User.auth();
    app.scrypta.staticnodes = true;
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
        let ban = ["register:turinglabs"];
        let address = await app.scrypta.createAddress("-", false);
        let request = await app.scrypta.createContractRequest(
          address.walletstore,
          "-",
          {
            contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu",
            function: "names",
            params: {},
          }
        );
        let response = await app.scrypta.sendContractRequest(request);
        let registered = [];
        let master = await app.scrypta.deriveKeyfromXPub(app.identity, "m/0");
        for (let k in response) {
          if (
            response[k].owner === master.pub &&
            registered.indexOf(response[k].name) === -1
          ) {
            registered.push(response[k]);
          }
        }
        app.names = registered;
      } else {
        app.details = await app.db.get("wallet", "address", app.identity);
      }
    },
    async searchName() {
      const app = this;
      if (!app.isSearching) {
        app.isSearching = true;
        app.name = app.name.toLowerCase();
        app.name = app.name.replace(/ /g, "-");
        app.name = app.name.replace(/[^\w\s]/gi, "");
        let address = await app.scrypta.createAddress("-", false);
        let request = await app.scrypta.createContractRequest(
          address.walletstore,
          "-",
          {
            contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu",
            function: "search",
            params: { name: app.name },
          }
        );
        let response = await app.scrypta.sendContractRequest(request);
        if (response.address === undefined) {
          app.$buefy.toast.open({
            message: "This name is available! Register it!",
            type: "is-success",
          });
          app.canRegister = true;
        } else {
          app.$buefy.toast.open({
            message: "Sorry, this name isn't available.",
            type: "is-danger",
          });
        }
        app.isSearching = false;
      }
    },
    async registerName() {
      const app = this;
      let master = await app.scrypta.readxKey(app.password, app.details.wallet);
      if (master !== false) {
        let key = await app.scrypta.deriveKeyFromSeed(master.seed, "m/0");
        let masterkey = await app.scrypta.importPrivateKey(key.prv, "-", false);
        let balance = await app.scrypta.get("/balance/" + key.pub);
        app.isRegistering = true
        if (balance.balance >= 10.002) {
          let fee = await app.scrypta.send(
            masterkey.walletstore,
            "-",
            "LSJq6a6AMigCiRHGrby4TuHeGirJw2PL5c",
            10
          );
          if (fee.length === 64) {
            setTimeout(async function () {
              let written = await app.scrypta.write(
                masterkey.walletstore,
                "-",
                "register:" + app.name,
                "",
                "",
                "names://"
              );
              if (written.txs[0].length === 64) {
                app.$buefy.toast.open({
                  message: "Name registered, well done!",
                  type: "is-success",
                });
                app.password = "";
                app.name = "";
                app.isRegistering = false;
                setTimeout(function(){
                  app.getIdentity();
                }, 1000)
              } else {
                app.isRegistering = false;
                app.$buefy.toast.open({
                  message: "Something goes wrong, please retry!",
                  type: "is-danger",
                });
              }
            }, 1500);
          } else {
            app.isRegistering = false;
            app.$buefy.toast.open({
              message: "Something goes wrong, please retry!",
              type: "is-danger",
            });
          }
        } else {
          app.isRegistering = false;
          app.$buefy.toast.open({
            message: "Not enough funds!",
            type: "is-danger",
          });
        }
      } else {
        app.isRegistering = false;
        app.$buefy.toast.open({
          message: "Wrong password!",
          type: "is-danger",
        });
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
            if (navigator.userAgent.indexOf("Firefox") === -1) {
              if (
                chrome !== undefined &&
                chrome.runtime !== undefined &&
                chrome.runtime.getURL !== undefined
              ) {
                let url = chrome.runtime.getURL("/index.html");
                window.location = url + "#/identities";
                app.$forceUpdate();
              } else {
                window.location = "/#/identities";
                app.$forceUpdate();
              }
            } else {
              window.location = "/#/identities";
              app.$forceUpdate();
            }
          } else {
            app.$buefy.toast.open({
              message: app.$t("identities.cantdelete"),
              type: "is-danger",
            });
          }
        },
      });
    },
    async changePassword() {
      const app = this;
      if (
        app.password !== "" &&
        app.newpassword !== "" &&
        app.repeatnewpassword !== "" &&
        app.newpassword === app.repeatnewpassword
      ) {
        if (app.identity.indexOf("xpub") !== -1) {
          let check = await app.scrypta.readxKey(
            app.password,
            app.details.wallet
          );
          if (check !== false) {
            let xSIDS = app.details.wallet.split(":");
            let mnemonic = await app.scrypta.decryptData(
              xSIDS[1],
              app.password
            );
            let updated = await app.scrypta.buildxSid(
              app.newpassword,
              "latin",
              false,
              mnemonic
            );
            let old = await app.db.get("xsid", "xpub", xSIDS[0]);
            old.wallet = updated.walletstore;
            await app.db.update("xsid", "xpub", xSIDS[0], old);
            app.$buefy.toast.open({
              message: app.$t("identities.passwordchanged"),
              type: "is-success",
            });
            app.getIdentity();
            app.toggleChangePassword();
            app.password = "";
            app.newpassword = "";
            app.repeatnewpassword = "";
          } else {
            app.$buefy.toast.open({
              message: app.$t("identities.wrongpassword"),
              type: "is-danger",
            });
          }
        } else {
          let check = await app.scrypta.readKey(
            app.password,
            app.details.wallet
          );
          if (check !== false) {
            let updated = await app.scrypta.importPrivateKey(
              check.prv,
              app.newpassword,
              false
            );
            let old = await app.db.get("wallet", "address", app.identity);
            old.wallet = updated.walletstore;
            await app.db.update("wallet", "address", app.identity, old);
            app.$buefy.toast.open({
              message: app.$t("identities.passwordchanged"),
              type: "is-success",
            });
            app.getIdentity();
            app.toggleChangePassword();
            app.password = "";
            app.newpassword = "";
            app.repeatnewpassword = "";
          } else {
            app.$buefy.toast.open({
              message: app.$t("identities.wrongpassword"),
              type: "is-danger",
            });
          }
        }
      } else {
        app.$buefy.toast.open({
          message: app.$t("identities.fillallfields"),
          type: "is-danger",
        });
      }
    },
    downloadSid() {
      const app = this;
      var a = document.getElementById("downloadsid");
      var file = new Blob([app.details.wallet], { type: "scryptaid" });
      a.href = URL.createObjectURL(file);
      a.download = app.details.label + ".sid";
      var clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: false,
      });
      a.dispatchEvent(clickEvent);
    },
    downloadxSid() {
      const app = this;
      var a = document.getElementById("downloadxsid");
      var file = new Blob([app.details.wallet], { type: "scryptaxid" });
      a.href = URL.createObjectURL(file);
      a.download = app.details.label + ".xsid";
      var clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: false,
      });
      a.dispatchEvent(clickEvent);
    },
    changeLabel() {
      const app = this;
      app.$buefy.dialog.prompt({
        message: app.$t("identities.selectnewlabel"),
        inputAttrs: {
          maxlength: 50,
        },
        trapFocus: true,
        onConfirm: async (value) => {
          if (value.length > 0) {
            app.details.label = value;
            if (app.identity.indexOf("xpub") !== -1) {
              await app.db.update("xsid", "xpub", app.identity, app.details);
            } else {
              await app.db.update(
                "wallet",
                "address",
                app.identity,
                app.details
              );
            }
            app.$buefy.toast.open({
              message: app.$t("identities.labelchanged"),
              type: "is-success",
            });
          } else {
            app.$buefy.toast.open({
              message: app.$t("identities.noblanklabel"),
              type: "is-danger",
            });
          }
        },
      });
    },
    showPrivateKey() {
      const app = this;
      app.$buefy.dialog.prompt({
        message: app.$t("payments.insertpassword"),
        inputAttrs: {
          type: "password",
        },
        trapFocus: false,
        onConfirm: async (password) => {
          let key = await app.scrypta.readKey(password, app.details.wallet);
          if (key !== false) {
            app.$buefy.dialog.alert(
              app.$t("identities.privkeyis") +
                '<br><span style="font-size:12px">' +
                key.prv +
                "</span>"
            );
          } else {
            app.$buefy.toast.open({
              message: app.$t("identities.wrongpassword"),
              type: "is-danger",
            });
          }
        },
      });
    },
    showMnemonic() {
      const app = this;
      app.$buefy.dialog.prompt({
        message: app.$t("payments.insertpassword"),
        inputAttrs: {
          type: "password",
        },
        trapFocus: false,
        onConfirm: async (password) => {
          try {
            let key = await app.scrypta.readxKey(password, app.details.wallet);
            if (key !== false) {
              let xSIDS = app.details.wallet.split(":");
              let decrypted = await app.scrypta.decryptData(xSIDS[1], password);
              if (decrypted.split(" ").length === 24) {
                app.$buefy.dialog.alert(
                  app.$t("identities.mnemonicis") +
                    '<br><span style="font-size:12px">' +
                    decrypted +
                    "</span>"
                );
              } else {
                app.$buefy.toast.open({
                  message: app.$t("identities.wrongpassword"),
                  type: "is-danger",
                });
              }
            } else {
              app.$buefy.toast.open({
                message: app.$t("identities.wrongpassword"),
                type: "is-danger",
              });
            }
          } catch (e) {
            app.$buefy.toast.open({
              message: app.$t("identities.wrongpassword"),
              type: "is-danger",
            });
          }
        },
      });
    },
    toggleSyncManent() {
      const app = this;
      if (app.showSyncManent === false) {
        app.showSyncManent = true;
      } else {
        app.showSyncManent = false;
      }
    },
    toggleShamirBackup() {
      const app = this;
    },
  },
};
</script>
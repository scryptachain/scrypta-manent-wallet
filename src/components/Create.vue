<template>
  <div class="login">
    <img src="../assets/logo.png" width="150px" /><br /><br />
    <div class="container">
      <div class="card">
        <div class="card-content">
          <div class="content">
            <div v-if="!created">
              <h1>{{ $t("create.hello") }}</h1>
              {{ $t("create.instructions") }}
              <br /><br />
              <b-message
                title="Error"
                v-if="error"
                type="is-danger"
                aria-close-label="Close message"
              >
                {{ errormessage }}
              </b-message>
              <b-field :label="$t('create.label')">
                <b-input v-model="label"></b-input>
              </b-field>
              <b-field :label="$t('create.password.insert')">
                <b-input
                  type="password"
                  v-model="password"
                  password-reveal
                ></b-input>
              </b-field>
              <b-field :label="$t('create.password.repeat')">
                <b-input
                  type="password"
                  v-model="passwordrepeat"
                  password-reveal
                ></b-input>
              </b-field>
              <password-meter :password="password" />
              <br v-if="password" />
              <div v-if="recover">
                <b-field
                  :label="$t('create.insertmnemonic')"
                  style="position: relative; width: 100%"
                >
                  <a href="#" v-on:click="hideRecover">
                    <b-icon
                      icon="close"
                      size="is-small"
                      style="
                        position: absolute;
                        top: 45px;
                        z-index: 25;
                        right: 10px;
                      "
                    ></b-icon>
                  </a>
                  <b-input
                    v-model="mnemonic"
                    style="width: 100%"
                    type="textarea"
                  ></b-input>
                </b-field>
                <br />
              </div>
              <b-button
                type="is-primary"
                v-if="!recover"
                v-on:click="createNewSid"
                expanded
                >{{ $t("create.create") }}</b-button
              >
              <b-button
                type="is-primary"
                v-if="recover"
                v-on:click="createNewSid"
                expanded
                >{{ $t("create.recovernow") }}</b-button
              ><br />
              <a href="#" v-on:click="showRecover">{{
                $t("create.recover")
              }}</a>
              <div
                style="
                  position: relative;
                  width: 100%;
                  height: 8px;
                  margin: 12px 0;
                "
              >
                <hr style="margin: 0" />
                <div
                  style="position:absolute;top:5px:height:10px;width:40px;left:50%;top:-5px;margin-left:-20px;text-align:center;font-size:10px;background:#fff"
                >
                  or
                </div>
              </div>
              <a href="#" v-on:click="showLogins">{{
                $t("create.loginwith")
              }}</a>
            </div>
            <div v-if="created">
              {{ $t("create.savemnemonic") }}
              <hr />
              <span style="font-weight: bold; font-size: 22px">{{
                newSeed.mnemonic
              }}</span>
              <hr />
              <b-button type="is-primary" v-on:click="backupDone" expanded>{{
                $t("create.done")
              }}</b-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.po-password-strength-bar {
  height: 10px;
}
.select select,
.taginput .taginput-container.is-focusable,
.textarea,
.input {
  text-align: center !important;
  font-family: "Sen", sans-serif !important;
  border: none !important;
  border-bottom: 2px solid #ccc !important;
  border-radius: 0px !important;
  box-shadow: none !important;
}
.select select:focus,
.taginput .taginput-container.is-focusable:focus,
.textarea:focus,
.input:focus,
.select select.is-focused,
.taginput .is-focused.taginput-container.is-focusable,
.is-focused.textarea,
.is-focused.input,
.select select:active,
.taginput .taginput-container.is-focusable:active,
.textarea:active,
.input:active,
.select select.is-active,
.taginput .is-active.taginput-container.is-focusable,
.is-active.textarea,
.is-active.input {
  border-bottom: 2px solid #d8213b !important;
}
</style>
<script>
const ScryptaCore = require("@scrypta/core");
const User = require("../libs/user");
import passwordMeter from "vue-simple-password-meter";

export default {
  components: { passwordMeter },
  name: "Login",
  data() {
    return {
      standaloneURL: "",
      scrypta: new ScryptaCore(true),
      user: User,
      error: false,
      recover: false,
      logins: false,
      created: false,
      loginselected: "",
      newSeed: "",
      dropFile: "",
      wallet: "",
      privkey: "",
      password: "",
      errormessage: "",
      passwordrepeat: "",
      mnemonic: "",
      label: "New Identity",
    };
  },
  async mounted() {
    const app = this;
    app.wallet = await app.user.auth();
  },
  methods: {
    async createNewSid() {
      const app = this;
      if (
        app.password === app.passwordrepeat &&
        app.password !== "" &&
        app.password.length > 0
      ) {
        app.newSeed = await app.scrypta.buildxSid(
          app.password,
          "latin",
          true,
          app.mnemonic,
          app.label
        );
        if (app.recover && app.mnemonic !== "") {
          app.$emit("logged", app.newSeed.walletstore);
        }
        app.created = true;
      } else {
        if (app.password !== app.passwordrepeat) {
          app.errormessage = app.$t("create.password.wrong");
        } else if (app.password === "") {
          app.errormessage = app.$t("create.password.empty");
        }
        app.error = true;
      }
    },
    async importSid(method) {
      const app = this;
      console.log(method);
    },
    onDecodedCard(decodedString) {
      const app = this;
      console.log(decodedString);
    },
    selectMethod(what) {
      const app = this;
      app.loginselected = what;
    },
    backupDone() {
      const app = this;
      app.$emit("logged", app.newSeed.walletstore);
    },
    showRecover() {
      this.recover = true;
    },
    showLogins() {
      this.logins = true;
      let url = chrome.runtime.getURL("/index.html");
      if (window.location.href.indexOf("popup.html") !== -1) {
        window.open(url + "#/login", "_blank");
      } else {
        window.open(url + "#/login", "_self");
      }
    },
    hideLogins() {
      this.logins = false;
    },
    hideLogin() {
      this.loginselected = null;
    },
    hideRecover() {
      this.recover = false;
    },
  },
};
</script>
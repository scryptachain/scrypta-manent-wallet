<template>
  <div class="login">
    <img src="../assets/logo.png" width="150px" /><br /><br />
    <div class="container">
      <div class="card">
        <div class="card-content">
          <div class="content">
            <div v-if="!loginselected">
              <h1>{{ $t("create.loginwith") }}</h1>
              <p>{{ $t("create.logininstructions") }}</p>
              <br />
              <b-button
                type="is-primary"
                v-on:click="selectMethod('manentapp')"
                expanded
                style="margin-bottom: 10px"
                >{{ $t("create.manentapp") }}</b-button
              >
              <b-button
                type="is-primary"
                v-on:click="selectMethod('cardwallet')"
                expanded
                style="margin-bottom: 10px"
                >{{ $t("create.cardwallet") }}</b-button
              >
              <b-button
                type="is-primary"
                v-on:click="selectMethod('privkey')"
                expanded
                style="margin-bottom: 10px"
                >{{ $t("create.privkey") }}</b-button
              >
              <b-button
                type="is-primary"
                v-on:click="selectMethod('sidfile')"
                expanded
                >{{ $t("create.sidfile") }}</b-button
              >
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
              <a href="#" v-on:click="hideLogins">{{
                $t("create.createnew")
              }}</a>
            </div>
            <div v-if="loginselected">
              <div v-if="loginselected === 'manentapp'">
                <vue-qrcode value="login:Lasdoijoijoijoijoijoij" />
              </div>
              <div v-if="loginselected === 'sidfile'">
                <b-field :label="$t('create.label')">
                  <b-input v-model="label"></b-input>
                </b-field>
                <b-upload v-model="dropFile" drag-drop>
                  <section class="section">
                    <div class="content has-text-centered">
                      <p>
                        <b-icon icon="upload" size="is-large"> </b-icon>
                      </p>
                      <p>Drop your .sid file here or click to upload</p>
                    </div>
                  </section>
                </b-upload>
                <br /><br />
                <b-button
                  type="is-primary"
                  v-if="!recover"
                  v-on:click="importSid('sidfile')"
                  expanded
                  >{{ $t("create.import") }}</b-button
                >
              </div>
              <div v-if="loginselected === 'cardwallet'">
                <qrcode-stream @decode="onDecodedCard"></qrcode-stream>
              </div>
              <div v-if="loginselected === 'privkey'">
                <b-field :label="$t('create.label')">
                  <b-input v-model="label"></b-input>
                </b-field>
                <b-field :label="$t('create.privkey')">
                  <b-input v-model="privkey"></b-input>
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
                <b-button
                  type="is-primary"
                  v-if="!recover"
                  v-on:click="importSid('privkey')"
                  expanded
                  >{{ $t("create.import") }}</b-button
                >
              </div>
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
              <a href="#" v-on:click="hideLogin">{{
                $t("create.backtoselection")
              }}</a>
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
import VueQrcode from "vue-qrcode";

export default {
  components: { passwordMeter, VueQrcode },
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
    hideLogins() {
      this.logins = false;
      let url = chrome.runtime.getURL("/index.html");
      window.location.href = url;
    },
    hideLogin() {
      this.loginselected = null;
    },
  },
};
</script>
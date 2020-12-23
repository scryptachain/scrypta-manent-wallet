<template>
  <div class="login">
    <div v-if="!loginselected">
      <h1 v-if="!embed">{{ $t("create.loginwith") }}</h1>
      <p v-if="!embed">{{ $t("create.logininstructions") }}</p>
      <br v-if="!embed" />
      <b-button
        type="is-primary"
        v-if="embed"
        v-on:click="selectMethod('createnew')"
        expanded
        style="margin-bottom: 10px"
        >{{ $t("create.createnew") }}</b-button
      >
      <b-button
        type="is-primary"
        v-if="embed"
        v-on:click="selectMethod('importseed')"
        expanded
        style="margin-bottom: 10px"
        >{{ $t("create.importseed") }}</b-button
      >
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
        v-if="!embed"
        style="position: relative; width: 100%; height: 8px; margin: 12px 0"
      >
        <hr style="margin: 0" />
        <div
          style="position:absolute;top:5px:height:10px;width:40px;left:50%;top:-5px;margin-left:-20px;text-align:center;font-size:10px;background:#fff"
        >
          or
        </div>
      </div>
      <a href="#" v-if="!embed" v-on:click="hideLogins">{{
        $t("create.createnew")
      }}</a>
    </div>
    <div v-if="loginselected">
      <div v-if="loginselected === 'createnew'">
        <b-tabs
          style="margin: 0 !important; padding: 0 !important"
          :animated="false"
          expanded
        >
          <b-tab-item :label="$t('create.legacy')">
            <br />
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
            <b-button type="is-primary" v-on:click="createNewSid" expanded>{{
              $t("create.create")
            }}</b-button>
          </b-tab-item>
          <b-tab-item :label="$t('create.advanced')">
            <br />
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
            <b-button type="is-primary" v-on:click="createNewxSid" expanded>{{
              $t("create.create")
            }}</b-button>
          </b-tab-item>
        </b-tabs>
      </div>
      <div v-if="loginselected === 'importseed'">
        <br />
        <b-field :label="$t('create.label')">
          <b-input v-model="label"></b-input>
        </b-field>
        <b-field
          :label="$t('create.insertmnemonic')"
          style="position: relative; width: 100%"
        >
          <b-input
            v-model="mnemonic"
            style="width: 100%"
            type="textarea"
          ></b-input>
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
        <b-button type="is-primary" v-on:click="createNewxSid" expanded>{{
          $t("create.create")
        }}</b-button>
      </div>
      <div v-if="loginselected === 'manentapp'">
        <img
          :src="remoterequest.qrcode"
          width="100%"
          style="max-width: 400px"
        />
        <br /><br />
        {{ $t("create.remotesigninstructions") }}
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
        <div v-if="filename">
          <br /><br /><b-tag type="is-primary" size="is-medium">{{
            filename
          }}</b-tag>
        </div>
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
        <div id="loadingMessage">
          🎥 Unable to access video stream<br />(please make sure you have a
          webcam enabled)
        </div>
        <canvas id="canvas" style="width: 100%" hidden></canvas>
      </div>
      <div v-if="loginselected === 'privkey'">
        <b-field :label="$t('create.label')">
          <b-input v-model="label"></b-input>
        </b-field>
        <b-field :label="$t('create.privkey')">
          <b-input type="password" v-model="privkey" password-reveal></b-input>
        </b-field>
        <b-field :label="$t('create.password.insert')">
          <b-input type="password" v-model="password" password-reveal></b-input>
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
      <div style="position: relative; width: 100%; height: 8px; margin: 12px 0">
        <hr style="margin: 0" />
        <div
          style="position:absolute;top:5px:height:10px;width:40px;left:50%;top:-5px;margin-left:-20px;text-align:center;font-size:10px;background:#fff"
        >
          or
        </div>
      </div>
      <a href="#" v-on:click="hideLogin">{{ $t("create.backtoselection") }}</a>
    </div>
  </div>
</template>

<style>
ul {
  padding: 0 !important;
  margin: 0 !important;
}
.login {
  text-align: center !important;
}
.b-tabs .tab-content {
  padding: 0 !important;
}
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
const ScryptaLogin = require("@scrypta/login");
import jsQR from "jsqr";

var video;
var canvasElement;
var canvas;
var loadingMessage;

function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

export default {
  props: ["embed"],
  components: { passwordMeter },
  name: "Login",
  data() {
    return {
      standaloneURL: "",
      scrypta: new ScryptaCore(true),
      scryptalogin: new ScryptaLogin(true),
      user: User,
      error: false,
      recover: false,
      logins: false,
      created: false,
      video: "",
      canvas: "",
      canvasElement: "",
      loginselected: "",
      remoterequest: "",
      newSeed: "",
      dropFile: {},
      wallet: "",
      privkey: "",
      password: "",
      errormessage: "",
      passwordrepeat: "",
      mnemonic: "",
      filename: "",
      label: "New Identity",
    };
  },
  async mounted() {
    const app = this;
    app.wallet = await app.user.auth();
  },
  watch: {
    dropFile(value) {
      const app = this;
      app.filename = value.name;
    },
  },
  methods: {
    async createNewSid() {
      const app = this;
      if (
        app.password === app.passwordrepeat &&
        app.password !== "" &&
        app.password.length > 0
      ) {
        app.newSeed = await app.scrypta.createAddress(
          app.password,
          true,
          app.label
        );
        app.$emit("logged", app.newSeed.walletstore);
        app.created = true;
      } else {
        if (app.password !== app.passwordrepeat) {
          app.$buefy.toast.open({
            message: app.$t("create.password.wrong"),
            type: "is-danger",
          });
        } else if (app.password === "") {
          app.$buefy.toast.open({
            message: app.$t("create.password.empty"),
            type: "is-danger",
          });
        }
      }
    },
    async createNewxSid() {
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
        console.log(app.newSeed, app.password)
        app.$emit("logged", app.newSeed.walletstore);
        app.created = true;
      } else {
        if (app.password !== app.passwordrepeat) {
          app.$buefy.toast.open({
            message: app.$t("create.password.wrong"),
            type: "is-danger",
          });
        } else if (app.password === "") {
          app.$buefy.toast.open({
            message: app.$t("create.password.empty"),
            type: "is-danger",
          });
        }
      }
    },
    async importSid(method, sid) {
      const app = this;
      if (method !== "privkey") {
        if (method === "sidfile") {
          sid = await app.loadWalletFromFile();
        }
      } else {
        if (
          app.privkey !== "" &&
          app.password !== "" &&
          app.passwordrepeat !== ""
        ) {
          if (app.password === app.passwordrepeat) {
            let wallet = await app.scrypta.importPrivateKey(
              app.privkey,
              app.password,
              false
            );
            sid = wallet.walletstore;
          } else {
            app.$buefy.toast.open({
              message: app.$t("create.password.wrong"),
              type: "is-danger",
            });
          }
        } else {
          app.$buefy.toast.open({
            message: app.$t("create.fillallfields"),
            type: "is-danger",
          });
        }
      }
      await app.scrypta.saveWallet(sid, app.label);
      app.$emit("logged", sid);
    },
    async selectMethod(what) {
      const app = this;
      if (what === "manentapp") {
        app.remoterequest = await app.scryptalogin.listen(function (connected) {
          app.importSid("remote", connected);
        });
      }
      app.loginselected = what;
      if (what === "cardwallet") {
        setTimeout(function () {
          video = document.createElement("video");
          canvasElement = document.getElementById("canvas");
          canvas = canvasElement.getContext("2d");
          loadingMessage = document.getElementById("loadingMessage");
          navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "environment" } })
            .then(function (stream) {
              video.srcObject = stream;
              video.setAttribute("playsinline", true);
              video.play();
              requestAnimationFrame(app.tick);
            });
        }, 200);
      }
    },
    hideLogins() {
      this.logins = false;
      if (navigator.userAgent.indexOf("Firefox") === -1) {
        if(chrome !== undefined && chrome.runtime !== undefined && chrome.runtime.getURL !== undefined){
          let url = chrome.runtime.getURL("/index.html");
          window.location.href = url;
        }else{
          window.location.href = '/#/'
        }
      }else{
        window.location.href = 'index.html#/'
      }
    },
    loadWalletFromFile() {
      const app = this;
      return new Promise((response) => {
        const reader = new FileReader();
        reader.onload = function () {
          app.label = app.dropFile.name.replace('.sid', '').replace('.xsid', '')
          var dataKey = reader.result;
          response(dataKey);
        };
        reader.readAsText(app.dropFile);
      });
    },
    tick() {
      const app = this;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        loadingMessage.hidden = true;
        canvasElement.hidden = false;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(
          video,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        var imageData = canvas.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
          drawLine(
            code.location.topLeftCorner,
            code.location.topRightCorner,
            "#FF3B58"
          );
          drawLine(
            code.location.topRightCorner,
            code.location.bottomRightCorner,
            "#FF3B58"
          );
          drawLine(
            code.location.bottomRightCorner,
            code.location.bottomLeftCorner,
            "#FF3B58"
          );
          drawLine(
            code.location.bottomLeftCorner,
            code.location.topLeftCorner,
            "#FF3B58"
          );
          app.importSid("cardwallet", code.data);
        }
      }
      requestAnimationFrame(app.tick);
    },
    hideLogin() {
      this.loginselected = null;
    },
  },
};
</script>
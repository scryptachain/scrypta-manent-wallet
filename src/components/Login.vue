<template>
  <div class="login">
    <img src="../assets/logo.png" width="50%" /><br /><br />
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
        {{ $t("create.password.wrong") }}
      </b-message>
      <b-field :label="$t('create.label')">
        <b-input v-model="label"></b-input>
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
      <br />
      <div v-if="recover">
        <b-field
          :label="$t('create.insertmnemonic')"
          style="position: relative; width: 100%"
        >
          <b-icon
            icon="close"
            size="is-small"
            style="position: absolute; top: 45px; z-index: 25; right: 10px"
          ></b-icon>
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
      <a href="#" v-on:click="showRecover">{{ $t("create.recover") }}</a>
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
</template>

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
      created: false,
      newSeed: "",
      wallet: "",
      password: "",
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
      if (app.password === app.passwordrepeat) {
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
        app.error = true;
      }
    },
    backupDone() {
      const app = this;
      app.$emit("logged", app.newSeed.walletstore);
    },
    showRecover() {
      this.recover = true;
    },
    hideRecover() {
      this.recover = false;
    },
  },
};
</script>
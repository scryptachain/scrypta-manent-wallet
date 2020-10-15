<template>
  <div class="page">
    <LyraDash v-if="configs.chain !== undefined && configs.chain === 'LYRA'" />
    <AssetDash v-if="configs.chain !== undefined && configs.chain !== 'LYRA'" />
  </div>
</template>

<script>
  let ScryptaCore = require("@scrypta/core")
  import User from '../../libs/user'
  import LyraDash from '../../components/LyraDash'
  import AssetDash from '../../components/AssetDash'

  export default {
    name: 'Dashboard',
    components: { LyraDash, AssetDash },
    data() {
      return {
        scrypta: new ScryptaCore(true),
        configs: {},
        wallet: "",
        isLogging: true,
        isLoading: true
      };
    },
    async mounted() {
      const app = this
      app.scrypta.staticnodes = true
      app.wallet = await User.auth()
      if(app.wallet !== false){
        app.configs = await User.configs()
        app.ticker = 'LYRA'
      }
    },
  };
</script>
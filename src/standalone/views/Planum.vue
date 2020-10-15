<template>
  <div class="page">
    <AssetDash :chain="$route.params.chain" />
  </div>
</template>

<script>
  let ScryptaCore = require("@scrypta/core")
  import User from '../../libs/user'
  import AssetDash from '../../components/AssetDash'

  export default {
    name: 'Dashboard',
    components: { AssetDash },
    data() {
      return {
        scrypta: new ScryptaCore(true),
        isLogging: true,
        isLoading: true
      };
    },
    async mounted() {
      const app = this;
      app.scrypta.staticnodes = true
      app.wallet = await User.auth()
      if(app.wallet !== false){
        app.configs = await User.configs()
        app.ticker = 'LYRA'
      }
    },
  };
</script>
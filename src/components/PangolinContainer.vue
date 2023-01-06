<template>
  <div id="cc" class="q-pt-md q-pb-md q-mb-none flex justify-center bg-secondary rounded-borders q-mx-auto shadow-5">
    <q-banner rounded class="bg-accent text-white q-px-none q-mx-auto" id="banner">
      <h5 class="text-black q-pa-none q-mt-none q-mb-xs text-center">Swap</h5>
      <div class="text-negative text-left q-px-sm">
        <p>
          bCASH is a community utility token and should not be considered an investment.
        </p>
        <p>
          Because 10% of all token transfers is diverted to one of many staking contracts, slippage may need to be 12% or higher when buying.
        </p>
        <p class="bg-warning text-center">
          Learn more in our <span @click="gotoURL('https://docs.butterflycash.io')" class="cursor-pointer text-accent">docs.</span>
        </p>
        <p class="text-black text-center">
          bCASH Address:<br/>
          <span @click="gotoURL('')" class="cursor-pointer text-caption">0x4BA16DaF8ed418deD920C66e45cc3eaFFDE53Ac7</span>
        </p>
      </div>
      <div id="gameBanner" class="q-mx-auto">
        <pangolin-provider :chainId=43114 :account="account">
          <div class="full-width q-mx-auto">
            <swap-widget :showSettings=true class="text-left"></swap-widget>
          </div>
        </pangolin-provider>
      </div>
    </q-banner>
  </div>
</template>

<script>
import {applyReactInVue} from 'veaury';
import { PangolinProvider } from '@pangolindex/components'
import { SwapWidget } from '@pangolindex/components'
import {web3Modal} from "@/config/mixins";

export default {
  name: "PangolinContainer",
  components: {'pangolin-provider': applyReactInVue(PangolinProvider),
                'swap-widget': applyReactInVue(SwapWidget)},
  mixins: [web3Modal],
  data: function() {
    return {
    }
  },

  props: {
  },

  computed: {
    account() {
      const {active,account} = this.web3Modal;
      if (active) {
        return account;
      }
      return "";
    },
  },

  methods: {
    gotoURL: function(url) {
      window.open(url);
    },
  },

  watch: {
  },

  mounted: function () {
  },
}
</script>

<style scoped>
  #cc {
    width: 95%;
    max-width: 600px;
    min-width: 360px;
  }
  #banner {
    width: 90%;
    margin: auto;
  }
  #gameBanner {
    font-weight: bolder;
  }
</style>
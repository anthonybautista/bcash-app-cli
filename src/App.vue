<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg- text-white">
      <q-toolbar>
        <q-toolbar-title>
          <img src="@/assets/logo.png" class="logo"/>
        </q-toolbar-title>
        <q-btn v-if="alias" class="bg-negative text-lowercase text-caption q-px-xs">{{this.alias}}</q-btn>
        <q-btn v-else @click="connect" class="bg-warning">
          Connect Wallet
        </q-btn>
      </q-toolbar>
    </q-header>
    <div class="buffer q-mt-lg"></div>
    <div class="q-pa-md q-mx-auto text-center" id="navButton">
      <q-btn-dropdown color="secondary" label="Menu" class="q-mt-lg text-black text-bold">
        <q-list class="bg-secondary">
          <router-link to="/">
            <q-item clickable v-close-popup>
              <q-item-section>
                <q-item-label>
                  Swap
                </q-item-label>
              </q-item-section>
            </q-item>
          </router-link>

          <router-link to="/ve">
            <q-item clickable v-close-popup>
              <q-item-section>
                <q-item-label>
                  veStaking
                </q-item-label>
              </q-item-section>
            </q-item>
          </router-link>

          <router-link to="/farm">
            <q-item clickable v-close-popup @click="onItemClick">
              <q-item-section>
                <q-item-label>
                  LP Farm
                </q-item-label>
              </q-item-section>
            </q-item>
          </router-link>

          <router-link to="/auto">
            <q-item clickable v-close-popup @click="onItemClick">
              <q-item-section>
                <q-item-label>
                  Auto LP
                </q-item-label>
              </q-item-section>
            </q-item>
          </router-link>

          <router-link to="/stake">
            <q-item clickable v-close-popup @click="onItemClick">
              <q-item-section>
                <q-item-label>
                  sbCash
                </q-item-label>
              </q-item-section>
            </q-item>
          </router-link>

          <router-link to="/dstr">
            <q-item clickable v-close-popup @click="onItemClick">
              <q-item-section>
                <q-item-label>
                  DSTR
                </q-item-label>
              </q-item-section>
            </q-item>
          </router-link>
        </q-list>
      </q-btn-dropdown>
    </div>

    <router-view/>

    <div class="buffer-lg"></div>

    <q-footer class="bg-none text-white q-pt-sm">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab :icon="fabDiscord" color="secondary" text-color="primary" @click="gotoURL('https://discord.butterflycash.io')"/>
      </q-page-sticky>
      <q-page-sticky position="bottom-left" :offset="[18, 18]">
        <q-btn fab :icon="fabTwitter" color="secondary" text-color="primary" @click="gotoURL('https://twitter.com/bCASH_AVAX')"/>
      </q-page-sticky>
      <div id="disclaimer" class="bg-secondary text-black text-center q-mx-auto text-caption rounded-borders">
        <p class="q-mb-none">NOT LEGAL ADVICE - NOT INVESTMENT ADVICE</p>
        <p class="q-mb-none">NOT PARENTING ADVICE - DISCLAIMER</p>
        <p>Users bear their own responsibility to act in accordance with local laws regarding all aspects of digital asset ownership.</p>
      </div>
    </q-footer>
    <web3-modal-vue
        ref="web3modal"
        :theme="theme"
        :provider-options="providerOptions"
        cache-provider
    />
  </q-layout>
</template>

<script>
//import { ref } from 'vue'
import { fabTwitter, fabDiscord } from '@quasar/extras/fontawesome-v6'
import Web3ModalVue from "web3modal-vue";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {web3Modal} from "./config/mixins";
import {getFireContract} from "@/utils/contract";
/*import { ethers } from "ethers";
import axios from "axios";*/

export default {
  name: 'LayoutDefault',

  setup () {
    return {
      fabTwitter,
      fabDiscord,
    }
  },

  components: {
    Web3ModalVue,
  },

  mixins: [web3Modal],

  data(){
    return {
      theme: 'light',
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: {
              //43113: "https://api.avax-test.network/ext/bc/C/rpc",
              43114: "https://api.avax.network/ext/bc/C/rpc",
            }
          }
        }
      },
      alias: null,
      refreshController: false,
    }
  },

  methods: {
    gotoURL: function(url) {
      window.open(url);
    },
    connect() {
      this.$store.dispatch('connect');
    },
    getAlias: async function(account) {
      const contract = getFireContract();
      let fire = await contract.usernameFor(account);

      if (fire !== "") {
        return fire;
      } else {
        return "..."+ account.substring(34);
      }
    },
    reloadContainer: function() {
      this.refreshController = !this.refreshController;
    }
  },


  // computed: values that are updated and cached if dependencies change
  computed: {
    account: function() {
        const {active, account} = this.web3Modal
        if (active) {
          return account;
        }
        return null;
    }
  },

  //mounted:  called after the instance has been mounted,
  mounted: function () {
    this.$nextTick(async () => {
      const web3modal = this.$refs.web3modal;
      this.$store.commit('setWeb3Modal', web3modal)
      if (web3modal.cachedProvider) {
        await this.$store.dispatch('connect')
        //this.subscribeMewBlockHeaders()
      }

    })
  },

  // watch:   calls the function if the value changes
  // https://travishorn.com/add-localstorage-to-your-vue-app-in-2-lines-of-code-56eb2c9f371b
  watch: {
    account: {
      handler: async function(newAccount) {
        if (newAccount) {
          this.alias = await this.getAlias(newAccount);
        }
      },
    },
  },

}
</script>

<style>
body {
  background-color: #5087C6;
}

.logo {
  height: 40px;
}

.buffer {
  height: 5px;
}

.buffer-lg {
  height: 200px;
}

#navButton {
  width: 95%;
}

#disclaimer {
  width: 95%;
}

</style>
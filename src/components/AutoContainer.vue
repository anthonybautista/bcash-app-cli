<template>
  <div id="cc" class="q-pt-md q-pb-md q-mb-none flex justify-center bg-secondary rounded-borders q-mx-auto shadow-5">
    <q-banner rounded class="bg-accent text-white q-px-none q-mx-auto" id="banner">
      <h5 class="text-black q-pa-none q-mt-none q-mb-xs text-center">Auto LP</h5>
      <div id="gameBanner" class="text-center q-mx-auto">
        <div id="bCashDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">Est. bCASH Locked</p>
          <p class="q-mb-none">{{bCashStaked}}</p>
        </div>
        <div id="lpDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">PGL Locked</p>
          <p class="q-mb-none">{{pglStaked}}</p>
        </div>
        <div id="veCashDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">Est. AVAX Locked</p>
          <p class="q-mb-none">{{avaxStaked}}</p>
        </div>
      </div>
      <div class="text-center q-mt-md">
        <p class="text-black">
          This contract allows you to deposit 1-25 AVAX and receive an equivalent amount of $bCASH for free in exchange for
          taking on the risk of providing liquidity for 4 weeks. After 4 weeks you will receive PGL liquidity tokens. You can only
          have one lock per wallet at a time.
        </p>
        <p class="text-negative">Providing liquidity comes with significant risks.</p>
        <p @click="gotoURL('https://academy.binance.com/en/articles/what-are-liquidity-pools-in-defi')" class="text-warning cursor-pointer">Learn More Here</p>
        <p class="text-negative">{{this.errorMessage}}</p>
        <q-input class="q-ma-sm bg-secondary q-pa-none rounded-borders"
                 type="number"
                 filled
                 id="avaxAmount"
                 label="Enter Amount AVAX"
                 lazy-rules
                 v-model="avaxAmount"
                 :rules="[ val => val >= 1 || 'Invalid Amount']"
        ></q-input>
        <q-btn label="Lock" color="primary" @click="deposit" class="q-ma-sm"> </q-btn>
      </div>
      <q-separator/>
      <div class="q-mt-sm text-black text-center text-bold">
        <p class="text-black q-mb-none">Time Until Unlock</p>
        <better-timer :timestamp="timestamp"></better-timer>
        <q-btn label="Claim" color="primary" @click="claim" class="q-ma-sm"> </q-btn>
      </div>
    </q-banner>
  </div>
</template>

<script>
import {getAutoContract, getAutoContractNoSigner} from "@/utils/contract";
import Number from '@/utils/formatBalance';
import {web3Modal} from "@/config/mixins";
import {ethers} from "ethers";
import BetterTimer from "@/components/BetterTimer";
export default {
  name: "AutoContainer",
  components: {BetterTimer},
  mixins: [web3Modal],
  data: function() {
    return {
      errorMessage: "",
      pglStaked: 0,
      avaxAmount: 0,
      bCashStaked: 0,
      avaxStaked: 0,
      timestamp: 0,
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
    }
  },

  methods: {
    gotoURL: function(url) {
      window.open(url);
    },
    getBalances: async function () {
      const {active ,account} = this.web3Modal;
      if (active) {
        const contract = getAutoContractNoSigner();

        await contract.amountLockedFor(account).then(x => {
          this.pglStaked = (Number(x) / 10**18).toFixedNoRound(3);
        })

        if (this.pglStaked > 0) {
          await contract.timeUntilUnlockedFor(account).then(x => {
            this.timestamp = (Number(x) * 1000) + Date.now();
          })
          await contract.totalView().then((x) => {
            let totalAvax = (Number(x[0]) / 10**18).toFixedNoRound(3);
            let totalBcash = (Number(x[1]) / 10**18).toFixedNoRound(3);
            let totalPgl = (Number(x[2]) / 10**18).toFixedNoRound(3);
            let accountPercent = this.pglStaked / totalPgl;
            this.avaxStaked = (totalAvax * accountPercent).toFixedNoRound(3);
            this.bCashStaked = (totalBcash * accountPercent).toFixedNoRound(3);
          })
        }
      }
    },
    deposit: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getAutoContract();
          const tx = await contract["deposit"]({value: ethers.utils.parseEther(this.avaxAmount.toString())});
          this.errorMessage = 'Locking...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully Locked!'
            await this.getBalances();
          } else {
            this.errorMessage = 'Locking Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
    claim: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getAutoContract();
          const tx = await contract["claim"]();
          this.errorMessage = 'Claiming...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully claimed!'
            await this.getBalances();
          } else {
            this.errorMessage = 'Claiming Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
  },

  watch: {
    account: {
      handler: async function(newState) {
        if (newState !== "") {
          await this.getBalances();
        }
      },
    },
  },

  mounted: async function () {
    const {active,} = this.web3Modal;
    if (active) {
      await this.getBalances();
    }
  },
}
</script>

<style scoped>
  #cc {
    width: 95%;
    max-width: 600px;
  }
  #banner {
    width: 90%;
    margin: auto;
  }
  #nft-exp {
    width: 90%;
    margin: auto;
  }
  #gameBanner {
    display: grid;
    grid-template-columns: 33% 33% 33%;
    grid-template-rows: auto;
    font-weight: bolder;
  }
  #bCashDiv {
    grid-column: 1/2;
  }
  #lpDiv {
    grid-column: 2/3;
  }
  #veCashDiv {
    grid-column: 3/4;
  }
  #exp {
    border-color: white;
  }
  #tierProgress {
    grid-column: 1/4;
  }
</style>
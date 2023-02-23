<template>
  <div id="cc" class="q-pt-md q-pb-md q-mb-none flex justify-center bg-secondary rounded-borders q-mx-auto shadow-5">
    <q-banner rounded class="bg-accent text-white q-px-none q-mx-auto" id="banner">
      <h5 class="text-black q-pa-none q-mt-none q-mb-xs text-center">sbCASH Staking</h5>
      <div id="gameBanner" class="text-center q-mx-auto">
        <div id="bCashDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">Your bCASH</p>
          <p class="q-mb-none">{{myBcash}}</p>
        </div>
        <div id="lpDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">Your sbCASH</p>
          <p class="q-mb-none">{{mySbCash}}</p>
        </div>
        <div id="veCashDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">Your Pool %</p>
          <p class="q-mb-none">{{myPercentage}}</p>
        </div>
      </div>
      <div class="text-center text-black q-mx-auto q-mt-sm">
        <p class="text-black q-px-xs">
          Stake a minimum of 10k $bCASH for 1 week and earn a share of the staking pool.<br/>
          You can add to your stake at any time and/or compound earnings after 1 week. Both of these actions reset your 1 week timer.
        </p>
        <p class="text-negative">There is a 10% tax on withdrawals. This will be reflected in your amount claimable.</p>
      </div>
      <div class="text-center q-mt-md">
        <p class="text-black">
          You must approve bCASH before staking.
        </p>
        <p class="text-negative">{{this.errorMessage}}</p>
        <q-input class="q-ma-sm bg-secondary q-pa-none rounded-borders"
                 type="number"
                 filled
                 id="bCashAmount"
                 label="Enter Amount bCASH"
                 lazy-rules
                 v-model="bCashAmount"
                 :rules="[ val => val > 0 || 'Invalid Amount']"
        ></q-input>
        <p class="text-black q-mb-none">You Approved: {{myApproval}} bCASH</p>
        <q-btn v-if="this.myApproval <= this.myBcash" label="Approve" color="primary" @click="approveBcash" class="q-ma-sm"> </q-btn>
        <q-btn label="Stake" color="primary" @click="stake" class="q-ma-sm"> </q-btn>
      </div>
      <q-separator/>
      <div class="q-mt-sm text-black text-center text-bold">
        <p class="text-black q-mb-none">Time Until Unlock</p>
        <better-timer :timestamp="timestamp"></better-timer>
        <p class="q-mb-none q-pb-none">bCash Claimable:</p>
        <p class="q-mb-none">{{bCashClaimable}}</p>
        <q-btn label="UnStake" color="primary" @click="unStake" class="q-ma-sm"> </q-btn>
        <q-btn label="Compound" color="primary" @click="compound" class="q-ma-sm"> </q-btn>
      </div>
    </q-banner>
  </div>
</template>

<script>
import {getBcashContractNoSigner, getBcashContract, getSbCashContract, getSbCashContractNoSigner} from "@/utils/contract";
import Number from '@/utils/formatBalance';
import {web3Modal} from "@/config/mixins";
import {ethers} from "ethers";
import BetterTimer from "@/components/BetterTimer";
export default {
  name: "SbContainer",
  components: {BetterTimer},
  mixins: [web3Modal],
  data: function() {
    return {
      errorMessage: "",
      mySbCash: 0,
      myBcash: 0,
      myPercentage: 0,
      myApproval: 0,
      bCashAmount: 0,
      bCashClaimable: 0,
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
    getBalances: async function () {
      const {active ,account} = this.web3Modal;
      if (active) {
        const bCashContract = getBcashContractNoSigner();
        const sbCashContract = getSbCashContractNoSigner();

        await bCashContract.balanceOf(account).then(x => {
          this.myBcash = (Number(x) / 10**18).toFixedNoRound(3);
        })

        await bCashContract.allowance(this.account, "0xC77daa127Cd8A3C051a1B835003b6925c04B55cB").then(x => {
          this.myApproval = (Number(x) / 10**18).toFixedNoRound(3);
        })

        await sbCashContract.balanceOf(account).then(x => {
          this.mySbCash = (Number(x) / 10**18).toFixedNoRound(3);
        })

        if(this.mySbCash > 0) {
          await sbCashContract.totalView().then(x => {
            this.myPercentage = (((this.mySbCash * 10**18) / Number(x[0])) * 100).toFixedNoRound(2);
          })

          await sbCashContract.getShareFor(account).then(x => {
            this.bCashClaimable = ((Number(x) / 10**18) * 0.9).toFixedNoRound(3);
          })

          await sbCashContract.timeLeftFor(account).then(x => {
            this.timestamp = (Number(x) * 1000) + Date.now();
          })
        }
      }
    },
    approveBcash: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getBcashContract();
          const tx = await contract["approve"]("0xC77daa127Cd8A3C051a1B835003b6925c04B55cB",ethers.utils.parseEther((this.bCashAmount.toString())));
          this.errorMessage = 'Approving...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully Approved!'
            await contract.allowance(this.account, "0xC77daa127Cd8A3C051a1B835003b6925c04B55cB").then(x => {
              this.myApproval = (Number(x) / 10**18).toFixedNoRound(3);
            })
          } else {
            this.errorMessage = 'Approval Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
    stake: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getSbCashContract();
          const tx = await contract["stake"](ethers.utils.parseEther((this.bCashAmount.toString())));
          this.errorMessage = 'Staking...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully Staked!'
            await this.getBalances();
          } else {
            this.errorMessage = 'Staking Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
    unStake: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getSbCashContract();
          const tx = await contract["unStake"]();
          this.errorMessage = 'unStaking...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully unStaked!'
            await this.getBalances();
          } else {
            this.errorMessage = 'unStaking Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
    compound: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getSbCashContract();
          const tx = await contract["compound"]();
          this.errorMessage = 'Compounding...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully compounded!'
            await this.getBalances();
          } else {
            this.errorMessage = 'Compounding Failed!'
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
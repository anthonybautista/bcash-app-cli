<template>
  <div id="cc" class="q-pt-md q-pb-md q-mb-none flex justify-center bg-secondary rounded-borders q-mx-auto shadow-5">
    <q-banner rounded class="bg-accent text-white q-px-none q-mx-auto" id="banner">
      <h5 class="text-black q-pa-none q-mt-none q-mb-xs text-center">LP Farm</h5>
      <div id="gameBanner" class="text-center q-mx-auto">
        <div id="bCashDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">Est. bCASH Staked</p>
          <p class="q-mb-none">{{bCashStaked}}</p>
        </div>
        <div id="lpDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">PGL Staked</p>
          <p class="q-mb-none">{{pglStaked}}</p>
        </div>
        <div id="veCashDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">Est. AVAX Staked</p>
          <p class="q-mb-none">{{avaxStaked}}</p>
        </div>
      </div>
      <div class="text-center text-black q-mx-auto q-mt-sm">
        <p>Current PGL Rewards: {{pglRewards}} $bCASH per 1 AVAX in LP per day.</p>
      </div>
      <div class="text-center q-mt-md">
        <p class="text-black">
          You must approve PGL before staking.
        </p>
        <p class="text-negative">{{this.errorMessage}}</p>
        <q-input class="q-ma-sm bg-secondary q-pa-none rounded-borders"
                 type="number"
                 filled
                 id="pglAmount"
                 label="Enter Amount PGL"
                 lazy-rules
                 v-model="pglAmount"
                 :rules="[ val => val > 0 || 'Invalid Amount']"
        ></q-input>
        <p class="text-black q-mb-none">You have: {{myPgl}} PGL</p>
        <p class="text-black q-mb-none">You Approved: {{myApproval}} PGL</p>
        <q-btn v-if="this.myApproval <= this.myPgl" label="Approve" color="primary" @click="approvePgl" class="q-ma-sm"> </q-btn>
        <q-btn label="Stake" color="primary" @click="stakePgl" class="q-ma-sm"> </q-btn>
        <q-btn label="unStake" color="primary" @click="unStakePgl" class="q-ma-sm"> </q-btn>
      </div>
      <q-separator/>
      <div class="q-mt-sm text-black text-center text-bold">
        <p class="q-mb-none q-pb-none">bCash Claimable:</p>
        <p class="q-mb-none">{{bCashClaimable}}</p>
        <q-btn label="Claim" color="primary" @click="claimBCash" class="q-ma-sm"> </q-btn>
      </div>
    </q-banner>
  </div>
</template>

<script>
import {getFarmContract, getFarmContractNoSigner, getPglContract, getPglContractNoSigner} from "@/utils/contract";
import Number from '@/utils/formatBalance';
import {web3Modal} from "@/config/mixins";
import {ethers} from "ethers";
export default {
  name: "LpContainer",
  mixins: [web3Modal],
  data: function() {
    return {
      errorMessage: "",
      pglStaked: 0,
      myPgl: 0,
      myApproval: 0,
      bCashClaimable: 0,
      pglAmount: 0,
      bCashStaked: 0,
      avaxStaked: 0,
      pglRewards: 0,
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
        const farmContract = getFarmContract();
        const pglContract = getPglContractNoSigner();

        await pglContract.balanceOf(account).then(x => {
          this.myPgl = (Number(x) / 10**18).toFixedNoRound(3);
        })

        await pglContract.allowance(account, "0x33B9da3bc122219C1B8ed484C6DB7f2D6c6d82C3").then(x => {
          this.myApproval = (Number(x) / 10**18).toFixedNoRound(3);
        })

        await farmContract.LPStaked(account).then(x => {
          this.pglStaked = (Number(x) / 10**18).toFixedNoRound(3);
        })

        await farmContract.totalView(account).then((x) => {
          this.avaxStaked = (Number(x[0]) / 10**18).toFixedNoRound(3);
          this.bCashStaked = (Number(x[1]) / 10**18).toFixedNoRound(3);
          this.bCashClaimable = (Number(x[2]) / 10**18).toFixedNoRound(3);
        })
      }
    },
    approvePgl: async function() {
      const {active,account} = this.web3Modal;
      if (active) {
        try {
          const contract = getPglContract();
          const tx = await contract["approve"]("0x33B9da3bc122219C1B8ed484C6DB7f2D6c6d82C3",ethers.utils.parseEther((this.pglAmount.toString())));
          this.errorMessage = 'Approving...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully Approved!'
            await contract.allowance(account, "0x04Ee75e533622E8C24D463588d83a310c21fEE3F").then(x => {
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
    stakePgl: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getFarmContract();
          const tx = await contract["stakeLP"](ethers.utils.parseEther((this.pglAmount.toString())));
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
    unStakePgl: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getFarmContract();
          const tx = await contract["unstakeLP"](ethers.utils.parseEther((this.pglAmount.toString())));
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
    claimBCash: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getFarmContract();
          const tx = await contract["claimBCash"]();
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
    let farmContract = getFarmContractNoSigner();
    this.pglRewards = Number(await farmContract.LP_STAKE_DAY_RATIO()) / 10;
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
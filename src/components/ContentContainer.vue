<template>
  <div id="cc" class="q-pt-md q-pb-md q-mt-xl q-mb-none flex justify-center bg-secondary rounded-borders q-mx-auto shadow-5">
    <q-banner rounded class="bg-accent text-white q-px-none q-mx-auto" id="banner">
      <div id="gameBanner" class="text-center q-mx-auto">
        <div id="bCashDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">bCASH Staked</p>
          <p class="q-mb-none">{{bCashStaked}}</p>
        </div>
        <div id="lpDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">LP bCASH</p>
          <p class="q-mb-none">{{lpBcash}}</p>
        </div>
        <div id="veCashDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <p class="q-mb-xs">Your veCASH</p>
          <p class="q-mb-none">{{myVeCash}}</p>
        </div>
        <div id="tierProgress" class="q-mt-sm text-black">
          <p class="q-mb-none q-pb-none">Your Tier Level:</p>
          <p class="q-mb-none">{{tier}}</p>
          <q-linear-progress size="25px" :value="progress" color="primary">
            <div class="absolute-full flex flex-center">
              <q-badge color="accent" text-color="black" :label="totalStake+' staked'" />
            </div>
          </q-linear-progress>
        </div>
      </div>
      <div class="text-center q-mt-md">
        <p class="text-black">
          You must approve bCASH before staking.<br/>
          Unstaking any amount burns all your veCASH and incurs a 10% tax.
        </p>
        <p class="text-negative">{{this.errorMessage}}</p>
        <q-input class="q-ma-sm bg-secondary q-pa-none rounded-borders"
                 type="number"
                 filled
                 id="bCashAmount"
                 label="Enter Amount"
                 lazy-rules
                 v-model="bCashAmount"
                 :rules="[ val => val > 0 || 'Invalid Game ID']"
        ></q-input>
        <p class="text-black q-mb-none">You have: {{myBcash}} bCASH</p>
        <q-btn label="Approve" color="primary" @click="approveBcash" class="q-ma-sm"> </q-btn>
        <q-btn label="Stake" color="primary" @click="stakeBcash" class="q-ma-sm"> </q-btn>
        <q-btn label="unStake" color="primary" @click="unStakeBcash" class="q-ma-sm"> </q-btn>
      </div>
      <q-separator/>
      <div class="q-mt-sm text-black text-center text-bold">
        <p class="q-mb-none q-pb-none">veCash Claimable:</p>
        <p class="q-mb-none">{{veCashClaimable}}</p>
        <q-btn label="Claim" color="primary" @click="claimVeCash" class="q-ma-sm"> </q-btn>
      </div>
    </q-banner>
    <q-list bordered class="q-mx-auto q-mt-sm bg-primary" id="nft-exp">
      <q-expansion-item label="Your PAPILIO" header-class="text-white text-center text-weight-bold" id="exp" :key="refreshController">
        <n-f-t-container v-if="nfts.length > 0" :nfts="nfts" :key="nfts" :staked="stakedCount" @reload="reloadContainer" @staked="getBalances"></n-f-t-container>
        <p v-else class="text-white text-center q-pt-md">You have no Papilio Palatia NFTs!</p>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
import NFTContainer from "@/components/NFTContainer";
import {getBcashContract, getPapilioContract, getVecashContract} from "@/utils/contract";
import Number from '@/utils/formatBalance';
import NFT from "@/models/nft";
import {web3Modal} from "@/config/mixins";
import axios from "axios";
import {ethers} from "ethers";
export default {
  name: "ContentContainer",
  components: {NFTContainer},
  mixins: [web3Modal],
  data: function() {
    return {
      errorMessage: "",
      refreshController: false,
      bCashStaked: 0,
      lpBcash: 0,
      myVeCash: 0,
      myBcash: 0,
      tier: 0,
      bCashAmount: 0,
      veCashClaimable: 0,
      stakedCount: 0,
      nfts: [],
    }
  },

  props: {
  },

  computed: {
    totalStake() {
      return this.bCashStaked + this.lpBcash;
    },
    progress() {
      if (this.totalStake > 100000) {
        return 1;
      }
      return this.totalStake / 100000;
    },
    account() {
      const {active,account} = this.web3Modal;
      if (active) {
        return account;
      }
      return "";
    }
  },

  methods: {
    reloadContainer() {
      this.refreshController = !this.refreshController;
    },
    getBalances: async function () {
      const {active ,account} = this.web3Modal;
      if (active) {
        const contract = getVecashContract();
        const nftContract = getPapilioContract();
        const bCashContract = getBcashContract();
        this.nfts = [];
        let allTokens = await nftContract.tokensOfOwner(account);
        let [bCashStaked, lpBcash, tier, stakedTokens] = await contract.totalViewFor(account);
        console.log(stakedTokens)
        this.veCashClaimable = Number((await contract.claimable(account)) / 10**18).toFixedNoRound(6);
        this.myVeCash = Number((await contract.balanceOf(account)) / 10**18).toFixedNoRound(2);
        this.stakedCount = stakedTokens.length;
        this.bCashStaked = (bCashStaked / 10**18).toFixedNoRound(2);
        this.lpBcash = (lpBcash / 10**18).toFixedNoRound(2);
        this.tier = Number(tier);

        for (let i = 0; i < allTokens.length; i++) {
          let meta = await NFT.getURI(Number(allTokens[i]));
          if (meta.substring(0,4) === "ipfs") {
            meta = "\t\n" + "https://cloudflare-ipfs.com/ipfs/"+meta.substring(7);
          }
          let uri;
          const options = {
            method: 'GET',
            url: meta,
          };
          axios.request(options).then(function (response) {
            uri = response.data["image"];
            if (uri.substring(0,4) === "ipfs") {
              uri = "https://gateway.pinata.cloud/ipfs/"+uri.substring(7);
            }
          })
              .then( () => {
                let staked = false;
                for (let j = 0 ; j < stakedTokens.length; j++) {
                  if (Number(stakedTokens[j]) === Number(allTokens[i])) {
                    staked = true;
                  }
                }
                if (staked) {
                  this.nfts.push(new NFT(Number(allTokens[i]), uri, true));
                } else {
                  this.nfts.push(new NFT(Number(allTokens[i]), uri));
                }
              })
        }
        await bCashContract.balanceOf(account).then(x => {
          this.myBcash = (Number(x) / 10**18).toFixedNoRound(6);
        })
      }
    },
    approveBcash: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getBcashContract();
          const tx = await contract["approve"]("0x04Ee75e533622E8C24D463588d83a310c21fEE3F",ethers.utils.parseEther((this.bCashAmount.toString())));
          this.errorMessage = 'Approving...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully Approved!'
          } else {
            this.errorMessage = 'Approval Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
    stakeBcash: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getVecashContract();
          const tx = await contract["deposit"](ethers.utils.parseEther((this.bCashAmount.toString())));
          this.errorMessage = 'Staking...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully Staked!'
            this.$emit('reload');
          } else {
            this.errorMessage = 'Staking Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
    unStakeBcash: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getVecashContract();
          const tx = await contract["withdraw"](ethers.utils.parseEther((this.bCashAmount.toString())));
          this.errorMessage = 'unStaking...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully unStaked!'
            this.$emit('reload');
          } else {
            this.errorMessage = 'unStaking Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
    claimVeCash: async function() {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getVecashContract();
          const tx = await contract["claim"]();
          this.errorMessage = 'Claiming...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully claimed!'
            this.$emit('reload');
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
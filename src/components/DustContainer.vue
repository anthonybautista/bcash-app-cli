<template>
  <div id="cc" class="q-pt-md q-pb-md q-mb-none flex justify-center bg-secondary rounded-borders q-mx-auto shadow-5">
    <q-banner rounded class="bg-accent text-white q-px-none q-mx-auto" id="banner">
      <h5 class="text-black q-pa-none q-mt-none q-mb-xs text-center">DSTR Protocol</h5>
      <div class="text-center q-mt-md">
        <p class="text-black">
          This contract allows you to swap from JOE/WAVAX or EGG/WAVAX JLP tokens to bCASH/WAVAX PGL tokens in one transaction.
          This protocol was designed by <span @click="gotoURL('https://twitter.com/minerminer_')" class="text-primary cursor-pointer">@minerminer_</span>
          and allows you to save gas in addition to diversifying the bCASH treasury.
        </p>
        <p @click="gotoURL('https://decentralizedsystems.substack.com/p/the-dstr-protocol')" class="text-warning cursor-pointer">Learn More Here</p>
      </div>
      <div id="gameBanner" class="text-center q-mx-auto">
        <div id="joeDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <img src="@/assets/traderjoe_32.png" />
          <p class="q-mb-xs">Your JOE/WAVAX JLP</p>
          <p class="q-mb-none">{{joeLP}}</p>
          <p class="q-mb-none">Your Approved JLP</p>
          <p class="text-caption q-mb-none">click to select amount</p>
          <p class="q-mb-none cursor-pointer" @click="setAmount('joe')">{{joeLPApproved}}</p>
          <q-btn label="Approve All" color="accent" @click="approveToken('joe')" class="q-ma-sm text-black"> </q-btn>
          <q-input class="q-ma-sm bg-secondary q-pa-none rounded-borders"
                   type="number"
                   filled
                   id="joeAmount"
                   label="Enter Amount To Dust"
                   lazy-rules
                   v-model="joeAmount"
                   :rules="[ val => val > 0 || 'Invalid Amount']"
          ></q-input>
          <q-btn label="DUST" color="accent" @click="dust('joe')" class="q-ma-md text-black"> </q-btn>
        </div>
        <div id="eggDiv" class="bg-primary q-pa-sm q-mx-xs rounded-borders shadow-5">
          <img src="@/assets/chikneeg_32.png" />
          <p class="q-mb-xs">Your EGG/WAVAX JLP</p>
          <p class="q-mb-none">{{eggLP}}</p>
          <p class="q-mb-none">Your Approved JLP</p>
          <p class="text-caption q-mb-none">click to select amount</p>
          <p class="q-mb-none cursor-pointer" @click="setAmount('egg')">{{eggLPApproved}}</p>
          <q-btn label="Approve All" color="accent" @click="approveToken('egg')" class="q-ma-sm text-black"> </q-btn>
          <q-input class="q-ma-sm bg-secondary q-pa-none rounded-borders"
                   type="number"
                   filled
                   id="eggAmount"
                   label="Enter Amount To Dust"
                   lazy-rules
                   v-model="eggAmount"
                   :rules="[ val => val > 0 || 'Invalid Amount']"
          ></q-input>
          <q-btn label="DUST" color="accent" @click="dust('egg')" class="q-ma-md text-black"> </q-btn>
        </div>
      </div>
      <div class="text-center q-mt-md">

        <p class="text-negative">{{this.errorMessage}}</p>

      </div>
      <q-separator/>
      <div class="q-mt-sm text-black text-center text-bold">
        <p class="text-black q-mb-none">Your bCASH/WAVAX PGL</p>
        <p class="q-mb-none">{{bCashLP}}</p>
      </div>
    </q-banner>
  </div>
</template>

<script>
import {
  getDSTRContract,
  getJOELPContract,
  getEGGLPContract,
  getPglContractNoSigner,
} from "@/utils/contract";
import Number from '@/utils/formatBalance';
import {web3Modal} from "@/config/mixins";
import {ethers} from "ethers";
export default {
  name: "DustContainer",
  mixins: [web3Modal],
  data: function() {
    return {
      errorMessage: "",
      joeLP: 0,
      eggLP: 0,
      joeLPApproved: 0,
      eggLPApproved: 0,
      joeAmount: 0,
      eggAmount: 0,
      bCashLP: 0,
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
    setAmount: function(token) {
      if (token === 'egg') {
        this.eggAmount = this.eggLPApproved;
      } else if (token === 'joe') {
        this.joeAmount = this.joeLPApproved;
      }
    },
    getBalances: async function () {
      const {active ,account} = this.web3Modal;
      if (active) {
        const JOEcontract = getJOELPContract();
        const EGGcontract = getEGGLPContract();
        const PGLcontract = getPglContractNoSigner();

        await JOEcontract.balanceOf(account).then(x => {
          this.joeLP = (Number(x) / 10**18).toFixedNoRound(6);
        });

        await JOEcontract.allowance(this.account, "0x9592Aae19E7ac5568Ef2c72981FE88C295F0c785").then(x => {
          this.joeLPApproved = (Number(x) / 10**18).toFixedNoRound(6);
        })

        await EGGcontract.balanceOf(account).then(x => {
          this.eggLP = (Number(x) / 10**18).toFixedNoRound(6);
        });

        await EGGcontract.allowance(this.account, "0x9592Aae19E7ac5568Ef2c72981FE88C295F0c785").then(x => {
          this.eggLPApproved = (Number(x) / 10**18).toFixedNoRound(6);
        })

        await PGLcontract.balanceOf(account).then(x => {
          this.bCashLP = (Number(x) / 10**18).toFixedNoRound(6);
        });

      }
    },
    dust: async function(token) {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          const contract = getDSTRContract();

          let tx;

          if (token === 'egg') {
            tx = await contract.dust("0x3052a75dfD7A9D9B0F81E510E01d3Fe80A9e7ec7", "0x07280f32830e3A1Ca7B535b603B09890e692EaF6", ethers.utils.parseEther(this.eggAmount.toString()));
          } else if (token === 'joe') {
            tx = await contract.dust("0x454E67025631C065d3cFAD6d71E6892f74487a15", "0x07280f32830e3A1Ca7B535b603B09890e692EaF6", ethers.utils.parseEther(this.joeAmount.toString()));
          }

          this.errorMessage = 'Dusting...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully Dusted!'
            await this.getBalances();
          } else {
            this.errorMessage = 'Dusting Failed!'
          }
        } catch (e) {
          this.errorMessage = e["reason"];
        }
      }
    },
    approveToken: async function(token) {
      const {active,} = this.web3Modal;
      if (active) {
        try {
          let contract;
          let amount;
          if (token === 'egg') {
            contract = getEGGLPContract();
            amount = this.eggLP;
          } else if (token === 'joe') {
            contract = getJOELPContract();
            amount = this.joeLP;
          }

          const tx = await contract["approve"]("0x9592Aae19E7ac5568Ef2c72981FE88C295F0c785",ethers.utils.parseEther((amount.toString())));
          this.errorMessage = 'Approving...';
          const receipt = await tx.wait()
          if (receipt.status) {
            this.errorMessage = 'Successfully Approved!'
            if (token === 'egg') {
              await contract.allowance(this.account, "0x9592Aae19E7ac5568Ef2c72981FE88C295F0c785").then(x => {
                this.eggLPApproved = (Number(x) / 10**18).toFixedNoRound(6);
              })
            } else if (token === 'joe') {
              await contract.allowance(this.account, "0x9592Aae19E7ac5568Ef2c72981FE88C295F0c785").then(x => {
                this.joeLPApproved = (Number(x) / 10**18).toFixedNoRound(6);
              })
            }
          } else {
            this.errorMessage = 'Approval Failed!'
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
    grid-template-columns: 50% 50%;
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
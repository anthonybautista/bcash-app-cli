<template>
  <q-card class="my-card q-ma-md nftCard" :key="nft.tokenId" v-bind:style= "[nft.staked ? 'background-color: #631d76; color: white;' : 'background-color: #DDDBCB;']">
    <q-img :src="nft.pic" class="nft"></q-img>

    <q-card-section class="q-pa-none">
      <div class="text-h6">Papilio #{{nft.tokenId}}</div>
    </q-card-section>
    <p class="text-negative q-ma-none">{{this.errorMessage}}</p>
    <q-card-section v-if="!nft.staked">
      <q-btn class="bg-primary text-white" @click="stake">Stake</q-btn>
    </q-card-section>
    <q-card-section v-else>
      <q-btn class="bg-primary text-white" @click="unStake">Un-Stake</q-btn>
    </q-card-section>
  </q-card>
</template>

<script>
import {getVecashContract} from "@/utils/contract";

export default {
  name: "NFTCard",
  data: function() {
    return {
      errorMessage: "",
    }
  },

  props: {
    nft: {
      type: Object,
      required: true,
    },
  },

  methods: {
    stake: async function() {
      try {
        const contract = getVecashContract();
        const tx = await contract["stakeNFTs"]([this.nft.tokenId]);
        this.errorMessage = 'Staking...';
        const receipt = await tx.wait();
        if (receipt.status) {
          this.errorMessage = 'Successfully Staked!';
          this.$emit('staked');
        } else {
          this.errorMessage = 'Staking Failed!';
        }
      } catch (e) {
        this.errorMessage = e["reason"];
      }
    }
  },

  watch: {
  },

  mounted: async function () {
  },
}
</script>

<style>
.nft {
  height: 160px;
  min-width: 160px;
}

.nftCard {
  width: 160px;
}
</style>
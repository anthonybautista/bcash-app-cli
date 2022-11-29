<template>
  <div class="flex justify-center q-ma-l q-pa-md text-center bg-primary">
    <div class="text-white text-center q-mx-auto q-px-sm rounded-borders" id="boost">{{boost}}% veBoost</div>
    <div v-if="nfts.length > 0" id="itemContainer" class="flex justify-center q-ma-l q-pa-md text-center bg-primary">
      <n-f-t-card v-for="item in nfts" :key="item.tokenId" :nft="item" @staked="reload">
      </n-f-t-card>
    </div>
<!--    <div v-else>
      <div class="buffer q-mt-xl"></div>
      <p class="text-white">If nfts don't load after a few seconds, click button.</p>
      <q-btn class="bg-secondary text-white" @click="reload">Load NFTs</q-btn>
    </div>-->
  </div>
</template>

<script>
import NFTCard from "@/components/NFTCard";
export default {
  name: "NFTContainer",
  components: {NFTCard},
  data: function() {
    return {

    }
  },

  props: {
    nfts: {
      type: Array,
      required: true,
    },
    staked: {
      type: Number,
      required: true,
    }
  },

  computed: {
    boost() {
      return this.staked * 5;
    }
  },

  methods: {
    reload() {
      this.$emit('reload');
    },
  },

  watch: {
    nfts: {
      handler: async function() {
        this.reload();
      },
    },
  },

  mounted: function () {
  },
}
</script>

<style scoped>
#itemContainer {
  width: 90%;
}
#boost {
  background-color: #631d76;
}
</style>
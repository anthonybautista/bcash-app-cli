<template>
  <div class="timer">
    <div class="clock q-px-xs">
      {{ days }}d:{{ hours }}h:{{ minutes }}m:{{ seconds }}s
    </div>
  </div>
</template>

<script>
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_MINUTE = 1000 * 60;
const MS_PER_SECOND = 1000;
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "BetterTimer",
  data(){
    return {
      timeRemaining: this.timestamp,
    }
  },

  props: {
    timestamp: {
      type: Number,
      required: true,
    },
  },

  computed: {
    days(){
      let days = this.timeRemaining / MS_PER_DAY;
      return this.timeRemaining > 0 ? Math.floor(days) : Math.abs(Math.ceil(days));
    },
    hours(){
      let hours = (this.timeRemaining % MS_PER_DAY) / MS_PER_HOUR;
      return this.timeRemaining > 0 ? Math.floor(hours) : Math.abs(Math.ceil(hours));
    },
    minutes(){
      let minutes = (this.timeRemaining % MS_PER_HOUR) / MS_PER_MINUTE;
      return this.timeRemaining > 0 ? Math.floor(minutes) : Math.abs(Math.ceil(minutes));
    },
    seconds(){
      let seconds = (this.timeRemaining % MS_PER_MINUTE) / MS_PER_SECOND;
      return this.timeRemaining > 0 ? Math.floor(seconds) : Math.abs(Math.ceil(seconds));
    },
  },

  mounted(){
    setInterval(() => {
      // update time remaining
      if (this.timestamp > 0) {
        this.timeRemaining = this.timestamp - Date.now();
      }
    }, 1000);
  },
}
</script>

<style scoped>
</style>
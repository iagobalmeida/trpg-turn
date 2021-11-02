<template>
  <div class="row d-flex">
    <div :class="`col${labelOnTop ? '-12 mb-1' : ''} text d-flex text-white justify-content-start align-items-center`" v-if="!hideLabel">
      <!--
      <i :class="`${iconName} ${className} d-flex h-100 align-items-center justify-content-center  rounded-pill  text-dark border border-2 border-white`"></i>
      -->
      <i :class="`${iconName} me-3`"></i>
      {{current}}&nbsp;<small>/{{maximum}}</small> 
    </div>
    <div :class="`col${labelOnTop ? '-12' : ''} flex-grow`">
      <div class="progress bg-dark w-auto mb-3 h-100 border border-2 border-white">
        <div
        :class="`progress-bar ${ animating ? 'progress-bar-striped progress-bar-animated' : ''} ${className}`"
        role="progressbar"
        :style="`width:${current*100/maximum}%`"
        aria-valuenow="0"
        aria-valuemin="0"
        aria-valuemax="100"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    current: Number,
    maximum: Number,
    animating: Boolean,
    className: String,
    iconName: String,
    labelOnTop: { type: Boolean, default: false },
    hideLabel: { type: Boolean, default: false }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flex-grow {
  flex-grow: 10;
}
.text {
  min-width: 130px;
}
.progress {
  filter: drop-shadow(1px 8px 8px #00000060);
  -webkit-filter: drop-shadow(1px 8px 8px #00000060);
  -moz-filter: drop-shadow(1px 8px 8px #00000060);
}
.row {
  font-size: 14px;
}
</style>

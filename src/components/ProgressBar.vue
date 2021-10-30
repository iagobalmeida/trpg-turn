<template>
  <div class="row d-flex">
    <div class="col text d-flex text-white justify-content-start align-items-center">
      <!--
      <i :class="`${iconName} ${className} d-flex h-100 align-items-center justify-content-center  rounded-pill  text-dark border border-2 border-white`"></i>
      -->
      <i :class="`${iconName} me-3`"></i>
      {{current}}&nbsp;<small>/{{maximum}}</small> 
    </div>
    <div class="col flex-grow">
      <div class="progress bg-dark w-auto mb-3 h-100 border border-2 border-white shadow">
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
    iconName: String
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
</style>

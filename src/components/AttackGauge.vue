<template>
  <div class="g-1 row mb-3 align-items-center">
    <div
    class="col mx-1"
    v-for="gauge, gaugeIndex in biggestGauge"
    :key="`gauge_${gaugeIndex}`"
    :class="`rounded-pill border border-2 gauge border-2 ` + getClass(gauge)"
     style="height:15px"
    >
    </div>
    <div :class="`col-3 col-md-2 ${standing ? `text-${className}` : 'text-light'}`">
      <i class="fas fa-crosshairs mx-1"></i> <b>{{current}}</b>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AttackGauge',
  props: {
    biggestGauge: Number,
    current: Number,
    maximum: Number,
    threshold: Number,
    standing: Boolean,
    bursted: Boolean,
    className: String
  },
  methods: {
    getClass(value) {
      if(value > this.current) {
        if(this.bursted) {
          return 'bg-warning border-danger';
        }
        if(value > this.maximum) {
          return `bg-light`;
        }
        if(value >= this.threshold) {
          return `bg-secondary`;
        }
        return `bg-dark`;
      }
      if(this.standing){
        return `bg-${this.className} border-${this.className}`;
      }else{
        return `bg-${this.className} o-50 border-light`;
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.o-50 {
  opacity: 50;
}
</style>

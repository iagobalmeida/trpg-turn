<template>
    <div class="col-3" style="position: relative;">
        <button
        :class="`habilityCard m-0 btn p-0 w-100 border-4 border  btn-light ${cost > current || forceDisable ? 'o-50 bg-secondary border-secondary' : 'border-white'}`"
        v-on:click="!(cost > current || forceDisable) ? $emit('handleClick') : () => {}"
        draggable="true"
        >
            <div class="w-100">
                <small :class="`  position-absolute top-0 px-2 py-1 ${cost > current || forceDisable ? 'bg-secondary border-secondary text-dark' : 'bg-white text-primary'}`">
                    {{cost}}
                    <i :class="`fas fa-fire ${cost > current || forceDisable ? 'text-dark' : 'text-primary'}`"></i>
                </small> 
                <img class="w-100" :src="require(`@/assets/skills/${image}`)" draggable="false" style="pointer-events:none;">
            </div>
            <div class="py-2 px-1 d-flex justify-content-between align-items-center">
                <b>{{name}}</b>
            </div>
            <p>{{description}}</p>
        </button>
    </div>
</template>

<script>
export default {
  name: 'HabilityCard',
  props: {
    name: String,
    cost: Number,
    current: Number,
    description: String,
    image: String,
    forceDisable: Boolean
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.o-50 {
    opacity: 0.75;
}
.habilityCard {
  position: inherit;
  transition: all 175ms ease-in-out;
  transform-origin: center;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
}
.habilityCard *{
  transition: all 175ms ease-in-out;
}
.habilityCard p{
  max-height: 0px;
  margin-bottom: 0px;
  overflow: hidden;
  transition: max-height 275ms ease-in;
  transition-delay: 0s;
  transition-duration: 0s;
}
.habilityCard img{
  z-index: 0;
}

.habilityCard:hover {
  position: absolute;
  top: 0;
  left: 0;
  transform: scale(1.1) perspective(105em) rotateX(18deg) translateY(-20%);
  z-index: 99;
  box-shadow: 0 0.5rem 3rem rgb(0 0 0);
}

.habilityCard:hover p {
  max-height: 500px;
  margin-bottom: 10px;
  transition-delay: 50ms;
  transition-duration: 275ms;
}
</style>

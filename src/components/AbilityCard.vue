<template>
    <div class="col" style="position: relative;">
        <button
        :class="`abilityCard m-0 btn p-0 w-100 border-4 border  btn-light ${cost > current || forceDisable ? 'o-50 bg-secondary border-secondary' : 'border-white'}`"
        v-on:click="!(cost > current || forceDisable) ? $emit('handleClick') : () => {}"
        draggable="true"
        >
            <div class="w-100 abilityCard-img" :style="`background-image:url(${loadedImage});`">
                <small :class="`position-absolute top-0 left-0 px-2 py-1 ${cost > current || forceDisable ? 'bg-secondary border-secondary text-dark' : 'bg-white text-primary'}`">
                    {{cost}}
                    <i :class="`fas fa-fire ${cost > current || forceDisable ? 'text-dark' : 'text-primary'}`"></i>
                </small> 
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
  name: 'AbilityCard',
  props: {
    name: String,
    cost: Number,
    current: Number,
    description: String,
    image: String,
    forceDisable: Boolean
  },
  data() { 
    return {
      images: {
        'wound': require('@/assets/skills/wound.jpg'),
        'regret': require('@/assets/skills/regret.jpg'),
        'necronomicurse': require('@/assets/skills/necronomicurse.jpg'),
        'clumsy': require('@/assets/skills/clumsy.jpg'),
        'writhe': require('@/assets/skills/writhe.jpg'),
      }
    }
  },
  computed: {
    loadedImage() {
      return this.images[this.image];
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.o-50 {
  filter: grayscale(1);
}
.abilityCard {
  position: inherit;
  transform-origin: center;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
  transition: all 175ms ease-in-out;
}
.abilityCard *{
  transition: all 175ms ease-in-out;
}

.abilityCard-img {
  height: 50px;
  background-position: center;
  background-size: cover;
  z-index: 0;
  transition-delay: 0s;
  transition-duration: 0s;
}

.abilityCard-img small {
  border-bottom-right-radius: 15px;
  left: 0;
}

@media screen and (max-width:700px) {
  p {
    font-size: 12px;
  }
  b {
    font-size: 16px;
  }
}

@media screen and (min-width:700px) {

  .abilityCard p{
    max-height: 0px;
    margin-bottom: 0px;
    overflow: hidden;
    transition: max-height 275ms ease-in;
    transition-delay: 0s;
    transition-duration: 0s;
  }

  .abilityCard:hover {
    position: absolute;
    top: 0;
    left: 0;
    transform: scale(1.1) perspective(105em) rotateX(18deg);
    z-index: 99;
  }

  .abilityCard:hover p {
    max-height: 500px;
    margin-bottom: 10px;
    transition-delay: 50ms;
    transition-duration: 275ms;
    font-size: 80%;
    padding-left: 10px;
    padding-right: 10px;
  }

  .abilityCard:hover .abilityCard-img {
    height: 100px;
    transition-delay: 50ms;
    transition-duration: 275ms;
  }
}

.abilityCard:hover .abilityCard-img {
  animation: abilityCardImageMove 1s ease-in-out infinite alternate-reverse;
}

@keyframes abilityCardImageMove {
  0% {
    filter:brightness(1.0);
  }
  100% {
    filter:brightness(1.2);
  }
}
</style>

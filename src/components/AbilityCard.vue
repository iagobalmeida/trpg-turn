<template>
    <div class="col" style="position: relative;">
        <button
        :class="`abilityCard m-0 btn p-0 w-100 border-4 border  btn-light ${cost > current || forceDisable ? 'o-50 bg-secondary border-secondary' : 'border-white  bg-white'}`"
        v-on:click="!(cost > current || forceDisable) ? $emit('handleClick') : () => {}"
        draggable="true"
        >
            <div class="w-100 abilityCard-img" :style="`background-image:url(${loadedImage});`">
                <small :class="`position-absolute px-2 py-1 ${cost > current || forceDisable ? 'bg-secondary border-secondary text-dark' : 'bg-white text-primary'}`">
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
const images = () => {
  let files = {
    'battery-25.png': require('@/assets/skills/battery-25.png'),
    'battery-50.png': require('@/assets/skills/battery-50.png'),
    'battery-75.png': require('@/assets/skills/battery-75.png'),
    'battery-100.png': require('@/assets/skills/battery-100.png'),
    'battery-reset.png': require('@/assets/skills/battery-reset.png'),
    'battery-minus.png': require('@/assets/skills/battery-minus.png'),

    'meditation.png': require('@/assets/skills/meditation.png'),
    'prayer.png': require('@/assets/skills/prayer.png'),
    'resonance.png': require('@/assets/skills/resonance.png'),
    'slap.png': require('@/assets/skills/slap.png'),
    'glowing-hands.png': require('@/assets/skills/glowing-hands.png'),

    'medicine-pills.png': require('@/assets/skills/medicine-pills.png'),
    'medicines.png': require('@/assets/skills/medicines.png'),
    'pill.png': require('@/assets/skills/pill.png'),
    'overdose.png': require('@/assets/skills/overdose.png'),
    'nested-hearts.png': require('@/assets/skills/nested-hearts.png'),
    'miracle-medecine.png': require('@/assets/skills/miracle-medecine.png'),

    'swordman.png': require('@/assets/skills/swordman.png'),
    'pointy-sword.png': require('@/assets/skills/pointy-sword.png'),
    'shield-reflect.png': require('@/assets/skills/shield-reflect.png'),
    'mighty-force.png': require('@/assets/skills/mighty-force.png'),
    'scale-mail.png': require('@/assets/skills/scale-mail.png'),
    'holy-symbol.png': require('@/assets/skills/holy-symbol.png'),
    'holy-grail.png': require('@/assets/skills/holy-grail.png'),
    'acrobatic.png': require('@/assets/skills/acrobatic.png'),
    'angry-eyes.png': require('@/assets/skills/angry-eyes.png'),

    'potion-of-madness.png': require('@/assets/skills/potion-of-madness.png'),
    'knockout.png': require('@/assets/skills/knockout.png'),
    'despair.png': require('@/assets/skills/despair.png'),
    'misdirection.png': require('@/assets/skills/misdirection.png'),
    'blindfold.png': require('@/assets/skills/blindfold.png'),
    'broken-bone.png': require('@/assets/skills/broken-bone.png'),
  }
  return files;
}


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
      images: images()
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
  height: 100px;
  background-position: center;
  background-size: cover;
  z-index: 0;
  transition-delay: 0s;
  transition-duration: 0s;
}

.abilityCard-img small {
  border-bottom-right-radius: 15px;
  left: -1px;
  top: -1px;
}

p {
  font-size: 12px;
}
b {
  font-size: 14px;
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

<template>
    <div class="col" style="position: relative;">
        <button
        class="abilityCard m-0 btn p-0 w-100 border-4 border border-primary bg-primary bg-gradient"
        :disabled="(cost > current) || forceDisable"
        draggable="false"
        >
            <div
            class="w-100 abilityCard-img text-primary"
            :style="`background-image:url(${loadedImage});`"
            v-on:click="!((cost > current) || forceDisable) ? $emit('handleClick') : () => {}"
            >
                <small
                :class="`d-none d-md-block left position-absolute px-2 py-1 bg-white`"
                v-if="keymap != null">
                    {{keymap}}
                </small> 
                <small
                :class="`right position-absolute px-2 py-1 bg-white`">
                    {{cost}}
                    <i class="fas fa-fire me-1"></i>
                    <i class="fas fa-arrow-up fa-xs"></i> 
                </small> 
            </div>
            <div class="text-white">
              <div class="p-2 text-start">
                  <b>{{name}}</b>
                  <p class="mb-0">{{description}}</p>
              </div>
              <b class="text-center w-100" 
                v-on:click="!((cost > current) || forceDisable) ? $emit('handleDiscard') : () => {}"
                v-if="discardCost">
                  {{discardCost}}
                  <i class="fas fa-fire me-1"></i> 
                  <i class="fas fa-arrow-down fa-xs"></i> 
              </b> 
            </div>
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
    keymap: { type: Number, default: null },
    name: String,
    cost: Number,
    current: Number,
    description: String,
    image: String,
    forceDisable: Boolean,
    discardCost: { type: Number, default: null }
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
.o-50 img {
  filter: grayscale(1);
}
.abilityCard {
  position: inherit;
  transform-origin: center;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
  transition: all 175ms ease-in-out;
}
.abilityCard *{
  transition: background-color 175ms ease-in-out;
  padding-bottom: 6px;
}

.abilityCard-img {
  height: 100px;
  background-position: center;
  background-size: cover;
  z-index: 0;
  transition-delay: 0s;
  transition-duration: 0s;
}

.abilityCard-img small.left {
  border-bottom-right-radius: 15px;
  top: -1px;
  left: -1px;
}

.abilityCard-img small.right {
  border-bottom-left-radius: 15px;
  top: -1px;
  right: -1px;
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

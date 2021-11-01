<template>
  <!-- Toast -->
  <div :class="`custom-toast container ${toast.show ? 'o-100' : 'o-0'}`">
    <div class="p-3 rounded bg-white shadow h-100 mx-auto" v-html="toast.text" />
  </div>
  <!-- Enemy -->
  <div class="container w-md-50 rounded-top">
    <div class="background" :style="`background-image:url(${require('@/assets/background.jpg')});`"></div>
    <!-- Enemy Card -->
    <div class="mb-3 px-2 px-md-0">
      <!-- Name -->
      <h5 class="text-white mb-3"><b>{{enemy.name}}</b> <small>Lvl. {{enemy.level}}</small></h5>
        <!-- Life -->
        <ProgressBar 
          :current="enemy.life.current"
          :maximum="enemy.life.maximum"
          :animating="animating"
          className="bg-danger"
          iconName="fas fa-heart"
          class="mb-3"
          :labelOnTop="false"
        />
        <ProgressBar 
          :current="enemy.energy.current"
          :maximum="enemy.energy.maximum"
          :animating="animating"
          className="bg-info"
          iconName="fas fa-fire"
        />
    </div>
    <img class="mx-auto monster-img" :src="require(`@/assets/enemies/${enemy.image}`)" v-if="enemy.image">
  </div>
  <!-- Gauges -->
  <div class="container w-md-50" style="z-index:98;">
    <!-- Enemy Gauge -->
    <AttackGauge 
    :current="enemy.gauge.current"
    :maximum="enemy.gauge.maximum"
    :biggestGauge="biggestGauge"
    :threshold="enemy.gauge.threshold"
    :standing="enemy.status == 'standing'"
    :bursted="enemy.isBursted"
    className="danger"
    />
    <!-- Player Gauge -->
    <AttackGauge 
    :current="player.gauge.current"
    :maximum="player.gauge.maximum"
    :biggestGauge="biggestGauge"
    :standing="player.status == 'standing'"
    :bursted="player.isBursted"
    className="primary"
    />
  </div>
  <!-- Player Actions -->
  <div class="container w-md-50 habilityCard-container">
    <div class="row mb-3 flex-nowrap" v-on:dragStart="console.log($event)">
      <HabilityCard
        :name="card.name"
        :cost="card.cost"
        :current="player.energy.current"
        :description="card.description"
        :image="card.image"
        :forceDisable="animating" 
        v-on:handleClick="handlePlayerAction(card.type, card.modifier, card.cost)"
        v-for="card, cardIndex in player.habilityCards"
        :key="`card_${cardIndex}`"
      />
    </div>
  </div>
  <!-- Player Actions -->
  <div class="container w-md-50">
    <!-- Player Card -->
    <div class="mb-3 px-2 px-md-0">
      
      <div class="row mb-3">
        <div class="order-1 order-md-0 col-6 col-md-2 d-md-flex justify-content-center align-items-stretch flex-column">
          <button
            :class="`player-action m-0 h-100 btn btn-light ${!(animating || player.status == 'standing') ? 'shadow' : ''} border w-100 p-2`"
            v-on:click="handlePlayerAction('drawCard')" :disabled="(animating || player.status == 'standing')"
          >
            <div class="border border-2 border-primary text-primary rounded w-100 h-100 d-flex justify-content-center align-items-center flex-column">
              <span>
                {{player.cards.length}}
                <i class="far fa-caret-square-up fa-lg"></i>
              </span>
              <small style="font-size:70%">Draw Card</small>
            </div>
          </button>
        </div>
        <div class="order-0 order-md-1 col-12 col-md-8 row">
          <div class="col-6">
            <!-- Life -->
            <ProgressBar 
              :current="player.life.current"
              :maximum="player.life.maximum"
              :animating="animating"
              className="bg-danger"
              iconName="fas fa-heart"
              class="mb-3"
              :labelOnTop="true"
            />
          </div>
          <div class="col-6">
            <!-- Energy -->
            <ProgressBar 
              :current="player.energy.current"
              :maximum="player.energy.maximum"
              :animating="animating"
              className="bg-info"
              iconName="fas fa-fire"
              class="mb-3"
              :labelOnTop="true"
            />
          </div>
          <div class="col-12">
            <!-- Level -->
            <ProgressBar 
              :current="player.exp.current"
              :maximum="player.exp.next"
              :animating="true"
              className="bg-primary"
              iconName="fa fa-arrow-up"
              class="mb-3"
            />
          </div>
        </div>
        <div class="order-2 col-6 col-md-2 d-md-flex justify-content-center align-items-stretch flex-column">
          <!-- Player Actions -->
          <button
            :class="`player-action m-0 h-100 btn btn-light ${!(animating || player.status == 'standing') ? 'shadow' : ''} border w-100 p-2`"
            v-on:click="handlePlayerAction('stand')" :disabled="(animating || player.status == 'standing')"
          >
            
            <div class="border border-2 border-primary text-primary rounded w-100 h-100 d-flex justify-content-center align-items-center flex-column">
              <span>
                <i class="far fa-caret-square-down fa-lg"></i>
              </span>
              <small>Stand</small>
            </div>
          </button>
        </div>
      </div>

      <!-- Player -->
      <div class="row">
        <h5 class="mb-0 text-white col" style="align-self:center;">
          {{player.name}} 
          <small class="text-muted">Lvl. {{player.level}}</small>
        </h5>
        <div class="col-9">
          <small class="float-end btn btn-sm btn-outline-secondary rounded-pill px-3">
            <i class="fa fa-info"></i>
            Help
          </small>
          <small class="float-end btn btn-sm btn-outline-secondary rounded-pill mx-2 px-3">
            <i class="fa fa-user"></i>
            Player
          </small>
          <small class="float-end btn btn-sm btn-outline-secondary rounded-pill mx-2 px-3">
            <i class="fas fa-map"></i>
            Map
          </small>
          <small class="float-end btn btn-sm btn-outline-secondary rounded-pill px-3">
            <i class="fas fa-box"></i>
            Backpack
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProgressBar from './components/ProgressBar.vue';
import AttackGauge from './components/AttackGauge.vue';
import HabilityCard from './components/HabilityCard.vue';
import Battle from './assets/Battle.js';

export default {
  name: "App",
  components: {
    ProgressBar,
    AttackGauge,
    HabilityCard
  },
  data: () => ({
    battle: Battle(),
    toast: {
      show: false,
      text: '',
      timeout: null
    },
  }),
  created: function() {
    this.player.cards.shuffle();
    this.enemy.cards.shuffle();
  },
  computed: {
    biggestGauge() {
      return this.player.gauge.maximum > this.enemy.gauge.maximum ? this.player.gauge.maximum : this.enemy.gauge.maximum;
    },
    player() {
      return this.battle.player;
    },
    enemy() {
      return this.battle.enemy;
    },
    animating() {
      return this.battle.animating;
    }
  },
  methods: {
    showToast(text, duration=2000) {
      clearTimeout(this.toast.timeout);
      this.toast.text = text;
      this.toast.show = true;
      this.toast.timeout = setTimeout(() => {
        this.toast.show = false;
      }, duration);
    },

    handlePlayerAction(action, modifier, cost) {
      this.battle.handlePlayerAction(action, modifier, cost, this.showToast);
    },
  }
};

</script>

<style>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Roboto Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
button {
  padding: 0.5rem 1rem;
  margin: .25rem;
  border: 2px solid dodgerblue;
  color: dodgerblue;
  background-color: white;
  border-radius: 25px;
  transition: all 125ms;
  cursor: pointer;
}
button:hover {
  background-color: #eee;
}
button:disabled {
  opacity: 0.5;
}
h4{
  font-size: 1rem;
  margin: 10px;
}

.w-90 {
  width: 90%;
}

.btn, .card-body, .gauge {
  transition: all 125ms ease-in-out;
}

@media screen and (max-width:700px){
  .habilityCard-container {
    overflow-x: scroll;
  }
}

.custom-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 99;
  transform: translateX(-50%) translateY(-50%);
  transition: all 125ms ease-in-out;
}

.o-0 {
  opacity: 0;
  pointer-events: none;
}

.o-100 {
  opacity: 100;
}

.player-action {
  transition: all 125ms ease-in-out;
}

.player-action:hover {
  transform: translateY(-10px) scale(1.03);
}

.monster-img {
  filter: drop-shadow(1px 26px 29px #000000);
  -webkit-filter: drop-shadow(1px 26px 29px #000000);
  -moz-filter: drop-shadow(1px 26px 29px #000000);
  max-height: 125px;
  animation: monsterBreath 1.5s ease-in-out infinite alternate;
  transform-origin: bottom;
  margin-top: 100px;
  margin-bottom: 25px;
}
@media screen and (max-width:410px) {
  .monster-img {
    max-height: 125px;
  }
}
@keyframes monsterBreath {
  0% {
    transform: scale(1.0) ;
  }
  100% {
    transform: scaleX(1.01) scaleY(1.015) ;
  }
}

.text-white {
  filter: drop-shadow(2px 4px 6px black);
}

.container {
  max-width: 690px;
}

.background {
  background-size:cover;-webkit-box-shadow: inset 5px 5px 50px 30px #000000; 
  box-shadow: inset 5px 5px 50px 30px #000000;
  background-position:center;
  position: absolute;
  top: 15%;
  bottom: 35%;
  right: 15%;
  left: 15%;
  opacity: 0.4;
  z-index: -1;
  animation: dungeonTorches 5s ease-in-out infinite alternate-reverse;
}

@media screen and (max-width: 700px) {
  .background {
    bottom: 40%;
  }
}

@keyframes dungeonTorches {
  0% {
    opacity: 0.4;
  }
  5% {
    opacity: 0.38;
  }
  10% {
    opacity: 0.4;
  }

  30% {
    opacity: 0.4;
  }
  37% {
    opacity: 0.38;
  }
  42% {
    opacity: 0.4;
  }
  
  60% {
    opacity: 0.4;
  }
  67% {
    opacity: 0.38;
  }
  62% {
    opacity: 0.4;
  }
  
  90% {
    opacity: 0.4;
  }
  97% {
    opacity: 0.38;
  }
  92% {
    opacity: 0.4;
  }
}


</style>

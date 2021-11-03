<template>
  <!-- Toast -->
  <div :class="`custom-toast container ${toast.show ? 'o-100' : 'o-0'}`">
    <div class="p-3 rounded border border-2 text-white rounded shadow h-100 mx-auto" v-html="toast.text" style="background-color:black"/>
  </div>
  <!-- Enemy -->
  <div class="container w-md-50 rounded-top">
    <div class="background" :style="`background-image:url(${require('@/assets/backgrounds/Cemetery.png')});`"></div>
    <!-- Enemy Card -->
    <div class="mb-3 px-2 px-md-0 position-relative monster-img" :style="`background-image:url(${require(`@/assets/enemies/${enemy.image}`)});background-size:${50 + (enemy.size * 50)}px;`">
        <!-- Name -->
        <h5 class="text-white text-shadow mb-3"><b>{{enemy.name}}</b> <small>Lvl. {{enemy.level}}</small></h5>
        <!-- Life -->
        <ProgressBar 
          :current="Math.round(enemy.life.current)"
          :maximum="Math.round(enemy.life.maximum)"
          :animating="animating"
          className="bg-danger"
          iconName="fas fa-heart"
          class="mb-3"
          :labelOnTop="false"
        />
        <ProgressBar 
          :current="Math.round(enemy.energy.current)"
          :maximum="Math.round(enemy.energy.maximum)"
          :animating="animating"
          className="bg-info"
          iconName="fas fa-fire"
        />
        <div class="position-absolute w-100 d-flex justify-content-center align-items-center" v-if="enemy.statusEffects.length" style="bottom:-30px;">
          <span class="px-2 py-1 bg-white rounded-pill border border-2 shadow-sm"
            v-for="enemyStatus, enemyStatusIndex in enemy.statusEffects"
            :key="`playerStatus_${enemyStatusIndex}`"
            >
            <i :class="`${enemyStatus.icon}`"></i> {{enemyStatus.modifier}}<small class="text-muted">/{{enemyStatus.turns}}</small>
          </span>
        </div>
    </div>
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
  <div class="container w-md-50 abilityCard-container position-relative">
    <div class="row pb-3 flex-nowrap align-items-stretch" v-on:dragStart="console.log($event)">
      <transition-group name="fadeCards">
        <AbilityCard
          :type="card.type"
          :target="card.target"
          :name="card.name"
          :cost="card.cost"
          :current="player.energy.current"
          :description="card.description"
          :image="card.image"
          :forceDisable="animating || player.status == 'standing'" 
          v-on:handleClick="handlePlayerAction('abilityCard', cardIndex)"
          v-on:handleDiscard="handlePlayerAction('discardCard', cardIndex)"
          :discardCost="player.discardCost"
          v-for="card, cardIndex in player.abilityCards"
          :key="`card_${cardIndex}`"
          class="col-6 col-md-3"
          :keymap="cardIndex+1"
        />
      </transition-group>
      <div class="position-absolute w-100 bottom-0 d-flex justify-content-center align-items-center" v-if="player.statusEffects.length">
        <span class="px-2 py-1 bg-white rounded-pill border border-2 shadow-sm"
          v-for="playerStatus, playerStatusIndex in player.statusEffects"
          :key="`playerStatus_${playerStatusIndex}`"
          >
          <i :class="`${playerStatus.icon}`"></i> {{playerStatus.modifier}}<small class="text-muted">/{{playerStatus.turns}}</small>
        </span>
      </div>
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
              <small><b>D</b>raw Card</small>
            </div>
          </button>
        </div>
        <div class="order-0 order-md-1 col-12 col-md-8">
          <div class="row">
            <div class="col-6">
              <!-- Life -->
              <ProgressBar 
                :current="Math.round(player.life.current)"
                :maximum="Math.round(player.life.maximum)"
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
                :current="Math.round(player.energy.current)"
                :maximum="Math.round(player.energy.maximum)"
                :animating="animating"
                className="bg-info"
                iconName="fas fa-fire"
                class="mb-3"
                :labelOnTop="true"
              />
            </div>
            <div class="col-12 d-none d-md-block">
              <!-- Level -->
              <ProgressBar 
                :current="Math.round(player.exp.current)"
                :maximum="Math.round(player.exp.next)"
                :animating="true"
                className="bg-primary"
                iconName="fa fa-arrow-up"
                class="mb-3"
              />
            </div>
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
              <small><b>S</b>tand</small>
            </div>
          </button>
        </div>
      </div>

      <!-- Player -->
      <div class="row">
        <h5 class="mb-0 text-white col" style="align-self:center;">
          {{player.name}} 
          <small class="text-muted d-none d-md-inline">Lvl. {{player.level}}</small>
        </h5>
        <div class="col-9">
          <small class="float-end border-2 btn btn-sm btn-outline-secondary rounded-pill px-3 me-2" data-bs-toggle="modal" data-bs-target="#modalHelp" ref="helpButton">
            <i class="fa fa-info me-md-2"></i>
            <span class="d-none d-md-inline">Help</span>
          </small>
          <small class="float-end border-2 btn btn-sm btn-outline-secondary rounded-pill px-3 me-2" data-bs-toggle="modal" data-bs-target="#modalPlayer">
            <i class="fa fa-user me-md-2"></i>
            <span class="d-none d-md-inline">Player</span>
          </small>
          <small class="float-end border-2 btn btn-sm btn-outline-secondary rounded-pill px-3 me-2" data-bs-toggle="modal" data-bs-target="#modalMap">
            <i class="fas fa-map me-md-2"></i>
            <span class="d-none d-md-inline">Map</span>
          </small>
          <small class="float-end border-2 btn btn-sm btn-outline-secondary rounded-pill px-3 me-2" data-bs-toggle="modal" data-bs-target="#modalBackPack">
            <i class="fas fa-box me-md-2"></i>
            <span class="d-none d-md-inline">Backpack</span>
          </small>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Help -->
  <div class="modal fade" id="modalHelp" tabindex="-1" aria-labelledby="modalHelpLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalHelpLabel"><i class="fa fa-info me-2"></i>How to Play</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-start">
          <h5>Attack Gauge</h5>
          <p>Both your enemy and you have an attack gauge that can be filled by drawing cards.</p>
          <AttackGauge 
          :current="7"
          :maximum="12"
          :biggestGauge="12"
          :standing="false"
          :bursted="false"
          className="danger"
          />
          <AttackGauge 
          :current="11"
          :maximum="12"
          :biggestGauge="12"
          :standing="false"
          :bursted="false"
          className="primary"
          />
          <p>At each turn, you can either <b class="px-2 py-1 bg-white rounded text-primary">Draw Card</b>, <b class="px-2 py-1 bg-white rounded text-primary">Stand</b> or use <b class="text-primary">Ability Cards</b></p>
          <p>If you chosse to draw a card, your draw a card from your cards deck and add its value to your attack gauge, then your turn is over.</p>
          <p>If you chosse to stand, your attack gauge is locked and you cant play until the end of the round.</p>
          <p>Using ability cards does not ends your turn, unless the card effect affects yours turn.</p>
          <hr>
          <h5>Round Results</h5>
          <p>When both you and your enemy stands, both gauges lock and the result is computed by subtrating 1 from both gauges until one of them reach 0.</p>
          <AttackGauge 
          :current="0"
          :maximum="12"
          :biggestGauge="12"
          :standing="true"
          :bursted="false"
          className="danger"
          />
          <AttackGauge 
          :current="4"
          :maximum="12"
          :biggestGauge="12"
          :standing="true"
          :bursted="false"
          className="primary"
          />
          <small><i class="text-muted">You can identify if the gauge is locked or not by the color of the value at the right, if its colored, then the gauge is locked.</i></small>
          <p></p>
          <p>After computing the difference between the gauges, the winner deals a number of attacks equals to the value in his gauge. There is a message at the end of the round to tell the results.</p>
          <div class="p-3 rounded border border-2 text-white rounded shadow h-100 mx-auto text-center mb-3" style="background-color:black">
            <b>Player</b> wins by <b>4</b>!
            <br><b class="text-warning"> 20 <i class="fas fa-crosshairs"></i><small>( 5 x 4 )</small> </b> damage dealt!
            <br><b class="text-info">+24 <i class="fas fa-fire"></i></b>
          </div>
          <p><small><i class="text-muted">The damage(20) is composed by the base damage(5) multiplied by the gauges difference(4).</i></small></p>
          <hr>
          <h5>Bursting</h5>
          <p>Whenever an attack gauge is overcharged, its owner instantly becomes bursted and stands, and the gauge value is set to the difference between the maximum and the current value.</p>
          
          <p class="text-center">
            Gauge is value is 9 and its maximum value is 12
          </p>
          <AttackGauge 
          :current="9"
          :maximum="12"
          :biggestGauge="12"
          :standing="false"
          :bursted="false"
          className="primary"
          />
          <p class="text-center">
            Card with value 5 is drawn.
          </p>
          <p class="text-center">
            <b><span class="text-primary">9</span> + 5 = <span class="text-warning">14</span></b>
            <i class="fa fa-arrow-right mx-3"></i>
            <b class="text-warning">Bursted! (14 > 12)</b>
            <i class="fa fa-arrow-right mx-3"></i>
            <b><span class="text-warning">14</span> - 12 = <span class="text-primary">2</span></b>
          </p>
          <AttackGauge 
          :current="2"
          :maximum="12"
          :biggestGauge="12"
          :standing="true"
          :bursted="true"
          className="primary"
          />
          <p><small><i class="text-muted">The gauge is set to the difference(2) between the maximum(12) and the overcharged value(14) and the owner stands, so it cant play until the end of the round.</i></small></p>
          <hr>
          <h5>Your Deck</h5>
          <p>Your deck is made of 4 cards of each integer between 1 and half of your gauge size.</p>
          <div class="row">
            <div class="col-1 text-center my-3" v-for="card, cardIndex in shuffledCards" :key="`player_card_${cardIndex}`">
              <span class="px-2 py-2 shadow-sm border rounded text-primary">{{card}}</span>
            </div>
          </div>
          <p><small><i class="text-muted">Your Current Deck.</i></small></p>
          <p>When you run out of cards, a new deck is shuffled for you.</p>
          <hr>
          <h5>Ability Cards list</h5>
          <div class="row g-3 pb-3 align-items-stretch">
            <AbilityCard
              :type="card.type"
              :target="card.target"
              :name="card.name"
              :cost="card.cost"
              :current="card.cost"
              :description="card.description"
              :image="card.image"
              v-for="card, cardIndex in abilityCards"
              :key="`card_${cardIndex}`"
              class="col-6 col-md-4"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Player -->
  <div class="modal fade" id="modalPlayer" tabindex="-1" aria-labelledby="modalPlayerLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalPlayerLabel"><i class="fa fa-user me-2"></i>Player</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-start">
          <h5>{{player.name}}<small class="text-muted ms-3">Lvl. {{player.level}}</small></h5>
          <ProgressBar 
            :current="player.exp.current"
            :maximum="player.exp.next"
            :animating="true"
            className="bg-primary"
            iconName="fa fa-arrow-up"
            :hideLabel="true"
            class="mb-3"
          />
          <h4>Atributes</h4>
          <div class="row container">
            <div class="col-6 text-start px-4">
              <i class="fas fa-heart me-3"></i>
              {{Math.round(player.life.current)}}<small>/{{Math.round(player.life.maximum)}}</small> 
            </div>
            <div class="col-6 text-start px-4">
              <i class="fas fa-fire me-3"></i>
              {{Math.round(player.energy.current)}}<small>/{{Math.round(player.energy.maximum)}}</small> 
            </div>
            <div class="col-6 text-start px-4">
              <i class="fas fa-crosshairs me-3"></i>
              {{Math.round(player.gauge.current)}}<small>/{{Math.round(player.gauge.maximum)}}</small> 
            </div>
            <div class="col-6 text-start px-4">
              <i class="fas fa-hand-rock me-3"></i>
              {{Math.round(player.damage)}}
            </div>
          </div>
          <h4>Cards</h4>
          <div class="container">
            <div class="row">
              <div class="col-1 text-center my-3" v-for="card, cardIndex in shuffledCards" :key="`player_card_${cardIndex}`">
                <span class="px-2 py-2 shadow-sm border rounded text-primary">{{card}}</span>
              </div>
            </div>
            <small class="text-muted"><i>The cards are not in the same order as in the current deck</i></small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Backpack -->
  <div class="modal fade" id="modalBackPack" tabindex="-1" aria-labelledby="modalBackPackLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalBackPackLabel"><i class="fa fa-box me-2"></i>Backpack</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-start">
          <h5>Equipments</h5>
          <p class="text-muted">No equipment found yet.</p>

          <h5>In the pile</h5>
          <div class="row g-3 pb-3 align-items-stretch" v-on:dragStart="console.log($event)">
            <AbilityCard
              :type="card.type"
              :target="card.target"
              :name="card.name"
              :cost="card.cost"
              :current="card.cost"
              :description="card.description"
              :image="card.image"
              v-for="card, cardIndex in player.abilityDeck"
              :key="`card_${cardIndex}`"
              class="col-6 col-md-4"
            />
          </div>

          <h5>Abilities</h5>
          <div class="row g-3 pb-3 align-items-stretch" v-on:dragStart="console.log($event)">
            <AbilityCard
              :type="card.type"
              :target="card.target"
              :name="card.name"
              :cost="card.cost"
              :current="card.cost"
              :description="card.description"
              :image="card.image"
              v-for="card, cardIndex in player.abilityDeckBase"
              :key="`card_${cardIndex}`"
              class="col-6 col-md-4"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Map -->
  <div class="modal fade" id="modalMap" tabindex="-1" aria-labelledby="modalMapLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalMapLabel"><i class="fa fa-map me-2"></i>Map</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-start">
          <button class="btn rounded bg-cover w-100 py-3 px-2 shadow mb-3" :style="`background-image:url(${require('@/assets/backgrounds/Cemetery.png')}); background-size: cover;`">
            <h5 class="text-white">Cemitery</h5>
          </button>
          <button class="btn rounded bg-cover w-100 py-3 px-2 shadow mb-3" :style="`background-image:url(${require('@/assets/backgrounds/Church.png')}); background-size: cover;filter:grayscale(1)`">
            <h5 class="text-white">Church</h5>
          </button>
          <button class="btn rounded bg-cover w-100 py-3 px-2 shadow mb-3" :style="`background-image:url(${require('@/assets/backgrounds/Forest.png')}); background-size: cover;filter:grayscale(1)`">
            <h5 class="text-white">Forest</h5>
          </button>
          <button class="btn rounded bg-cover w-100 py-3 px-2 shadow mb-3" :style="`background-image:url(${require('@/assets/backgrounds/Mansion.png')}); background-size: cover;filter:grayscale(1)`">
            <h5 class="text-white">Mansion</h5>
          </button>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProgressBar from './components/ProgressBar.vue';
import AttackGauge from './components/AttackGauge.vue';
import AbilityCard from './components/AbilityCard.vue';
import Battle from './assets/Battle.js';
import abilityCards from './assets/AbilityCard.json';

export default {
  name: "App",
  components: {
    ProgressBar,
    AttackGauge,
    AbilityCard
  },
  data: () => ({
    battle: Battle(),
    abilityCards,
    toast: {
      show: false,
      text: '',
      timeout: null
    },
  }),
  created: function() {
    this.player.cards.shuffle();
    this.player.drawAbilityCards();
    this.enemy.cards.shuffle();
    window.addEventListener('keydown', (e) => {
      if(this.player.status == 'drawing' && !this.animating){
        if(e.key == 'd' || e.key == 'D') {
          this.handlePlayerAction('drawCard');
        }
        if(e.key == 's' || e.key == 'S') {
          this.handlePlayerAction('stand');
        }
        if(e.key == 1) {
          this.handlePlayerAction('abilityCard', 0)
        }
        if(e.key == 2) {
          this.handlePlayerAction('abilityCard', 1)
        }
        if(e.key == 3) {
          this.handlePlayerAction('abilityCard', 2)
        }
        if(e.key == 4) {
          this.handlePlayerAction('abilityCard', 3)
        }
      }
    })
  },
  mounted() {
    let firstTime = !localStorage.getItem('firstTime');
    if(firstTime) {
      this.$refs.helpButton.click();
      localStorage.setItem('firstTime', true);
    }
    this.handlePlayerAction('',0,0);
  },
  computed: {
    shuffledCards() {
      let cards = [...this.player.cards];
      cards.shuffle();
      return cards;
    },
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

    handlePlayerAction(action, cardId=null) {
      this.battle.handlePlayerAction(action, this.showToast, cardId);
    },
  }
};

</script>

<style>
.fadeCards-enter-active,
.fadeCards-leave-active {
  transition: all 1s ease;
}
.fadeCards-enter-from,
.fadeCards-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
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
  .abilityCard-container {
    overflow-x: scroll;
    overflow-y: hidden;
  }
  .abilityCard-container .row{
    height: 100%;
    overflow-y: hidden;
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

.player-action:active {
  transform: none;
}

.monster-img {
  height: 230px;
  transform-origin: bottom;
  background-repeat: no-repeat;
  background-position-x: center;
  background-position-y: bottom;
}


.text-shadow {
  text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000;
}

.container {
  max-width: 690px;
}

.background {
  background-size:cover;-webkit-box-shadow: inset 5px 5px 50px 30px #000000; 
  border-radius: 100%;
  box-shadow: inset 5px 5px 50px 30px #000000;
  background-position:center;
  position: absolute;
  /* top: -10%;
  bottom: 30%;
  right: 30%;
  left: 30%; */
  top: 0;
  bottom: 50%;
  left: 0;
  right: 0;
  z-index: -1;
  filter:hue-rotate(45deg) brightness(0.5);
}

@media screen and (min-width: 700px) {
  .background {
    left: 30%;
    right: 30%;
    bottom: 30%;
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

.modal-content {
  background-color: #000000;
  color: white;
  border: 2px solid white;
}


</style>

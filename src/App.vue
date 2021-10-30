<template>
  <!-- Toast -->
  <div :class="`custom-toast container ${toast.show ? 'o-100' : 'o-0'}`">
    <div class="p-3 rounded bg-white shadow h-100 mx-auto" v-html="toast.text" />
  </div>
  <!-- Enemy -->
  <div class="container w-md-50 rounded-top"  :style="`background-image:url(${require('@/assets/background.jpg')});background-size:cover;-webkit-box-shadow: inset 5px 5px 50px 30px #000000; 
box-shadow: inset 5px 5px 50px 30px #000000;`">
    <!-- Enemy Card -->
    <div class="mb-3 px-2 px-md-0">
      <!-- Name -->
      <h5 class="text-white"><b>{{enemy.name}}</b> <small>Lvl. {{enemy.level}}</small></h5>
      <!-- Life -->
      <ProgressBar 
        :current="enemy.life.current"
        :maximum="enemy.life.maximum"
        :animating="animating"
        className="bg-danger"
        iconName="fas fa-heart"
        class="mb-3"
      />
      <!-- Energy -->
      <ProgressBar 
        :current="enemy.energy.current"
        :maximum="enemy.energy.maximum"
        :animating="animating"
        className="bg-info"
        iconName="fas fa-fire"
      />
    </div>
    <img class="mx-auto my-5 monster-img" :src="require(`@/assets/${enemy.image}`)" v-if="enemy.image">
  </div>
  <!-- Gauges -->
  <div class="container w-md-50">
    <!-- Enemy Gauge -->
    <div class="border g-1 pb-2 row mb-3 align-items-center py-1 px-2 bg-light rounded-pill">
      <div class="col" v-for="enemyGauge, enemyGaugeIndex in biggestGauge" :key="`enemyGauge${enemyGaugeIndex}`">
        <div :class="`rounded-pill border gauge border-2 ${enemy.gauge.current >= enemyGauge ? (enemy.status =='standing' ? 'bg-danger border-warning' : ' border-danger') : (enemy.isBursted ? 'bg-warning' : (enemyGauge > enemy.gauge.threshold ? (enemyGauge > enemy.gauge.maximum ? 'bg-light' : 'bg-secondary') : 'bg-dark '))}`" style="height:1rem;width:100%;">
        </div>
      </div>
      <div :class="`col-3 col-md-2 ${enemy.status == 'standing' ? 'text-danger' : 'text-secondary'}`">
        <i class="fas fa-crosshairs mx-1"></i> <b>{{enemy.gauge.current}}</b>
      </div>
    </div>
    <!-- Player Gauge -->
    <div class="border g-1 pb-2 row mb-3 align-items-center py-1 px-2 bg-light rounded-pill">
      <div class="col" v-for="playerGauge, playerGaugeIndex in biggestGauge" :key="`playerGauge${playerGaugeIndex}`">
        <div :class="`rounded-pill border gauge border-2 ${player.gauge.current >= playerGauge ? (player.status =='standing' ? 'bg-primary border-info' : 'border-primary') : player.isBursted ? 'bg-danger' : (playerGauge > player.gauge.maximum ? 'bg-light' : 'bg-dark')}`" style="height:1rem;width:100%;">
        </div>
      </div>
      <div :class="`col-3 col-md-2 ${player.status == 'standing' ? 'text-primary' : 'text-secondary'}`">
        <i class="fas fa-crosshairs mx-1"></i> <b>{{player.gauge.current}}</b>
      </div>
    </div>
  </div>
  <!-- Player -->
  <div class="container w-md-50">
    <!-- Energy Actions -->
    <div class="row mb-3 d-none">
      <div class="col">
        <button
        :class="`btn ${!(animating || player.status == 'standing') && player.energy.current >= 20 ? 'btn-success text-white shadow' : 'btn-secondary'} text-white w-100`"
        v-on:click="handlePlayerAction('life', 10, 20)"
        :disabled="(animating || player.status == 'standing') || player.energy.current < 20"
        >
          <b :class="`px-2 py-1 ${!(animating || player.status == 'standing') && player.energy.current >= 20 ? 'text-success' : 'text-muted'} bg-white me-2 rounded-pill`">
            +10 <i class="fas fa-heartbeat mx-1"></i>
          </b>
          <b>20</b> <i class="fas fa-fire"></i>
        </button>
      </div>
      <div class="col">
        <button
        :class="`btn ${!(animating || player.status == 'standing') && player.energy.current >= 10 ? 'btn-info text-white shadow' : 'btn-secondary'} text-white w-100`"
        v-on:click="handlePlayerAction('modifier', 2, 10)"
        :disabled="(animating || player.status == 'standing') || player.energy.current < 10"
        >
          <b :class="`px-2 py-1 ${!(animating || player.status == 'standing') && player.energy.current >= 10 ? 'text-info' : 'text-muted'} bg-white me-2 rounded-pill`">
            +2 <i class="fas fa-crosshairs mx-1"></i>
          </b>
          <b>10</b> <i class="fas fa-fire"></i>
        </button>
      </div>
      <div class="col">
        <button
        :class="`btn ${!(animating || player.status == 'standing') && player.energy.current >= 5 ? 'btn-info text-white shadow' : 'btn-secondary'} text-white w-100`"
        v-on:click="handlePlayerAction('modifier', Math.floor(1 + Math.random()*3), 5)"
        :disabled="(animating || player.status == 'standing') || player.energy.current < 5"
        >
          <b :class="`px-2 py-1 ${!(animating || player.status == 'standing') && player.energy.current >= 5 ? 'text-info' : 'text-muted'} bg-white me-2 rounded-pill`">
            +1/3 <i class="fas fa-crosshairs mx-1"></i>
          </b>
          <b>5</b> <i class="fas fa-fire"></i>
        </button>
      </div>
    </div>
    <!-- Player Card -->
    <div class="mb-3 px-2 px-md-0">
      <!-- Player -->
      <div class="text-start d-flex justify-content-between align-items-stretch mb-3">
        <h5 class="mb-0 text-white" style="align-self:center;">
          {{player.name}} 
          <small class="text-muted">Lvl. {{player.level}} - {{player.damage}} DMG</small>
        </h5>
        <small class="float-end btn btn-sm btn-outline-secondary rounded-pill">
          <i class="fa fa-info mx-2"></i>
          Help
        </small>
      </div>
      
      <div class="row">
        <div class="order-1 order-md-0 col-6 col-md-2 d-md-flex justify-content-center align-items-stretch flex-column">
          <button :class="`m-0 h-100 btn btn-light ${!(animating || player.status == 'standing') ? 'shadow' : ''} border w-100`" v-on:click="handlePlayerAction('drawCard')" :disabled="(animating || player.status == 'standing')">
            {{player.cards.length}}
            <i class="far fa-caret-square-up me-2"></i>
            <br>
            Draw Card
          </button>
        </div>
        <div class="order-0 order-md-1 col-12 col-md-8">
          <!-- Level -->
          <ProgressBar 
            :current="player.exp.current"
            :maximum="player.exp.next"
            :animating="true"
            className="bg-primary"
            iconName="fa fa-arrow-up"
            class="mb-3"
          />
          <!-- Life -->
          <ProgressBar 
            :current="player.life.current"
            :maximum="player.life.maximum"
            :animating="animating"
            className="bg-danger"
            iconName="fas fa-heartbeat"
            class="mb-3"
          />
          <!-- Energy -->
          <ProgressBar 
            :current="player.energy.current"
            :maximum="player.energy.maximum"
            :animating="animating"
            className="bg-info"
            iconName="fas fa-fire"
            class="mb-3"
          />
        </div>
        <div class="order-2 col-6 col-md-2 d-md-flex justify-content-center align-items-stretch flex-column">
          <!-- Player Actions -->
          <button :class="`m-0 h-100 btn btn-light ${!(animating || player.status == 'standing') ? 'shadow' : ''} border w-100`" v-on:click="handlePlayerAction('stand')" :disabled="(animating || player.status == 'standing')">
            <i class="far fa-caret-square-down me-2"></i>
            <br>
            Stand
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProgressBar from './components/ProgressBar.vue';
import enemies from './assets/enemies.json';

Array.prototype.shuffle = function() {
  for (var i = this.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = this[i];
      this[i] = this[j];
      this[j] = temp;
  }
}

const animationBuffer = 500;

const baseDeck = [
  1, 1, 1, 1,
  2, 2, 2, 2,
  3, 3, 3, 3,
  4, 4, 4, 4,
  5, 5, 5, 5,
  6, 6, 6, 6
]

const createEntity = (name, level, gaugeSize, life, energy, damage) => ({
  // Attributes
  name:       name,
  level:      level,
  cards:      [...baseDeck],
  status:     'drawing',
  isBursted:  false,
  damage:     damage,
  gauge: {
    current: 0,
    maximum: gaugeSize
  },
  life: {
    current: life,
    maximum: life
  },
  energy: {
    current: (energy/4).toFixed(),
    maximum: energy
  },
  // Methods
  isAlive: function() {
    return this.life.current > 0;
  },
  resetGauge: function() {
    this.gauge.current = 0;
  },
  addGauge: function(value) {
    this.gauge.current += value;
    if(this.gauge.threshold && this.gauge.current >= this.gauge.threshold) {
      this.status = 'standing';
    }
    if(this.gauge.current > this.gauge.maximum) {
      this.status         = 'standing';
      this.isBursted      = true;
      this.gauge.current  = Math.floor(this.gauge.maximum/2);
    }
    if(this.gauge.current == this.gauge.maximum) {
      this.status = 'standing';
    }
  },
  addLife: function(value) {
    this.life.current += value;
  },
  addEnergy: function(value) {
    this.energy.current += value;
    this.energy.current = this.energy.current >= this.energy.maximum ? this.energy.maximum : this.energy.current;
  },
  setStatus: function(status) {
    this.status = status;
  },
  drawCard: function() {
    let nextCard = this.cards.shift();
    this.addGauge(nextCard);
    if(this.cards.length == 0){
      this.cards = [...baseDeck];
      this.cards.shuffle();
    }
  },
  reset: function(resetLife = false) {
    this.resetGauge();
    this.status = 'drawing';
    this.isBursted = false;
    if(resetLife) {
      this.cards = [...baseDeck];
      this.cards.shuffle();
      this.life.current = this.life.maximum;
    }
  }
});

const ceatePlayer = (name, level, gaugeSize, life, energy, damage) => ({
  ...createEntity(name, level, gaugeSize, life, energy, damage),
  exp: {
    current: 0,
    next: 100
  },
  addExp: function (exp) {
    console.log('adding exp...');
    this.exp.current += exp;
    if(this.exp.current >= this.exp.next){
      this.level += 1;
      this.damage += 4;
      this.exp.current -= this.exp.next;
      this.exp.next += 35;  
    }
  },
});

const createEnemy = (name, level, gaugeSize, life, energy, damage, threshold, image, exp) => ({
  ...createEntity(name, level, gaugeSize, life, energy, damage),
  image:      image,
  exp:        exp,
  gauge: {
    current: 0,
    maximum: gaugeSize,
    threshold: threshold
  }
})

const randomEnemy = () => {
  let enemyId = Math.floor(Math.random()*enemies.length);
  let enemy = enemies[enemyId];
  return createEnemy(enemy.name, enemy.level, enemy.gaugeSize, enemy.life, enemy.energy, enemy.damage, enemy.threshold, enemy.image, enemy.exp);
}

const gaugeDifference = (player, enemy) => {
  if(player.isBursted){
    return {
      winner: enemy.name,
      diff: enemy.gauge.current/2
    };
  }
  if(enemy.isBursted) {
    return {
      winner: player.name,
      diff: player.gauge.current/2
    };
  }
  if(player.gauge.current == enemy.gauge.current) {
    return {
      winner: 'draft',
      diff: 0
    }
  }
  return {
    winner: player.gauge.current > enemy.gauge.current ? player.name : enemy.name,
    diff: Math.abs(player.gauge.current - enemy.gauge.current)
  };
}

export default {
  name: "App",
  components: {
    ProgressBar
  },
  data: () => ({
    player:     ceatePlayer('Tidus', 1, 12, 50, 50, 5),
    enemy:      randomEnemy(),
    toast: {
      show: false,
      text: '',
      timeout: null
    },
    animating:  false,
  }),
  created: function() {
    this.player.cards.shuffle();
    this.enemy.cards.shuffle();
  },
  computed: {
    biggestGauge() {
      return this.player.gauge.maximum > this.enemy.gauge.maximum ? this.player.gauge.maximum : this.enemy.gauge.maximum;
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

    reset() {
      this.player.reset(!this.player.isAlive());
      if(!this.enemy.isAlive()) {
        this.player.addExp(this.enemy.exp);
        this.enemy = randomEnemy();
      }else{
        this.enemy.reset();
      }
      //Checking if any one died
      this.animating = false;
    },

    checkResult() {
      // Getting result
      let result = gaugeDifference(this.player, this.enemy);
      let playerWins = result.winner == this.player.name;
      // Applying damage to entities
      this.enemy.addLife(playerWins ?  -(result.diff * this.player.damage) : 0);
      this.player.addLife(!playerWins ?  -(result.diff * this.enemy.damage) : 0);
      // Adding energy to entitites
      this.enemy.addEnergy(!playerWins ? result.diff*6 : (result.winner == 'draft' ? 3 : 0));
      this.player.addEnergy(playerWins ? result.diff*6 : (result.winner == 'draft' ? 3 : 0));
      // Showing result
      let energy = playerWins ? `<b class="text-info">${result.diff*6} <i class="fas fa-fire"></i> energy</b> gained` : '';
      let damage = `${result.diff * ( playerWins ? this.player.damage : this.enemy.damage )} <i class="fas fa-crosshairs"></i> <small>(${result.diff}x${playerWins ? this.player.damage : this.enemy.damage})</small>`;
      this.showToast(
        result.winner != 'draft' ?
        `<b>${result.winner}</b> wins! <b class="text-primary">${damage} damage</b> dealt! ${energy}`
        :
        `Draft! <b class="text-info">3 <i class="fas fa-fire"></i> energy</b> gained`
      );
      // Reseting entities gauge
      setTimeout(this.reset, 1750)
    },

    checkStatus() {
      // Check if its time to check the results
      console.log(`Checking status: player - ${this.player.status} | enemy - ${this.enemy.status}`);
      let bursted = this.player.isBursted || this.enemy.isBursted;
      if(bursted || (this.player.status == 'standing' && this.enemy.status == 'standing')){
        this.animating = true;
        setTimeout(this.checkResult, animationBuffer);
      }
    },

    // Returns if enemy shall play next
    playerTurn(action, modifier, cost) {
      switch(action) {
        // Draw a card
        case 'drawCard':
          this.player.drawCard();
          return true;
        // Use gauge modifier
        case 'modifier':
          if(this.player.energy.current >= cost) {
            this.player.energy.current -= cost;
            this.player.addGauge(modifier);
          }
          return this.player.status == 'standing';
        // Use life modifier
        case 'life' :
          if(this.player.energy.current >= cost) {
            this.player.energy.current -= cost;
            this.player.addLife(modifier);
          }
          return false;
        // Stand
        case 'stand':
          this.player.setStatus('standing');
          return true;
      }
    },

    enemyTurn() {
      // If enemy is not 'standing'
      if(!this.player.isBursted && this.enemy.status == 'drawing'){
        this.enemy.drawCard()
        if(this.player.status == 'standing' && this.enemy.status == 'drawing') {
          setTimeout(this.enemyTurn, animationBuffer);
        }
        // Enemy draw cards while is 'drawing'
      }
      this.animating = false;
      // Checking the result
      this.checkStatus();
    },

    
    handlePlayerAction(action, modifier, cost) {
      // Executing player turn
      let enemyNext = this.playerTurn(action, modifier, cost);
      // Executing enemy turn
      if(enemyNext){
        this.animating = true;
        setTimeout(this.enemyTurn, animationBuffer);
      }else{
        this.checkStatus();
      }
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

.custom-toast {
  position: fixed;
  top: 3%;
  left: 50%;
  z-index: 99;
  transform: translateX(-50%);
  transition: all 125ms ease-in-out;
}

.o-0 {
  opacity: 0;
  pointer-events: none;
}

.o-100 {
  opacity: 100;
}

.monster-img {
  -webkit-box-shadow: 2px 50px 32px -30px rgba(0,0,0,0.65); 
box-shadow: 2px 50px 32px -30px rgba(0,0,0,0.65);
max-height:250px
}
@media screen and (max-width:410px) {
  .monster-img {
    max-height: 125px;
  }
}

.text-white {
  filter: drop-shadow(2px 4px 6px black);
}

.container {
  max-width: 690px;
}
</style>

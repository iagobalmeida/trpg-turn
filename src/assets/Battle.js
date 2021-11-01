import enemies from './enemies.json';
import habilityCards from './habilityCards.json';

Array.prototype.shuffle = function() {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
}

const baseDeck = (gaugeSize) => {
    let deck = new Array(gaugeSize * 2);
    for(let i = 0; i < gaugeSize/2; i++) {
        deck.fill(i+1, i*4, i*4+4);
    }
    return deck;
}

const createEntity = (name, level, gaugeSize, life, energy, damage) => ({
    // Attributes
    name:       name,
    level:      level,
    cards:      [...baseDeck(gaugeSize)],
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
        this.life.current = this.life.current >= this.life.maximum ? this.life.maximum : this.life.current;
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
        this.cards = [...baseDeck(this.gauge.maximum)];
        this.cards.shuffle();
        }
    },
    reset: function(resetLife = false) {
        this.resetGauge();
        this.status = 'drawing';
        this.isBursted = false;
        if(resetLife) {
        this.cards = [...baseDeck(this.gauge.maximum)];
        this.cards.shuffle();
        this.life.current = this.life.maximum;
        }
    }
});

const createPlayer = (name, level, gaugeSize, life, energy, damage) => ({
    ...createEntity(name, level, gaugeSize, life, energy, damage),
    habilityCards: habilityCards,
    exp: {
        current: 0,
        next: 100
    },
    addExp: function (exp) {
        this.exp.current += exp;
        if(this.exp.current >= this.exp.next){
        this.level += 1;
        this.damage += 4;
        this.life.maximum = Math.ceil(this.life.maximum * 1.3);
        this.life.current = this.life.maximum;
        this.energy.maximum = Math.ceil(this.energy.maximum * 1.05);
        this.energy.current = this.energy.maximum;
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

const animationBuffer = 500;

const Battle = () => ({
    player:     createPlayer('Tidus', 1, 12, 50, 50, 5),
    enemy:      randomEnemy(),
    animating:  false,
    // Handle player input
    handlePlayerAction: function (action, modifier, cost, toastFunction) {
        this.toastFunction = toastFunction;
        // Executing player turn
        let enemyNext = this.playerTurn(action, modifier, cost);
        // Executing enemy turn
        if(enemyNext){
            this.animating = true;
            setTimeout(() => {this.enemyTurn()}, animationBuffer);
        }else{
            this.checkStatus();
        }
    },
    // Player Turn
    playerTurn: function (action, modifier, cost) {
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
    // Enemy Turn
    enemyTurn: function() {
        // If enemy is not 'standing'
        if(!this.player.isBursted && this.enemy.status == 'drawing'){
            this.enemy.drawCard()
            if(this.player.status == 'standing' && this.enemy.status == 'drawing') {
            setTimeout(() => {this.enemyTurn()}, animationBuffer);
            }
            // Enemy draw cards while is 'drawing'
        }
        this.animating = false;
        // Checking the result
        this.checkStatus();
    },
    // Check Status
    checkStatus: function () {
        // Check if its time to check the results
        let bursted = this.player.isBursted || this.enemy.isBursted;
        if(bursted || (this.player.status == 'standing' && this.enemy.status == 'standing')){
            this.animating = true;
            setTimeout(()=>{this.checkResults()}, animationBuffer);
        }
    },
    // Check Results
    checkResults: function () {
        // Getting result
        let result = gaugeDifference(this.player, this.enemy);
        let playerWins = result.winner == this.player.name;
        // Applying damage to entities
        this.enemy.addLife(playerWins   ?  -(result.diff * this.player.damage) : 0);
        this.player.addLife(!playerWins ?  -(result.diff * this.enemy.damage)  : 0);
        // Adding energy to entitites
        let enemyEnergy  = !playerWins ? (result.diff * (this.enemy.energy.maximum * 0.1))  : (result.winner == 'draft' ? (this.enemy.energy.maximum * 0.1) : 0);
        let playerEnergy = playerWins  ? (result.diff * (this.player.energy.maximum * 0.1)) : (result.winner == 'draft' ? (this.player.energy.maximum * 0.1) : 0);
        this.enemy.addEnergy(enemyEnergy);
        this.player.addEnergy(playerEnergy);
        // this.enemy.addEnergy(!playerWins ? result.diff* (this.enemy.energy.maximum * 0.02).toFixed(1) : (result.winner == 'draft' ? (this.enemy.energy.maximum * 0.01).toFixed(1) : 0));
        // this.player.addEnergy(playerWins ? result.diff* (this.player.energy.maximum * 0.02).toFixed(1) : (result.winner == 'draft' ? (this.player.energy.maximum * 0.01).toFixed(1) : 0));
        // Showing result
        let energy = `<b class="text-info">${playerEnergy.toFixed(2)} <i class="fas fa-fire"></i> energy</b> gained`;
        let damage = `${(result.diff * ( playerWins ? this.player.damage : this.enemy.damage).toFixed(2) )} <i class="fas fa-crosshairs"></i> <small>(${result.diff}x${playerWins ? this.player.damage : this.enemy.damage})</small>`;
        this.toastFunction(
            result.winner != 'draft' ?
            `<b>${result.winner}</b> wins!<br><b class="text-primary">${damage} damage</b> dealt!<br>${energy}`
            :
            `<b>Draft!</b><br>${energy}`
        );
        // Reseting entities gauge
        setTimeout(()=>{this.reset()}, 1750)
    },
    // Reset
    reset: function() {
        if(!this.player.isAlive()){
            this.player.reset(true);
            this.enemy = randomEnemy();
        }else{
            this.player.reset(false);
        }
        if(!this.enemy.isAlive()) {
            this.player.addExp(this.enemy.exp);
            this.enemy = randomEnemy();
        }else{
            this.enemy.reset();
        }
        //Checking if any one died
        this.animating = false;
    }
});

export default Battle;
import enemies from './enemies.json';
import abilityCards from './AbilityCard.json';
import Status from './StatusEffects';
const APPLIANCES = {
    START:  'TURN_START',
    END:    'TURN_END',
}

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
    name:           name,
    level:          level,
    cards:          [...baseDeck(gaugeSize)],
    abilityCards:   [abilityCards[28],abilityCards[36],abilityCards[0],abilityCards[10]],
    status:         'drawing',
    statusEffects:  [],
    isBursted:      false,
    damage:         damage,
    gauge: {
        current: 0,
        maximum: gaugeSize
    },
    life: {
        current: life,
        maximum: life
    },
    energy: {
        current: Math.round(energy/4),
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
        // let pre = this.energy.current;
        this.energy.current = parseFloat(this.energy.current) + value;
        this.energy.current = this.energy.current >= this.energy.maximum ? this.energy.maximum : this.energy.current;
        // console.table({
        //     'pre': pre,
        //     'value': value,
        //     'current': this.energy.current,
        // });
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
    addStatusEffect: function(statusName, turns, modifier) {
        let statusEffect = Status[statusName](turns, modifier);
        if(statusEffect.appliance == 'INSTANT') {
            statusEffect.apply(this);
        }else{
            this.statusEffects.push(statusEffect);
        }
    },
    apllyStatusEffect: function(appliance) {
        let dels = [];
        this.statusEffects.forEach((status, index) => {
            if(status.appliance == appliance) {
                let rem = status.apply(this);
                if(rem){
                    dels.push(index);
                } 
            }
        });
        dels.forEach((id) => {
            this.statusEffects.splice(id, 1);
        })
    },
    useAbilityCard: function(cardIndex, oponnent) {
        let card = this.abilityCards[cardIndex];
        if(this.energy.current >= card.cost){
            this.energy.current -= card.cost;
            let rand = Math.random();
            switch(card.type) {
                case 'gaugeDefined':
                    this.addGauge(card.modifier);
                break;
                case 'gaugeChoose':
                    this.addGauge(rand >= 0.5 ? card.max : card.min);
                break;
                case 'life':
                    this.addLife(card.modifier);
                break;
                case 'lifePercentage':
                    this.addLife(this.life.current * card.modifier/100);
                break;
                case 'energy':
                    this.addEnergy(card.modifier);
                break;
                case 'statusEffect':
                    switch(card.target) {
                        case 'self':
                            this.addStatusEffect(card.statusName, card.turns || 1, card.modifier || 0);
                        break;
                        case 'enemy':
                            oponnent.addStatusEffect(card.statusName, card.turns || 1, card.modifier || 0);
                        break;
                    }
                break;
            }
        }
        this.abilityCards.splice(cardIndex, 1);
        if(this.abilityCards.length == 0){
            this.abilityCards = [abilityCards[28],abilityCards[36],abilityCards[0],abilityCards[10]];
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

const loadStoragePlayer = () => {
    let storagePlayer = localStorage.getItem('player');
    if(storagePlayer) {
        let playerData = JSON.parse(storagePlayer);
        return { ...createPlayer('Tidus', 1, 12, 50, 50, 5), ...playerData, abilityCards: [abilityCards[28],abilityCards[36],abilityCards[0],abilityCards[10]]};
    }else{
        return createPlayer('Tidus', 1, 12, 50, 50, 5);
    }
}

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
    // Bursted cases
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
    // Aplly Player END status effects
    player.apllyStatusEffect(APPLIANCES.END);
    enemy.apllyStatusEffect(APPLIANCES.END);
    // Compare gauges
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
    createEntity,
    createPlayer,
    createEnemy,
    randomEnemy,
    gaugeDifference,
    loadStoragePlayer
}
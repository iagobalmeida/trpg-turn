import enemies from './enemies.json';
import abilityCards from './AbilityCard.json';
import Status from './StatusEffects';
const APPLIANCES = {
    START: 'TURN_START',
    END: 'TURN_END',
}

const sleep = (factor) => {
    return new Promise(resolve => setTimeout(resolve, 125*factor));
}

Array.prototype.shuffle = function () {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
}

const altValue = (value, alt) => (value ? value : alt);

const createGauge = (current, maximum) => ({
    current,
    maximum,
    add: function (value) {
        this.current = Math.min(this.maximum, ParseFloat(this.current+value));
        return this.current == this.maximum;
    }
})

const createEntity = ({ name, type, level, gaugeSize, life, energy, damage, gold, abilityCards } = {}) => {
    // Setting default values
    let level       = altValue(level, 1);
    let life        = altValue(life, 50);
    let energy      = altValue(energy, 30);
    let gaugeSize   = altValue(gaugeSize, 6);
    let baseAttackDeck = createAttackDeck(altValue(gaugeSize, 6));
    let baseAbilityDeck = createAbilityDeck(altValue(abilityCards, [0, 1, 2, 3]));
    // Factory
    return {
        // Basic Info
        name: altValue(name, 'Unknown'),
        type: altValue(type, 'Enemy'),
        gold: altValue(gold, 10),
        // Entity Cards
        attackCards: {
            base:       [...baseAttackDeck],
            current:    [...baseAttackDeck]
        },
        // Ability Cards
        abilityCards: {
            base:       [...baseAbilityDeck],
            hand:       [...baseAbilityDeck.splice(0, 4)],
            current:    [...baseAbilityDeck],
        },
        // Entity Attributes
        level:  altValue(level, 1),
        damage: altValue(damage, 10),
        // Entity Gauges
        exp:    createGauge((level-1)*0, level*100),
        life:   createGauge(life, life),
        energy: createGauge(energy, energy),
        attack: {
         ...createGauge(0, gaugeSize),
         add: async function (value) {
            this.current += value;
            return this.current >= this.maximum;
         }
        },
        // Status
        isStanding: false,
        isBursted: false,
        isBlind: false,
        isUnbalanced: false,
        // Computed properties
        compIsAlive: function () { return this.life.current > 0 },
        compShallStand: function() { return this.gauge.treshold > -1 ? (this.gauge.current >= this.gauge.treshold) : false },
        // Logging
        log: function () { console.log(JSON.stringify(this, null, 2)); },
        addAttack: function (value) {
            let target = this.current + value;
            while(this.current < target){
                let burst = this.attack.add(1);
                if(burst) {
                    target = this.current - this.maximum;
                    this.isBursted = true;
                    this.isStanding = true;
                    this.current = 0;
                }
                this.isStanding = this.compShallStand() || this.current == this.maximum;
                await sleep(1);
            }
            await sleep(2);
        }
        // Methods
    }
};

const baseDeck = (gaugeSize) => {
    let minimum = Math.floor(gaugeSize / 2 - 5);
    console.log('\ngaugeSize', gaugeSize);
    console.log('minimum', minimum);

    let deck = new Array(24);
    for (let i = 0; i <= 24; i++) {
        deck.fill(minimum + i, i * 4, i * 4 + 4);
    }
    return deck;
}

const baseAbilityDeck = (shuffle = true) => {
    let ret = [
        abilityCards[0], abilityCards[0], abilityCards[0],
        abilityCards[6], abilityCards[7], abilityCards[10],
        abilityCards[9], abilityCards[11], abilityCards[12],
        abilityCards[29], abilityCards[38]
    ]
    if (shuffle) { ret.shuffle(); }
    return ret;
}

const gaugeDifference = async (player, enemy) => {
    // Aplly Player END status effects
    player.apllyStatusEffect(APPLIANCES.END);
    enemy.apllyStatusEffect(APPLIANCES.END);
    while (player.gauge.current > 0 && enemy.gauge.current > 0) {
        player.gauge.current -= 1;
        enemy.gauge.current -= 1;
        await sleep(150);
    }
    await sleep(500);
    // Bursted situations
    player.gauge.current = player.isBursted && player.gauge.current > 0 ? 0 : player.gauge.current;
    enemy.gauge.current = enemy.isBursted && enemy.gauge.current > 0 ? 0 : enemy.gauge.current;
    // Compare gauges
    if (player.gauge.current == enemy.gauge.current) {
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
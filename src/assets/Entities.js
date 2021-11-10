import enemies from './enemies.json';
import abilityCardsList from './AbilityCard.json';
import Status from './StatusEffects';

const startingAbilityCards = [38,38,6,7,13,29,38,0,0,1];

const sleep = (factor) => { return new Promise(resolve => setTimeout(resolve, 125 * factor)); }

Array.prototype.shuffle = function () {
    this.every((item, curr) => {
        let rand = Math.floor(Math.random() * this.length);
        this[curr] = this[rand];
        this[rand] = item;
    });
}

const createAttackDeck = (gaugeSize) => {
    let minimum = Math.max(1, Math.floor(gaugeSize / 2 - 5));
    let deck = new Array(minimum*4*4);
    for (let i = 0; i <= (minimum)*4; i++) {
        deck.fill(Math.min(minimum + i, gaugeSize/2), i * 4, i * 4 + 4);
    }
    deck.shuffle();
    return deck;
}

const createAbilityDeck = (abilityCards) => {
    let deck = [];
    for(let i = 0; i < abilityCards.length; i++){
        let card = { ...abilityCardsList[abilityCards[i]] };
        deck.push(card);
    }
    deck.shuffle();
    return deck;
}

const createGauge = (current, maximum, addHandler = null) => ({
    current,
    maximum,
    percentage: function () {
        return (this.current / this.maximum) * 100;
    },
    add: addHandler || function (value) {
        this.current = Math.min(this.maximum, this.current + parseFloat(value));
        this.current = Math.max(this.current, 0);
        return this.current == this.maximum;
    },
    addPercentage: function (value) {
        return this.add(this.maximum * value / 100)
    }
})

const createEntity = ({ name, type, level, gaugeSize, threshold, life, energy, damage, gold, abilityCards } = {}) => {
    // Setting default values
    const altValue = (value, alt) => (value ? value : alt);
    name = altValue(name, 'Unknown');
    type = altValue(type, 'Enemy');
    level = altValue(level, 1);
    gold = altValue(gold, 10);
    life = altValue(life, 50);
    energy = altValue(energy, 30);
    gaugeSize = altValue(gaugeSize, 6);
    let baseAttackDeck = createAttackDeck(altValue(gaugeSize, 6));
    let baseAbilityDeck = createAbilityDeck(altValue(abilityCards, startingAbilityCards));
    // Factory
    return {
        // Logging
        log: function () { console.log(JSON.stringify(this, null, 2)); },
        getData: function () {
            return {
                name,
                type,
                gold,
                level,
                life,
                energy,
                gaugeSize,
                baseAttackDeck,
                baseAbilityDeck
            }
        },
        // Basic Info
        name,
        type,
        gold,
        discardCost: 6,
        // Entity Attributes
        level: altValue(level, 1),
        damage: altValue(damage, 10),
        // Status
        isStanding: false,
        isBursted: false,
        isBlind: false,
        isUnbalanced: false,
        statusEffects: {
            start:    [],
            end:      [],
            add: function(target, statusName, turns = 1, modifier = 0) {
                let status = Status[statusName](turns, modifier);
                if(status.moment == 'instant') {
                    status.apply(target);
                }else{
                    this[status.moment].push(status);
                }
            },
            apply: function(moment, target) {
                this[moment].every((statusEffect) => {
                    statusEffect.apply(target);
                });
            },
            reset: function() {
                this.start = [];
                this.end = [];
            }
        },
        // Entity Cards
        attackCards: {
            base: [...baseAttackDeck],
            current: [...baseAttackDeck],
            draw: async function () {
                let randomCard = this.current.splice(Math.floor(this.current.length * Math.random()), 1);
                if (this.current.length == 0) this.redraw();
                return randomCard;
            },
            redraw: async function () {
                this.current = [...this.base];
            }
        },
        // Ability Cards
        abilityCards: {
            base: [...baseAbilityDeck],
            hand: [...(baseAbilityDeck.splice(0, 4))],
            current: [...baseAbilityDeck],
            draw: async function () {
                for(let cardIndex in this.hand){
                    let card = this.hand[cardIndex];
                    if(card.discarted){
                        let randomIndex = Math.floor(this.current.length * Math.random());
                        let randomCard = this.current.splice(randomIndex, 1)[0];
                        this.hand[cardIndex] = randomCard;
                        this.hand[cardIndex].discarted = false;
                        if (this.current.length == 0) this.current = [...this.base];
                        await sleep(2);
                    }
                }
                return;
            },
            discard: async function (index) {
                this.hand[index].discarted = true;
                await sleep(3);
                await this.draw();
            }
        },
        // Entity Gauges
        exp: createGauge((level - 1) * 0, level * 100),
        life: createGauge(life, life),
        energy: createGauge(energy, energy),
        attack: createGauge(0, gaugeSize, function (value) {
            this.current += value;
            this.current = Math.max(this.current, 0);
            return this.current > this.maximum;
        }),
        threshold,
        // Computed properties
        compIsAlive: function () { return this.life.current > 0 },
        compShallStand: function () { return this.threshold > -1 && this.attack.current >= this.threshold },
        compAllStatusEffects: function () { return [...this.statusEffects.start, ...this.statusEffects.end] ;},
        // Methods
        reset: async function (dead = false) {
            this.discardCost    = 6;
            this.attack.current = 0;
            this.isStanding     = false;
            this.isBursted      = false;
            if (dead) {
                await this.attackCards.redraw();
                this.life.current = this.life.maximum;
                this.energy.current = Math.floor(this.energy.maximum*0.3);
                this.statusEffects.reset();
            }else{
                this.statusEffects.apply('start', this);
            }
        },
        addAttack: async function (value) {
            let target = this.attack.current + parseInt(value);
            while (this.attack.current < target) {
                if (this.attack.add(1)) {
                    target = this.attack.current - this.attack.maximum;
                    this.isBursted = true;
                    this.isStanding = true;
                    this.attack.current = 0;
                }
                this.isStanding = this.compShallStand() || this.attack.current == this.attack.maximum || this.isBursted;
                await sleep(1);
            }
            await sleep(2);
            return;
        },
        drawAttackCard: async function () {
            let nextCard = await this.attackCards.draw();
            await this.addAttack(nextCard);
        },
        useAbilityCard: async function (index, oponnent) {
            let card = this.abilityCards.hand[index];
            if (this.energy.current >= card.cost) {
                this.energy.current -= card.cost;
                switch (card.type) {
                    case 'gaugeDefined':
                        await this.addAttack(card.modifier);
                        break;
                    case 'gaugeChoose':
                        await this.addAttack(Math.random() >= 0.5 ? card.max : card.min);
                        break;
                    case 'life':
                        await this.life.add(card.modifier);
                        break;
                    case 'lifePercentage':
                        await this.life.addPercentage(card.modifier)
                        break;
                    case 'energy':
                        await this.energy.add(card.modifier);
                        break;
                    case 'energyPercentage':
                        await this.energy.addPercentage(card.modifier);
                        break;
                    case 'statusEffect':
                        switch (card.target) {
                            case 'self':
                                await this.statusEffects.add(this, card.statusName, card.turns, card.modifier);
                                break;
                            case 'enemy':
                                oponnent.statusEffects.add(oponnent, card.statusName, card.turns, card.modifier);
                                break;
                        }
                        break;
                }
                await this.abilityCards.discard(index);
            }
            return this.isStanding;
        },
        discardAbilityCard: async function (index) {
            if (this.energy.current >= this.discardCost) {
                this.energy.current -= this.discardCost;
                await this.abilityCards.discard(index);
                this.discardCost = Math.floor(this.discardCost*1.5);
            }
        },
        addExp: async function(value) {
            if(this.exp.add(value)) {
                this.exp.current -= this.exp.maximum;
                this.exp.maximum *= 1.2;
                this.level += 1;
                this.damage += 1;
                this.life.maximum *= 1.2;
                this.life.current = this.life.maximum;
                this.energy.maximum *= 1.1;
                this.energy.current = this.energy.maximum;
                this.attack.maximum = 6 + Math.floor(this.level/10);
            }
        }
    }
};

const loadStoragePlayer = (load = true) => {
    let storageDataJSON = localStorage.getItem('player');
    let storageData = load && storageDataJSON ? JSON.parse(storageDataJSON) : null;
    return createEntity(storageData || { name: 'Player', type: 'player' });
}

const randomEnemy = () => {
    let enemy = enemies[Math.floor(Math.random() * enemies.length)];
    return { ...createEntity(enemy), image: enemy.image, size: enemy.size };
}

const gaugeDifference = async (player, enemy) => {
    // Aplly Player END status effects]
    player.statusEffects.apply('end', player);
    enemy.statusEffects.apply('end', enemy);

    while (player.attack.current > 0 && enemy.attack.current > 0) {
        player.attack.current -= 1;
        enemy.attack.current -= 1;
        await sleep(1);
    }
    await sleep(3);
    // Compare gauges
    if (player.attack.current == enemy.attack.current)  return { winner: 'draft', diff: 0 }
    return {
        winner: player.attack.current > enemy.attack.current ? player.name : enemy.name,
        diff:   Math.abs(player.attack.current - enemy.attack.current)
    };
}

export default {
    randomEnemy,
    gaugeDifference,
    loadStoragePlayer
}
import Entities from './Entities';

const sleep = (factor) => { return new Promise(resolve => setTimeout(resolve, 125 * factor)); }

const Battle = () => ({
    player:     Entities.loadStoragePlayer(false),
    enemy:      Entities.randomEnemy(),
    animating:  false,
    // Handle player input
    handlePlayerAction: async function (action, toastFunction, cardIndex=null) {
        if(!this.animating){
            this.animating = true;
            this.toastFunction = toastFunction;
            // If after playerAction the enemy might play
            if(await this.playerAction(action, cardIndex)){
                await this.enemyTurn();
            }else{
                this.checkStatus();
            }
            this.animating = false;
        }
    },
    // Player Turn
    playerAction: async function (action, cardIndex=null) {
        switch(action) {
            // Draw a card
            case 'drawCard':
                await this.player.drawAttackCard();
                return true;
            // Use abilityCard
            case 'abilityCard':
                await this.player.useAbilityCard(cardIndex, this.enemy);
                return this.player.isStanding;
            case 'discardCard':
                await this.player.discardAbilityCard(cardIndex);
                return false;
            case 'stand':
                this.player.isStanding = true;
                return true;
        }
    },
    // Enemy Turn
    enemyTurn: async function() {
        // If enemy is not 'standing'
        if(!this.enemy.isStanding){
            await this.enemy.drawAttackCard()
            if(this.player.isStanding && !this.enemy.isBursted) {
                await sleep(2);
                await this.enemyTurn();
            }
        }
        // Checking the result
        await this.checkStatus();
    },
    // Check Status
    checkStatus: async function () {
        // Check if its time to check the results
        if((this.player.isStanding && this.enemy.isStanding)){
            await this.checkResults();
        }
    },
    // Check Results
    checkResults: async function () {
        // Getting result
        let result = await Entities.gaugeDifference(this.player, this.enemy);
        let playerWins = result.winner == this.player.name;
        // let playerEnergy = (playerWins ? result.diff : 1) * this.player.energy.maximum/10;
        // let energyText = `<b class="text-info">+${playerEnergy.toFixed(2)} <i class="fas fa-fire"></i></b>`;
        // let damageText = `${(result.diff * ( playerWins ? this.player.damage : this.enemy.damage).toFixed(2) )} <i class="fas fa-crosshairs"></i> <small>( ${result.diff} x ${playerWins ? this.player.damage : this.enemy.damage} )</small>`;
        // let toastText = result.winner !=  'draft' ?
        // `<b>${result.winner}</b> venceu por <b>${result.diff}</b>!<br><b class="text-warning">${damageText} </b> de dano causado!<br>${energyText}`
        // :
        // `<b>Empate!</b><br>${energyText}`;
        // Applying damage to entities
        if(result.diff == 0){
            this.player.energy.addPercentage(10);
            this.enemy.energy.addPercentage(10);
        }else{
            while(result.diff > 0) {
                this.player.life.add(!playerWins ?  -(this.enemy.damage)  : 0);
                this.player.energy.addPercentage(playerWins ? 10 : 0);
                this.player.attack.add(-1);
                this.enemy.life.add(playerWins   ?  -(this.player.damage) : 0);
                this.enemy.energy.addPercentage(!playerWins ? 10 : 0);
                this.enemy.attack.add(-1);
                result.diff -= 1;
                await sleep(2.5);
            }
        }
        await sleep(5);
        // this.toastFunction(toastText);
        if(!this.enemy.compIsAlive()) {
            await sleep(3.2);
            this.enemy.image = 'Loot.png';
            await sleep(3.2);
        }
        // Reseting entities gauge
        await this.reset();
    },
    // Reset
    reset: async function() {
        this.player.discardCost = 6;

        // If player is dead, hard reset and change enemy ELSE soft reset
        if(!this.player.compIsAlive()){
            this.player.reset(true);
            this.toastFunction(
                `<b>Jogador morreu!</b>`
            );
            await sleep(20);
            this.enemy.image = null;
            await sleep(2);
            this.enemy = Entities.randomEnemy();
        }else{
            this.player.reset(false);
        }

        // If enemy is dead, addExp and change enemy ELSE enemy soft reset
        if(!this.enemy.compIsAlive()) {
            this.player.addExp(this.enemy.exp.maximum);
            this.toastFunction(
                `<b>${this.enemy.name} morreu!</b><br><b class="text-warning">+${this.enemy.gold} <i class="fa fa-coins"></i></b>`
            );
            await sleep(20);
            this.enemy.image = null;
            await sleep(2);
            this.enemy = Entities.randomEnemy();
        }else{
            this.enemy.reset();
        }

        // Save localData
        localStorage.setItem('player', JSON.stringify(this.player.getData()));
        
        // Enable input
        this.animating = false;
    }
});

export default Battle;
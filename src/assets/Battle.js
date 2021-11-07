import Entities from './Entities';

const sleep = (factor) => { return new Promise(resolve => setTimeout(resolve, 125 * factor)); }

const Battle = () => ({
    player:     Entities.loadStoragePlayer(),
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
        // Applying damage to entities
        this.enemy.life.add(playerWins   ?  -(result.diff * this.player.damage) : 0);
        this.player.life.add(!playerWins ?  -(result.diff * this.enemy.damage)  : 0);
        // Adding energy to entitites
        let enemyEnergy  = !playerWins ? (result.diff * (this.enemy.energy.maximum/10))  : (result.winner == 'draft' ? (this.enemy.energy.maximum/10) : 0);
        let playerEnergy = playerWins  ? (result.diff * (this.player.energy.maximum/10)) : (result.winner == 'draft' ? (this.player.energy.maximum/10) : 0);
        this.enemy.energy.add(enemyEnergy);
        this.player.energy.add(playerEnergy);
        // Showing result
        let energy = `<b class="text-info">+${playerEnergy.toFixed(2)} <i class="fas fa-fire"></i></b>`;
        let damage = `${(result.diff * ( playerWins ? this.player.damage : this.enemy.damage).toFixed(2) )} <i class="fas fa-crosshairs"></i> <small>( ${result.diff} x ${playerWins ? this.player.damage : this.enemy.damage} )</small>`;
        this.toastFunction(
            result.winner != 'draft' ?
            `<b>${result.winner}</b> venceu por <b>${result.diff}</b>!<br><b class="text-warning">${damage} </b> de dano causado!<br>${energy}`
            :
            `<b>Empate!</b><br>${energy}`
        );
        // Reseting entities gauge
        await sleep(20);
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
            this.enemy = Entities.randomEnemy();
        }else{
            this.player.reset(false);
        }

        // If enemy is dead, addExp and change enemy ELSE enemy soft reset
        if(!this.enemy.compIsAlive()) {
            this.player.exp.add(this.enemy.exp.current);
            this.enemy.image = null;
            this.toastFunction(
                `<b>${this.enemy.name} morreu!</b>`
            );
            await sleep(20);
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
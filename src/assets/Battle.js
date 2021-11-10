import Entities from './Entities';

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const Battle = () => ({
    player:     Entities.loadStoragePlayer(),
    enemy:      Entities.randomEnemy(),
    animating:  false,
    // Handle player input
    handlePlayerAction: async function (action, toastFunction, cardIndex=null) {
        this.animating = true;
        this.toastFunction = toastFunction;
        // Executing player turn
        let enemyNext = await this.playerTurn(action, cardIndex);
        // Executing enemy turn
        if(enemyNext){
            await this.enemyTurn();
        }else{
            await this.checkStatus();
        }
        this.animating = false;
    },
    // Player Turn
    playerTurn: async function (action, cardIndex=null) {
        switch(action) {
            // Draw a card
            case 'drawCard':
                await this.player.drawCard();
                return true;
            // Use abilityCard
            case 'abilityCard':
                return await this.player.useAbilityCard(cardIndex, this.enemy);
            case 'discardCard':
                await this.player.discardAbilityCard(cardIndex);
                return false;
            case 'stand':
                this.player.setStatus('standing');
                return true;
        }
        return true;
    },
    // Enemy Turn
    enemyTurn: async function() {
        // If enemy is not 'standing'
        if(this.enemy.status == 'drawing'){
            console.log('hmm');
            let enemyDone = await this.enemy.drawCard();
            console.log('enemyDone', enemyDone);
            console.log('playerStatus', this.player.status);
            console.log('enemyStatus', this.enemy.status);
            console.log('enemyisBursted', this.enemy.isBursted);
            if(this.player.status == 'standing' && this.enemy.status == 'drawing' && !this.enemy.isBursted) {
                await sleep(215);
                await this.enemyTurn();
            }
            // Enemy draw cards while is 'drawing'
        }
        // Checking the result
        await this.checkStatus();
    },
    // Check Status
    checkStatus: async function () {
        // Check if its time to check the results
        if((this.player.status == 'standing' && this.enemy.status == 'standing')){
            await this.checkResults();
        }
    },
    // Check Results
    checkResults: async function () {
        // Getting result
        let result = await Entities.gaugeDifference(this.player, this.enemy);
        let playerWins = result.winner == this.player.name;
        // Applying damage to entities
        this.enemy.addLife(playerWins   ?  -(result.diff * this.player.damage) : 0);
        this.player.addLife(!playerWins ?  -(result.diff * this.enemy.damage)  : 0);
        // Adding energy to entitites
        let enemyEnergy  = !playerWins ? (result.diff * (this.enemy.energy.maximum/10))  : (result.winner == 'draft' ? (this.enemy.energy.maximum/10) : 0);
        let playerEnergy = playerWins  ? (result.diff * (this.player.energy.maximum/10)) : (result.winner == 'draft' ? (this.player.energy.maximum/10) : 0);
        this.enemy.addEnergy(enemyEnergy);
        this.player.addEnergy(playerEnergy);
        // this.enemy.addEnergy(!playerWins ? result.diff* (this.enemy.energy.maximum * 0.02).toFixed(1) : (result.winner == 'draft' ? (this.enemy.energy.maximum * 0.01).toFixed(1) : 0));
        // this.player.addEnergy(playerWins ? result.diff* (this.player.energy.maximum * 0.02).toFixed(1) : (result.winner == 'draft' ? (this.player.energy.maximum * 0.01).toFixed(1) : 0));
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
        await sleep(2000);
        await this.reset();
    },
    // Reset
    reset: async function() {
        this.player.discardCost = 6;

        // Apllying starting round status
        this.player.apllyStatusEffect('TURN_START');
        this.enemy.apllyStatusEffect('TURN_START');

        // If player is dead, hard reset and change enemy ELSE soft reset
        if(!this.player.isAlive()){
            this.player.reset(true);
            this.toastFunction(
                `<b>Jogador morreu!</b>`
            );
            await sleep(2000);
            this.enemy = Entities.randomEnemy();
        }else{
            this.player.reset(false);
        }

        // If enemy is dead, addExp and change enemy ELSE enemy soft reset
        if(!this.enemy.isAlive()) {
            this.player.addExp(this.enemy.exp);
            this.enemy.image = null;
            this.toastFunction(
                `<b>${this.enemy.name} morreu!</b>`
            );
            await sleep(2000);
            this.enemy = Entities.randomEnemy();
        }else{
            this.enemy.reset();
        }

        // Save localData
        localStorage.setItem('player', JSON.stringify(this.player));

        
        // Enable input
        this.animating = false;
    }
});

export default Battle;
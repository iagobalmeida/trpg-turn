import Entities from './Entities';

const animationBuffer = 500;

const Battle = () => ({
    player:     Entities.loadStoragePlayer(),
    enemy:      Entities.randomEnemy(),
    animating:  false,
    // Handle player input
    handlePlayerAction: function (action, toastFunction, cardIndex=null) {
        this.toastFunction = toastFunction;
        // Executing player turn
        let enemyNext = this.playerTurn(action, cardIndex);
        // Executing enemy turn
        if(enemyNext){
            this.animating = true;
            setTimeout(() => {this.enemyTurn()}, animationBuffer);
        }else{
            this.checkStatus();
        }
    },
    // Player Turn
    playerTurn: function (action, cardIndex=null) {
        switch(action) {
          // Draw a card
          case 'drawCard':
            this.player.drawCard();
            return true;
          // Use gauge modifier
          case 'abilityCard':
            return this.player.useAbilityCard(cardIndex, this.enemy);
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
        let result = Entities.gaugeDifference(this.player, this.enemy);
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
        // If player is dead, hard reset and change enemy ELSE soft reset
        if(!this.player.isAlive()){
            this.player.reset(true);
            this.enemy = Entities.randomEnemy();
        }else{
            this.player.reset(false);
        }

        // If enemy is dead, addExp and change enemy ELSE enemy soft reset
        if(!this.enemy.isAlive()) {
            this.player.addExp(this.enemy.exp);
            this.enemy = Entities.randomEnemy();
        }else{
            this.enemy.reset();
        }

        // Apllying starting round status
        this.player.apllyStatusEffect('TURN_START');
        this.enemy.apllyStatusEffect('TURN_START');

        // Save localData
        localStorage.setItem('player', JSON.stringify(this.player));
        
        // Enable input
        this.animating = false;
    }
});

export default Battle;
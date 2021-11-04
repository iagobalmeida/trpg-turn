<template>
  <!-- Toast -->
  <div :class="`custom-toast container ${toast.show ? 'o-100' : 'o-0'}`">
    <div class="p-3 rounded border border-2 text-white rounded shadow h-100 mx-auto" v-html="toast.text" style="background-color:black"/>
  </div>
  <!-- Enemy -->
  <div class="container w-md-50 rounded-top">
    <div class="background" :style="`background-image:url(${require(`@/assets/backgrounds/Hills.png`)})`"></div>
    <!-- Enemy Card -->
    <div class="mb-3 px-2 px-md-0 position-relative monster-img" :style="enemy.image ? `background-image:url(${require(`@/assets/enemies/${enemy.image}`)});background-size:${50 + (enemy.size * 50)}px;` : ''">
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
            {{enemyStatus.modifier}}
            <i :class="`${enemyStatus.icon}`"></i>
            <small class="text-muted">/{{enemyStatus.turns}}</small>
          </span>
        </div>
    </div>
  </div>
  <!-- Gauges -->
  <div class="container w-md-50 mb-3" style="z-index:98;">
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
        <span class="px-3 py-1 bg-white rounded-pill border border-2 shadow-sm d-flex justify-content-center align-items-center"
          v-for="playerStatus, playerStatusIndex in player.statusEffects"
          :key="`playerStatus_${playerStatusIndex}`"
          >
          {{playerStatus.modifier}} <i :class="`${playerStatus.icon} mx-1`"></i>
          <small class="text-muted d-flex-inline justify-content-center align-items-center">/ {{playerStatus.turns}}<i class="fa fa-sync ms-1 fa-xs"></i></small>
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
              <small>Pescar Carta</small>
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
                class="mb-3"
                :customLabel="`Lvl. ${player.level}`"
                :labelOnTop="true"
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
              <small>Parar</small>
            </div>
          </button>
        </div>
      </div>

      <!-- Player -->
      <div class="row">
        <h5 class="mb-3 md-md-0 text-white col" style="align-self:center;">
          {{player.name}} 
          <small class="text-muted d-none d-md-inline" style="font-size:12px;">Lvl. {{player.level}}</small>
        </h5>
        <div class="col-10 col-md-9">
          <small class="float-end border-2 btn btn-sm btn-outline-secondary rounded-pill px-3 me-2" data-bs-toggle="modal" data-bs-target="#modalHelp" ref="helpButton">
            <i class="fa fa-info me-md-2"></i>
            <span class="d-none d-md-inline">Ajuda</span>
          </small>
          <small class="float-end border-2 btn btn-sm btn-outline-secondary rounded-pill px-3 me-2" data-bs-toggle="modal" data-bs-target="#modalPlayer">
            <i class="fa fa-user me-md-2"></i>
            <span class="d-none d-md-inline">Jogador</span>
          </small>
          <small class="float-end border-2 btn btn-sm btn-outline-secondary rounded-pill px-3 me-2" data-bs-toggle="modal" data-bs-target="#modalMap">
            <i class="fas fa-map me-md-2"></i>
            <span class="d-none d-md-inline">Mapa</span>
          </small>
          <small class="float-end border-2 btn btn-sm btn-outline-secondary rounded-pill px-3 me-2" data-bs-toggle="modal" data-bs-target="#modalBackPack">
            <i class="fas fa-box me-md-2"></i>
            <span class="d-none d-md-inline">Mochila</span>
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
          <h5 class="modal-title" id="modalHelpLabel"><i class="fa fa-info me-2"></i>Como Jogar</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-start">
          <h5>Barra de Ataque</h5>
          <p>Você e seu inimigo possuem uma barra de ataque, que pode ser preenchida pescando cartas da pilha de cartas da ataque.</p>
          <AttackGauge 
            :current="7"
            :maximum="12"
            :biggestGauge="12"
            :standing="false"
            :bursted="false"
            className="danger"
          />
          <small><i class="text-muted">A barra de ataque do inimigo é vermelha.</i></small>
          <AttackGauge 
            :current="11"
            :maximum="12"
            :biggestGauge="12"
            :standing="false"
            :bursted="false"
            className="primary"
          />
          <small><i class="text-muted">A sua barra de ataque é azul.</i></small>
          <p>Para ganhar o round, você precisa encher sua barra de ataque o máximo possível, mas sem passar do seu limite!</p>
          <p>Em cada turno, você pode <b class="px-2 py-1 bg-white rounded text-primary">Pescar uma carta</b>, <b class="px-2 py-1 bg-white rounded text-primary">Parar</b> ou usar uma <b class="text-primary">Carta de Habilidade</b></p>
          <p>Ao pescar, o valor da carta pescada é adicionado a sua barra de ataque e seu turno acaba.</p>
          <p>Se você escolher parar, você trava sua barra de ataque no valor atual e espera até que seu inimigo pare também.</p>
          <p>Usar uma <b class="text-primary">Carta de Habilidade</b> não afeta a passage de turno a não ser que isso faça parte de seu efeito.</p>
          <p><b>Hotkeys</b></p>
          <ul class="list-group ">
            <li class="list-group-item bg-dark text-white"><span class="bg-white px-2 py-1 rounded text-dark shadow me-2">D</span>Pescar carta</li>
            <li class="list-group-item bg-dark text-white"><span class="bg-white px-2 py-1 rounded text-dark shadow me-2">S</span>Parar</li>
            <li class="list-group-item bg-dark text-white"><span class="bg-white px-2 py-1 rounded text-dark shadow me-2">1</span>Usar carta de habilidade "1"</li>
            <li class="list-group-item bg-dark text-white"><span class="bg-white px-2 py-1 rounded text-dark shadow me-2">2</span>Usar carta de habilidade "2"</li>
            <li class="list-group-item bg-dark text-white"><span class="bg-white px-2 py-1 rounded text-dark shadow me-2">3</span>Usar carta de habilidade "3"</li>
            <li class="list-group-item bg-dark text-white"><span class="bg-white px-2 py-1 rounded text-dark shadow me-2">4</span>Usar carta de habilidade "4"</li>
          </ul>
          <hr>
          <h5>Resultados do Round</h5>
          <p>Assim que você e seu inimigo pararem, o resultado do round é calculado, subtraíndo 1 das duas barras até que alguma atinja o valor 0</p>
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
          <p>Depois de calcular o resultado, o vencedor irá causar um número ataques igual ao valor restante em sua barra de ataque. Em seguida, uma mensagem é exibida exibindo os valores resultantes daquele round.</p>
          <div class="p-3 rounded border border-2 text-white rounded shadow h-100 mx-auto text-center mb-3" style="background-color:black">
            <b>Jogador</b> venceu por <b>4</b>!
            <br><b class="text-warning"> 20 <i class="fas fa-crosshairs"></i><small>( 5 x 4 )</small> </b> de dano causado!
            <br><b class="text-info">+24 <i class="fas fa-fire"></i></b>
          </div>
          <p><small><i class="text-muted">O dano causado(20) é composto pelo dano base(5) multiplicado pelo número de ataques(4).</i></small></p>
          <hr>
          <h5>Estouro</h5>
          <p>Quando uma barra de ataque passa de seu valor máximo, ela se torna <b class="text-warning">Estourada</b>. Uma barra de ataque estourada obriga seu possessor a parar instantaneamente</p>
          
          <p class="text-center">
            Barra de ataque com valor 9 e valor máximo 12.
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
            Uma carta com valor 5 é pescada.
          </p>
          <p class="text-center">
            <b><span class="text-primary">9</span> + 5 = <span class="text-warning">14</span></b>
            <i class="fa fa-arrow-right mx-3"></i>
            <b class="text-warning">Estouro! (14 > 12)</b>
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
          <p><small><i class="text-muted">O valor da barra é definido pela diferença(2) entre o valor máximo(12) e o valor de estouro(14).</i></small></p>
          <hr>
          <h5>Baralho de Ataque</h5>
          <p>Seu baralho de ataque é composto de um total de 24 cartas. Com valores de <i>N/2 - 5</i> á <i>N/2</i>, sendo <i>N</i> o valor total da sua barra de ataque.</p>
          <p>Se você tem uma barra com tamanho 12, você tera cartas de (12/2 - 5) á (12/2), ou seja, de 1 á 6.</p>
          <div class="row">
            <div class="col-1 text-center my-3" v-for="card, cardIndex in shuffledCards" :key="`player_card_${cardIndex}`">
              <span class="px-2 py-2 shadow-sm border rounded text-primary">{{card}}</span>
            </div>
          </div>
          <p><small><i class="text-muted">Seu baralho atual.</i></small></p>
          <p>Quando as cartas acabam, um novo baralho já embaralho é disponibilizado.</p>
          <hr>
          <h5>Cartas de Habilidade</h5>
          <p>Você pode utilizar <b class="text-primary">Cartas de Habilidade</b> para te auxiliarem no combate, elas possuem efeitos diversos como: aumentar sua barra de ataque, obrigar o inimigo a parar, recuperar vida, etc.</p>
          <p>Cada carta tem um custo de <b class="text-info">energia <i class="fas fa-fire"></i></b> para ser utilizada. Essa energia pode ser adquirida em duas situações durante o combate: quando você vence um round ou quando um round empata.</p>
          <p><i>Vitória - </i> <b class="text-info">10% da energia máxima * Número de ataques <i class="fas fa-fire"></i></b></p>
          <p><i>Empate - </i> <b class="text-info">10% da energia máxima <i class="fas fa-fire"></i></b></p>
          <p>Você pode ter até 4 cartas em sua mão ao mesmo tempo, quando uma carta é utilizada, uma nova carta é inserida em sua mão.</p>
          <p>Para <b>Usar <i class="fa fa-arrow-up"></i></b> uma carta, clique no parte SUPERIOR da mesma.</p>          
          <p>Para <b>Descarar <i class="fa fa-arrow-down"></i></b> uma carta, clique no parte INFERIOR da mesma.</p>          
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
              :discardCost="6"
              :keymap="cardIndex"
              :animated="false"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Player -->
  <div class="modal fade" id="modalPlayer" tabindex="-1" aria-labelledby="modalPlayerLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalPlayerLabel"><i class="fa fa-user me-2"></i>Jogador</h5>
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
          <h4>Atributos</h4>
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
          <h4>Baralho</h4>
          <div class="container">
            <div class="row">
              <div class="col-1 text-center my-3" v-for="card, cardIndex in shuffledCards" :key="`player_card_${cardIndex}`">
                <span class="px-2 py-2 shadow-sm border rounded text-primary">{{card}}</span>
              </div>
            </div>
            <small class="text-muted"><i>As cartas acima não se encontram na mesma ordem que seu baralho!</i></small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Backpack -->
  <div class="modal fade" id="modalBackPack" tabindex="-1" aria-labelledby="modalBackPackLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalBackPackLabel"><i class="fa fa-box me-2"></i>Mochila</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-start">
          <h5>Equipamentos</h5>
          <p class="text-muted">Nenhum equipamento encontrado ainda.</p>

          <h5>Habilidades no Baralho</h5>
          <div class="row g-3 pb-3 align-items-stretch" v-on:dragStart="console.log($event)">
            <AbilityCard
              :type="card.type"
              :target="card.target"
              :name="card.name"
              :cost="card.cost"
              :current="card.cost*2"
              :description="card.description"
              :image="card.image"
              v-for="card, cardIndex in player.abilityDeck"
              :key="`card_${cardIndex}`"
              class="col-6 col-md-4"
              :animated="false"
            />
          </div>

          <h5>Todas suas Habilidades</h5>
          <div class="row g-3 pb-3 align-items-stretch" v-on:dragStart="console.log($event)">
            <AbilityCard
              :type="card.type"
              :target="card.target"
              :name="card.name"
              :cost="card.cost"
              :current="card.cost*2"
              :description="card.description"
              :image="card.image"
              v-for="card, cardIndex in player.abilityDeckBase"
              :key="`card_${cardIndex}`"
              class="col-6 col-md-4"
              :animated="false"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Map -->
  <div class="modal fade" id="modalMap" tabindex="-1" aria-labelledby="modalMapLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalMapLabel"><i class="fa fa-map me-2"></i>Mapa</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-start">
          <button class="btn border-2 border-white rounded bg-cover w-100 py-3 px-2 shadow mb-3"  :style="`background-image:url(${require('@/assets/backgrounds/Hills.png')}); background-size: cover;`">
            <h5 class="text-white text-shadow">Slime Hill</h5>
          </button>
          <button class="btn rounded bg-cover w-100 py-3 px-2 shadow mb-3" :style="`background-image:url(${require('@/assets/backgrounds/Forest.png')}); background-size: cover;filter:grayscale(1)`">
            <h5 class="text-white text-shadow">???</h5>
          </button>
          <button class="btn rounded bg-cover w-100 py-3 px-2 shadow mb-3" :style="`background-image:url(${require('@/assets/backgrounds/DeepWoods.png')}); background-size: cover;filter:grayscale(1)`">
            <h5 class="text-white text-shadow">???</h5>
          </button>
          <button class="btn rounded bg-cover w-100 py-3 px-2 shadow mb-3" :style="`background-image:url(${require('@/assets/backgrounds/Swamp.png')}); background-size: cover;filter:grayscale(1)`">
            <h5 class="text-white text-shadow">???</h5>
          </button>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
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
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

.container {
  max-width: 690px;
}

.background {
  background-size:cover;-webkit-box-shadow: inset 5px 5px 50px 30px #000000; 
  border-radius: 100%;
  box-shadow: inset 5px 5px 20px 0px #00000;
  background-position:center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 50%;
  max-width: 690px;
  top: 0;
  background-size: 650px 650px;
  z-index: -1;
  filter: saturate(3);
}

.modal-content {
  background-color: #000000;
  color: white;
  border: 2px solid white;
}


</style>

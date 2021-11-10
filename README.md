# Tiny Cards
### CREDITS to Game-icons.net for the cards icons
### CREDITS to [Aekashics/Ækashics](http://www.akashics.moe/) for the enemies sprites

## Task Atual
-  Atualmente está sendo desenvolvida a comunicação baseada em eventos entre o servidor e o cliente, abaixo existe uma lista dos eventos que devem
    ser implementados.

- Depois desse passo, o próximo passo será a permanência de dados através de um banco MongoDB. Começando pela criação de contas.

### Event Handling
```
player.reset(dead=true/false)
player.addAttack(value)
player.addAttackCard(nextCardId)
player.useAbilityCard(index)
player.discardAbilityCard(index)
player.addExp(value)
player.stand()

player.reset(dead=true/false)
player.addAttack(value)
player.stand()

round.result()

battle.result(nextEnemyId)
```


### Icons Colors
```
gauge:  #D7E7FF #72ABFE / #01193D #000000

energy: #CDFCF4 #6CF7F7 / #03182E #000000

life:   #FAE3E5 #EB8C95 / #3B0A0F #000000

buff:   #84E8DB #2ED8A6 / #093118 #000000

debuff: #FBFFD3 #FFF36D / #3A1800 #000000
```

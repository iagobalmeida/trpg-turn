const createStatus = (moment, name, icon, turns, modifier, handler) => ({
    moment,
    name,
    icon,
    turns,
    modifier,
    apply(target) {
        if(this.turns == 0) { return true; }
        handler(target);
        this.turns -= 1;
        return false;
    }
})

const Status = {
    "poison": (turns, modifier) => (createStatus('start', 'poison', 'fas fa-skull-crossbones', turns, modifier, (target) => {
        target.life.add(-modifier);
    })),
    "regeneration": (turns, modifier) => (createStatus('start', 'regeneration', 'fas fa-heart', turns, modifier, (target) => {
        target.life.add(modifier);
    })),
    "despair": () => (createStatus('instant', 'despair', 'fa fa-times', 1, 0, (target) => {
        console.log(target);
        target.isStanding = true;
    }))
}

export default Status;
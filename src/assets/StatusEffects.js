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
        target.addLife(-modifier);
    })),
    "regeneration": (turns, modifier) => (createStatus('start', 'regeneration', 'fas fa-heart', turns, modifier, (target) => {
        target.addLife(modifier);
    })),
    "despair": () => (createStatus('instant', 'despair', 'fa fa-times', 1, 0, (target) => {
        target.setStatus('standing');
    }))
}

export default Status;
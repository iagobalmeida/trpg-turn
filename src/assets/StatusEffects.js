const APPLIANCES = {
    START:  'TURN_START',
    END:    'TURN_END',
    INSTANT: 'INSTANT'
}

const createStatus = (appliance, name, icon, turns, modifier, handler) => ({
    appliance,
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
    "poison": (turns, modifier) => (createStatus(APPLIANCES.START, 'poison', 'fas fa-skull-crossbones', turns, modifier, (target) => {
        target.addLife(-modifier);
    })),
    "regeneration": (turns, modifier) => (createStatus(APPLIANCES.START, 'regeneration', 'fas fa-heart', turns, modifier, (target) => {
        target.addLife(modifier);
    })),
    "despair": () => (createStatus(APPLIANCES.INSTANT, 'despair', 'fa fa-times', 1, 0, (target) => {
        target.setStatus('standing');
    }))
}

export default Status;
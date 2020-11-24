const Constants = require('../services/constants.service');

class ColorsHandler {
    constructor() {
        try {
            this.colorsArr = Constants.allColors() || [];
        } catch (x) {
            console.error(`Error while initializing ColorsHandler: ${x}`);
        }
    }
    getMaxColor(req, res, next) {
        try {
            let uniqColors = [...new Set(this.colorsArr)], clrCounter = {};
            for (let uc of uniqColors) {
                this.colorsArr.map((clr, idx) => {
                    clrCounter[uc] = clrCounter[uc] == undefined ? 0 : clrCounter[uc];
                    clrCounter[uc] = (uc === clr) ? ++clrCounter[uc] : clrCounter[uc];
                });
            }

            const output = (Object.keys(clrCounter).sort((a, b) => clrCounter[b] - clrCounter[a]))[0];
            res.status(200).send({ error: null, message: 'This color has come maximum times in array.', data: { "color": output, "count": clrCounter[output] } });

        } catch (mcx) {
            console.error(`Error while processing request: ${mcx}`);
            res.status(500).send({ error: mcx.message || mcx, message: mcx.message || 'Internal Error', data: null });
        }
    }

}

module.exports = (new ColorsHandler());
const express = require('express'),
    CashDispenserHandler = require('./handlers/cash-dispenser.handler'),
    ColorsHandler = require('./handlers/colors.handler');

class AppRouter {
    constructor() {
        this._router = express.Router();

        this.router.route('/')
            .get((req, res, next) => {
                console.log(`serving GET request on route '/'...`);
                res.status(200).send("You may want to call '/withdrawCash' route with postman script.");
            });

        this.router.route('/withdrawCash')
            .post([
                (req, res, next) => { console.log(`serving POST request on route '/withdrawCash'...`); next(); },
                CashDispenserHandler.withdrawCash.bind(CashDispenserHandler)
            ]);

        // this.router.route('/getMaxColor')
        //     .get([
        //         (req, res, next) => { console.log(`serving GET request on route '/getMaxColor'...`); next(); },
        //         ColorsHandler.getMaxColor.bind(ColorsHandler)
        //     ]);
    }

    get router() {
        return this._router;
    }
    set router(val) {
        this._router = val;
    }
    get routes() {
        return this._router;
    }
}

module.exports = new AppRouter();

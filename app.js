let express = require('express'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    confSource = require('./config'),
    env = process.env.NODE_ENV || 'development',
    config = confSource[env],
    AppRouter = require('./app-router'),
    path = require('path');

class ATMServer {
    constructor() {
        this._app = express();

        this._loadMiddleware();
        this.app.use(AppRouter.routes);

        this._errorHandler();
    }

    _loadMiddleware() {
        this.app.locals.root = __dirname;
        this.app.locals.conf = config;

        this.app.use(methodOverride())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({ extended: true }))
            .use(cors());
    }

    _errorHandler() {
        this.app.use((err, req, res, next) => {
            console.error(err.message || err);

            /*Checking whether response has been sent to client*/
            if (!res._headerSent)
                res.status(err.status || 500).json({
                    error: err.stack || err,
                    message: err.message || 'Server Error',
                    data: null
                });
        });
    }

    get app() {
        return this._app;
    }
    set app(value) {
        this._app = value;
    }
}

module.exports = {
    ATMServerClass: ATMServer,
    atmApp: (new ATMServer()).app
};
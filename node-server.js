let confSource = require('./config'),
    env = process.env.NODE_ENV || 'development',
    config = confSource[env],
    atmApp = (require('./app')).atmApp,
    http = require('http');

/**
 * HTTP exress server
 */
let server = http.createServer(atmApp).listen(config.port, (err) => {
    if (!!err)
        console.error(err.message || err.stack || err);

    console.info(`Server is ${server.listening ? 'listening' : 'not listening'} on port ${config.port}, in ${env} mode`);
});

/**
 * Exception Handler
 */
process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
}).on('uncaughtException', (err) => {
    console.error(`FATAL_EXCEPTION: ${err.message || err}`);
    console.error(`FATAL_EXCEPTION_Stack: ${err.stack}`);
    console.error(`**SERVER_CRASHED**`);

    server.close(() => {
        console.info(`Shutting Down Server...`);
        process.exit(0);
    });
});
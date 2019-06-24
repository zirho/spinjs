"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var minilog = require("minilog");
var yargs = require("yargs");
var createConfig_1 = require("./createConfig");
var executor_1 = require("./executor");
minilog.enable();
var logger = minilog('spin');
try {
    var argv = yargs
        .command('build', 'compiles package for usage in production')
        .command(['watch', 'start'], 'launches package in development mode with hot code reload')
        .command('exp', 'launches server for exp and exp tool')
        .command('test [mocha-webpack options]', 'runs package tests')
        .demandCommand(1, '')
        .option('c', {
        describe: 'Specify path to config file',
        type: 'string'
    })
        .option('verbose', {
        alias: 'v',
        default: false,
        describe: 'Show generated config',
        type: 'boolean'
    })
        .version(require('../package.json').version)
        .argv;
    var cmd = argv._[0];
    var config = void 0;
    if (argv.help && cmd !== 'exp') {
        yargs.showHelp();
    }
    else {
        var cwd = process.cwd();
        if (['exp', 'build', 'test', 'watch', 'start'].indexOf(cmd) >= 0) {
            config = createConfig_1.default(cwd, cmd, argv);
        }
        if (Object.keys(config.builders).length === 0) {
            throw new Error('No spinjs builders found, exiting.');
        }
        executor_1.default(cmd, argv, config.builders, config.spin);
    }
}
catch (e) {
    logger.error(e);
}
//# sourceMappingURL=cli.js.map
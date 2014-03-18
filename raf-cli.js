#!/usr/bin/env node

/**
 * Module dependencies.
 */
var program = require('commander'),
    ripple = require('ripple-lib');

/**
 * Options
 */
var Options = {
  server: {
    servers: [
      { host: 's_west.ripple.com', port: 443, secure: true },
      { host: 's_east.ripple.com', port: 443, secure: true }
    ]
  }
};

var remote;

/**
 * Program
 */
program
  .command('raf <rippleAddress>')
  .description('Find out who created the ripple account.')
  .action(function(rippleAddress){
    if(!ripple.UInt160.from_json(rippleAddress).is_valid()) {
      console.log('Invalid ripple address.');
      return;
    }

    remote = new ripple.Remote(Options.server);
    remote.on('connected',function(){
      remote.request_account_tx({
        'account': rippleAddress,
        'ledger_index_min': -1,
        'ledger_index_max': -1,
        'limit': 1,
        'forward': true
      })
      .on('success', function(result){
        if (result && result.transactions) {
          console.log(result.transactions[0].tx.Account);
          process.exit(0);
        }
      }).request();
    });
    remote.connect();
  });

program
  .parse(process.argv);

if (!program.args.length) program.help();
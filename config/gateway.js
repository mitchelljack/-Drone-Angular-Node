
var braintree = require('braintree');
var gateway = braintree.connect({
  environment:  braintree.Environment.Production,
  merchantId:   'fcd7w2dykp57nx96',
  publicKey:    'pp2y82zkg8g44w87',
  privateKey:   'd1fc8dc6d3edfc89d722295a5088a7f1'
});

module.exports = gateway;

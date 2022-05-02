var Cloudant = require('cloudant');
// var me = '82072e03-6245-4228-8d27-ff300c51b3fc-bluemix'; // Set this to your own account
// var password = 'a732fc21224ec9fd1771b90ad4871690f8df0174c952254f8b8b9b2d0d2d200a';

var me = 'f1f92792-bfef-4997-90f2-246fad466020-bluemix'; // Set this to your own account
var password = '46811ef80fdb767890c1ba2db47d66f0671cd1bd35901b2b7187dbaeeb402570';

// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password},function(err, cloudant) {
	if (err) {
		return console.log('Failed to initialize Cloudant: ' + err.message);
	}
});

module.exports = cloudant;
// model.exports = cloudant.db.list(function(err, allDbs) {
//   console.log('All my databases: %s', allDbs.join(', '))
// });

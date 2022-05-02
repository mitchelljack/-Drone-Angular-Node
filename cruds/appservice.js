var express = require('express');
var router = express.Router();
var cloudant = require('../config/db');

router.get('/get-version',function(req,res){
    cloudant.db.list(function(err, allDbs) {
        if(err){
            res.send("error");
        }
        else {
          var query = {
              "selector": {
                  "timestamp": { "$gt": 0 }
              },
              "fields": ["version", "timestamp"],
              "sort": [{"timestamp": "desc"}],
              "limit": 1
          };
          cloudant.request({
              db: 'appservice',
              method: 'POST',
              doc: '_find',
              body: query
          }, function (err, data) {
              if (err) {
                  console.log(err);
                  res.sendStatus(500);
              }
              else {
                  res.send(data);
              }
          });
        }
    });
});

module.exports = router;

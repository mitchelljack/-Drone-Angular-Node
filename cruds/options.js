var express = require('express');
var router = express.Router();
var cloudant = require('../config/db');

function isAdmin(req,res,next){
    if (req.session && req.session.user && req.session.user == 'admin@drone.com'){
        return next();
    }
    else{
        res.sendStatus(401);
    }
}

router.get('/:option/all',function(req,res){
    if(!req.params.option)
        res.sendStatus(500);
    else{
        cloudant.db.list(function(err, allDbs) {
            if(err){
                res.send("error");
            }
            else {
                var options = cloudant.db.use('options');
                options.get(req.params.option,function(error,data){
                    if(error)
                        res.send("error");
                    else{
                        res.send(data);
                    }
                })

            }
        });
    }
});



router.get('/:category/:option/:id',isAdmin,function(req,res){
    cloudant.db.list(function(err, allDbs) {
        if(err || !req.params.id || !req.params.option || !req.params.category){
            res.send("error");
        }
        else {
            var options = cloudant.db.use('options');
            options.get(req.params.category,function(error,data){
                if(error){
                    res.sendStatus(500);
                }
                else{
                    if(data[req.params.option] && data[req.params.option].indexOf(req.params.id)<0){
                        data[req.params.option].push(req.params.id);
                        options.insert(data,function(error){
                            if(error)
                                res.send("error");
                            else{
                                res.send("success");
                            }
                        });
                    }
                    else{
                        res.sendStatus(500);

                    }
                }
            })

        }
    });
});

router.post('/delete/:category/:option/:id',function(req,res){
    cloudant.db.list(function(err, allDbs) {
        if(err || !req.params.id || !req.params.option || !req.params.category){
            res.send("error");
        }
        else {
            var options = cloudant.db.use('options');
            options.get(req.params.category,function(error,data){
                if(error){
                    res.sendStatus(500);
                }
                else{
                    if(data[req.params.option]){
                        var index = data[req.params.option].indexOf(req.params.id);
                        data[req.params.option].splice(index,1);
                        options.insert(data,function(error){
                            if(error)
                                res.send("error");
                            else{
                                res.send("success");
                            }
                        });
                    }
                    else{
                        res.sendStatus(500);

                    }
                }
            })

        }
    });
});

module.exports = router;

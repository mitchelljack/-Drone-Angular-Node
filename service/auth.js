function isAuthenticated(req, res, next)
{
	if (req.session && req.session.user){
		if(req.originalUrl=="/" || req.originalUrl=="/forgotten.html")
			res.redirect("/main.html");
		else
			return next();
	}
	else if(req.originalUrl=="/" || req.originalUrl=="/forgottenpassword.html" ||
					req.originalUrl=="/reset.html" || req.originalUrl == "/signup.html" ||
					req.originalUrl.indexOf("images/")>=0 || req.originalUrl.indexOf("js/")>=0 ||
					req.originalUrl.indexOf("api/v1/")>=0){
		return next();
	}
	else {
		res.sendStatus(401);
	}
}


module.exports.isAuthenticated = isAuthenticated;

var cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'precision-autonomy',
  api_key: '939831575947933',
  api_secret: 'YJ32_aDrAj6wrG6CEW8U41i2RHs'
});

module.exports = cloudinary;

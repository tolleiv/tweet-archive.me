
var expand = require('../../helpers/expand.js');
var urls = [{url:'http://t.co/wbDrgquZ'}, {url:'http://is.gd/UNsT3t'} , {url: 'http://t.co/6OQHhbDV'}, {url: ' http://bit.ly/iR9uIO'}];

expand(urls, function(urls) {
    console.log(urls);
})

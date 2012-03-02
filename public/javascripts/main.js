$(document).ready(function () {
    $('.delayed').delay(200).fadeIn();


    $(".tweets").autobrowse({
        url:function (offset) {
            return "/tweets.json?offset=" + offset;
        },
        template:function (response) {
            var markup = '';
            console.log(response[0]);
            for (var i = 0; i < response.length; i++) {
                markup += '<div class="tweet">' + renderTweet(response[i].data) + '</div>';
            }
            return markup;
        },
        itemsReturned:function (response) {
            return response.length;
        },
        offset:0,
        //max:100,
        loader:'<div class="loader"></div>',
        useCache:false,
        sensitivity: 250,
        expiration:1
    });
});

function renderTweet(tweet) {
    var text = tweet.text;
    var linkTpl = '<a href="URL">LINK</a>';
    for(var i=0;i<tweet.entities.urls.length;i++) {
        var c = tweet.entities.urls[i];
        var display_url = c.expanded_url.replace(/^https?:\/\//,'').replace(/^www/,'');
        if (display_url.length > 40) {
            display_url = display_url.substr(0,40) + '...'
        }
        var link = linkTpl.replace(/URL/, c.expanded_url).replace(/LINK/, display_url)
        text = text.replace(c.url, link);
    }
    return text + " &mdash; <span class='at-user'>@" +  tweet.user.screen_name+ "</span>";
}
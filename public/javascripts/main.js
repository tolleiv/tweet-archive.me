$(document).ready(function () {
    $('.delayed').delay(200).fadeIn();

    var listDate = null;
    $(".tweets").autobrowse({
        url:function (offset) {
            return "/tweets.json?offset=" + offset;
        },
        template:function (response) {
            var markup = '';
            console.log(response[0]);
            for (var i = 0; i < response.length; i++) {
                var tweetDate = new Date(response[i].date);
                if (!listDate || tweetDate.toGMTString().substr(0,16) != listDate.toGMTString().substr(0,16)) {
                    markup += '<div class="span1 tweet-date">' + tweetDate.toGMTString().substr(0,16) + '</div>'
                    listDate = tweetDate;
                }
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
        sensitivity: 200,
        useCache:true,
        expiration:1
    });
});

function renderTweet(tweet) {
    var text = tweet.text;
    var linkTpl = '<a href="URL">LINK</a>';
    for(var i=0;i<tweet.entities.urls.length;i++) {
        var c = tweet.entities.urls[i];
        var display_url = c.expanded_url.replace(/^https?:\/\//,'').replace(/^www./,'');
        if (display_url.length > 40) {
            display_url = display_url.substr(0,40) + '...'
        }
        var link = linkTpl.replace(/URL/, c.expanded_url).replace(/LINK/, display_url)
        text = text.replace(c.url, link);
    }
    var msg = text + " &mdash; <span class='at-user'>@" +  tweet.user.screen_name+ "</span>";

    if (tweet.favorited) {
        msg = msg + '<i class="icon-star"></i>' + '######'
    }
    return msg;
}
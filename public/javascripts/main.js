
var listDate = null;
var author = null;
var browseCfg = {
    url:function (offset) {
        var search = $(".search").val();
        var url;
        if (search.length || author) {
            url = "/search.json?offset=" + offset + (search ? '&q=' + search : '') + (author ? '&author=' + author : '');
        } else {
            url = "/tweets.json?offset=" + offset;
        }
        return url;
    },
    template: function(response) {
        var markup = '';

        for (var i = 0; i < response.length; i++) {
            var tweetDate = new Date(response[i].date);
            if (!listDate || tweetDate.toGMTString().substr(0,16) != listDate.toGMTString().substr(0,16)) {
                markup += '<div class="span1 tweet-date">' + tweetDate.toGMTString().substr(0,16) + '</div>'
                listDate = tweetDate;
            }
            markup += renderTweet(response[i].data);
        }
        return markup;
    },
    itemsReturned:function (response) {
        return response.length;
    },
    empty:function() {
        return '<blockquote><p>Sorry found nothing :(</p></blockquote>'
    },
    offset:0,
    loader:'<div class="loader"></div>',
    sensitivity: 200,
    useCache:true,
    expiration:1
};

$(document).ready(function () {
    $('.delayed').delay(200).fadeIn();
    $(".search").change(function() {
        $(".tweets").html('');
        $(".tweets").autobrowse(browseCfg);
        listDate = null;
    });
    $(".tweets").autobrowse(browseCfg);

    $.ajax({
        url:'/authors',
        success: function(data) {
            $('.facet').html('');
            for(var i=0;i<data.length;i++) {
                $('.facet').append('<li><a onclick="filterAuthor(this, \'' + data[i].value + '\');return false;">' + data[i].value + ' ( ' + data[i].count + ')</a></li>');
            }
        }
    });

});

function filterAuthor(obj,name) {

    $('.facet > li').removeClass('active');
    author = (author == name) ? null : name;
    if (author) $(obj).parent().addClass('active');
    $(".tweets").html('');
    $(".tweets").autobrowse(browseCfg);
    listDate = null;

}

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

    if (tweet.user.screen_name == me) {
        msg = '<div class="tweet my-tweet">' + msg + '</div>';
    } else {
        msg = '<div class="tweet">' + msg + '</div>';
    }

    return msg;
}
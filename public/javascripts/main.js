
var listDate = null;
var involved = null;
var tag = null;
var browseCfg = {
    url:function (offset) {
        var search = $(".search").val();

        var query = ['offset=' + offset];
        if (search.length) {
            query.push('q=' + search);
        }
        if (involved) {
            query.push('involved=' + involved.join(','));
        }
        return (query.length > 1 ? "/search.json?" : "/tweets.json?") + query.join('&');
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
    $('.trigger-search').click(function() {
        $(".search").val('').trigger('change');
        $(this).addClass('hidden');
        $('.clear-search').removeClass('hidden');
    });
    $('.clear-search').click(function() {
        $(".search").val('').trigger('change');
    })
    $(".search").change(function() {
        if ($(this).val()) {
          $('.trigger-search').addClass('hidden');
          $('.clear-search').removeClass('hidden');
        } else {
            $('.clear-search').addClass('hidden');
            $('.trigger-search').removeClass('hidden');
        }
        $(".tweets").html('');
        $(".tweets").autobrowse(browseCfg);
        listDate = null;
    });
    $(".tweets").autobrowse(browseCfg);

    $.ajax({
        url:'/involved.json',
        success: function(data) {
            $('.facet').html('');
            for(var i=0;i<data.length;i++) {
                $('.facet').append('<li><a onclick="filterUser(this, \'' + data[i].value + '\');return false;">' + data[i].value + ' (' + data[i].count + ')</a></li>');
            }
        }
    });
});

function filterUser(obj,name) {
  $(obj).parent().toggleClass('active');

  if ($(obj).parent().hasClass('active')) {
      involved = involved || []
      involved.push(name);
  } else {
      involved = involved.filter(function(val) { return val != name; })
  }

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
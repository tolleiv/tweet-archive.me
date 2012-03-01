$(document).ready(function () {
    $('.delayed').delay(200).fadeIn();


    $(".tweets").autobrowse({
        url:function (offset) {
            return "/tweets.json?offset=" + offset;
        },
        template:function (response) {
            var markup = '';
            for (var i = 0; i < response.length; i++) {
                markup += '<div class="tweet">' + response[i].summary + '</div>';
            }
            return markup;
        },
        itemsReturned:function (response) {
            return response.length;
        },
        offset:0,
        max:100,
        loader:'<div class="loader"></div>',
        useCache:false,
        expiration:1
    });
});
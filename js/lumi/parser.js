var market = (function(){
    var uri = {
        who_sell : function(query){return 'http://market.lumiro.net/whosell.php?s=' + encodeURI(query) + '&field=price&order=asc&rand=' + Math.random()}
        , who_buy : function(query){return 'http://market.lumiro.net/whobuy.php?s=' + encodeURI(query) + '&field=price&order=asc&rand=' + Math.random()}
    }
    return {
        load: {
            sell : function(query, callback_func){
                $.ajax({
                    url: uri.who_sell(query),
                    success: function(data){
                        callback_func(parseData(data));
                    }
                });
            },
            buy : function(query, callback_func){
                $.ajax({
                    url: uri.who_buy(query),
                    success: function(data){
                        callback_func(parseData(data));
                    }
                });
            }
        }
        , parser: {
            sell : function(data){
                var ResultMatchRegExp = /tr\sclass="line(?:[\s\S]*?)div\sstyle="([\s\S]*?)"(?:[\s\S]*?)<small>([\d\+]*)<\/small>(?:[\s\S]*?)javascript:perf\('([\d]+)'\);">([^<]+?)<\/a>([\s\S]*?)<\/td>(?:[\s\S]*?)class="value">([\s\S]*?)class="value"\salign="right">([^<]+)<(?:[\s\S]*?)align="center">([^<]+)(?:[\s\S]*?)class="trader(?:[\s\S]*?)<a[^>]+>([^<]+)/gim
                    , items = [];
                while( (re = ResultMatchRegExp.exec(data)) ){
                    tmp_cards = [];
                    AditionalsString = re[6].trim();
                    var creator = '';
                    if(AditionalsString.length){
                        var CardsRegExp = /javascript:perf\('[^']+'\);">([^<]+?)<\/a>/gim;
                        while( (card = CardsRegExp.exec(AditionalsString)) ){
                            tmp_cards[tmp_cards.length] = card[1];
                        }
                        var CreatorRegExp = /javascript:perf\('[^']+'\);">([^<]+?)<\/a>'s/gim;
                        if(creatorRExec = CreatorRegExp.exec(AditionalsString))
                            creator = creatorRExec[1] + '\'s ';
                    }
                    items[items.length] = {
                        style : re[1],
                        id: re[3],
                        name: creator+ re[4]+re[5].trim().replace(/\<a\shref=\"http:\/\/www.poring.ru\/.*?>[\s\S]*<img.*?>[\s\S]*?\<\/a>/gim, ''),
                        refain: re[2],
                        price: re[7],
                        real_price: re[7].replace(/\./g,''),
                        profit: 0,
                        count: re[8],
                        nowcount: re[8],
                        attr: tmp_cards,
                        owner: re[9]
                    };

                }
                return items;
            }
        }
    }
})()
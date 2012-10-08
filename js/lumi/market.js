var market = (function(){
    var uri = {
        who_sell : function(query){return 'http://market.lumiro.net/whosell.php?s=' + encodeURI(query) + '&field=price&order=asc&rand=' + Math.random()}
        , who_buy : function(query){return 'http://market.lumiro.net/whobuy.php?s=' + encodeURI(query) + '&field=price&order=asc&rand=' + Math.random()}
    }
        , parser = {
            sell : function(data){
                var ResultMatchRegExp = /tr\sclass="line(?:[\s\S]*?)div\sstyle="([\s\S]*?)"(?:[\s\S]*?)<small>([\d\+]*)<\/small>(?:[\s\S]*?)javascript:perf\('([\d]+)'\);">([^<]+?)<\/a>([\s\S]*?)<\/td>(?:[\s\S]*?)class="value">([\s\S]*?)class="value"\salign="right">([^<]+)<(?:[\s\S]*?)align="center">([^<]+)(?:[\s\S]*?)class="trader(?:[\s\S]*?)<a[^>]+>([^<]+)/gim
                    , items = []
                    , re;
                while( (re = ResultMatchRegExp.exec(data)) ){
                    features = [];
                    AditionalsString = re[6].trim();
                    var creator = '';
                    if(AditionalsString.length){
                        var CardsRegExp = /javascript:perf\('([^']+)'\);">([^<]+?)<\/a>/gim;
                        while( (card = CardsRegExp.exec(AditionalsString)) ){
                            //TODO: Разобрать VVS оружие
                            features[features.length] = {name: card[2], id: card[1]};
                        }
                        var CreatorRegExp = /javascript:perf\('[^']+'\);">([^<]+?)<\/a>'s/gim;
                        if(creatorRExec = CreatorRegExp.exec(AditionalsString))
                            creator = creatorRExec[1] + '\'s ';
                    }
                    //items[items.length] = {
                    items[items.length] = {
                        id: re[3]
                        , name: creator+ re[4]+re[5].replace(/\<a\shref=\"http:\/\/www.poring.ru\/.*?>[\s\S]*<img.*?>[\s\S]*?\<\/a>/gim, '').replace(/\[[\d]+\]/,'').trim()
                        , refine: re[2]
                        , price: re[7].replace(/\./g,'')
                        , count: re[8]
                        , features: creator.length?[]:features
                        , slots : /\[[\d]+\]/.test(re[5]) ? /\[([\d]+)\]/.exec(re[5])[1] : 0
                        , owner: re[9]
                    };
                }
                return items
            }
            , buy : function(data){
                var ResultMatchRegExp = /tr\sclass="line(?:[\s\S]*?)div\sstyle="([\s\S]*?)"(?:[\s\S]*?)javascript:perf\('([\d]+)'\);">([^<]+?)<\/a>([\s\S]*?)<\/td>(?:[\s\S]*?)class="value"\salign="right">([^<]+)<(?:[\s\S]*?)align="center">([^<]+)(?:[\s\S]*?)class="trader(?:[\s\S]*?)<a[^>]+>([^<]+)/gim
                    , items = []
                    , re;

                while( (re = ResultMatchRegExp.exec(data)) ){
                    items[items.length] = {
                        id: re[2]
                        , name: re[3]
                        , price: re[5].replace(/\./g,'')
                        , count: re[6]
                        , owner: re[7]
                    }
                }
                return items
            }
        }

    return {
        load: {
            sell : function(query, callback_func){
                $.ajax({
                    url: uri.who_sell(query)
                    , success: function(data){ callback_func(parser.sell(data)); }
                });
            },
            buy : function(query, callback_func){
                $.ajax({
                    url: uri.who_buy(query)
                    , success: function(data){ callback_func(parser.buy(data)); }
                });
            }
        }
    }
})()
$(function(){
    (function(){
        setTimeout(arguments.callee, 20*20000);
        var callback_wait = 0
            , calc_profit = function(){
                callback_wait--
                if(callback_wait < 1) {
                    var profit = _.reduce(Tracker.listMerchants(), function(profit, merch){
                        return profit += merch.data.profit.summary;
                    }, 0)
                    if(profit > 100000)
                        chrome.browserAction.setBadgeText({text:
                            (profit > 100000)?String( (profit/1000000).toFixed(1)):''
                        })
                }
            }
        calc_profit()
        _.each(Tracker.listMerchants(), function(merch){
            callback_wait++
            merch.update(function(){

            });
        });
    })();
});
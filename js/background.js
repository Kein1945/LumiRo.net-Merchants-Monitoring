$(function(){
    (function(){
        setTimeout(arguments.callee, 5*60000);
        _.each(Tracker.listMerchants(), function(merch){
            merch.update();
        });
    })();

    (function(){
        var profit = _.reduce(Tracker.listMerchants(), function(profit, merch){
            return profit += merch.data.profit.summary;
        }, 0)
        if(profit > 100000)
            chrome.browserAction.setBadgeText({text:
                (profit > 100000)?String( (profit/1000000).toFixed(1)):''
            })
        else
            chrome.browserAction.setBadgeText({text:""})
        setTimeout(arguments.callee, 30000);
    })();
});
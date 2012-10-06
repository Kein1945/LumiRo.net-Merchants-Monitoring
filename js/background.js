$(function(){
    (function timed(){
        setTimeout(arguments.callee, 20*20000);
        _.each(Tracker.listMerchants(), function(merch){
            merch.update();
        });
    })();
});
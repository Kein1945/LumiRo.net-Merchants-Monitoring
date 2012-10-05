$(function(){
    (function timed(){
        setTimeout(arguments.callee, 20*20000);
        Merchants.eachMerch(function(merch){
            merch.update();
        });
    })();
});
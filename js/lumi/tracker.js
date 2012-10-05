var Tracker = (function(){

    var storage = (function(){
        var list_prefix = 'merchants';
        return {
            loadTracks: function(){
                var list = localStorage.getObject(list_prefix);
                return list?list:[];
            }
            , loadMerchantData: function(name){
                return localStorage.getObject('md_'+name);
            }
            , updateTrackNames: function(tracking_names){
                localStorage.setObject(list_prefix, tracking_names);
            }
        }
    })();

    return {
        list: function(){
            var track_items = storage.loadTracks()
                , tracking_list = [];
            _.each(track_items, function(item){
                merchants[merchants.length] = new Merchant( storage.loadMerchantData(name) )
            })
            return merchants;
        }
        , updateList: function(tracking_items){
            storage.updateTrackNames(tracking_items);
        }
    }
})();

var Merchant = (function(name){
    var self = this;
    Merc.MercData = data;
    Merc.MercData.timed_profit = data.timed_profit?data.timed_profit:0;
    Merc.name = data.name;
    this.getData = function(){
        return Merc.MercData;
    }
    this.renew = function(callback){
        Merc.MercData = {name: Merc.name};
        Merc.update(callback?callback:function(){});
    };
    this.update = function(update_callback){
        Merchants.loadData(Merc.name, function(new_lst){
            old_lst = Merc.getItems();

            var items = [];
            var profit = 0;

            if(new_lst.length){
                if(!old_lst.length){
                    old_lst = new_lst;
                } else {
                    oichecked = new Array(); ichecked = new Array();
                    for(i=0; i<old_lst.length; i++){
                        ohash = itemHash(old_lst[i]);
                        for(j=0; j<new_lst.length; j++){
                            nhash = itemHash(new_lst[j]);
                            if(!oichecked[ohash+i] && !ichecked[nhash+j] && nhash == ohash){
                                oichecked[ohash+i] = true; ichecked[nhash+j] = true;
                                old_lst[i].nowcount = new_lst[j].count;
                            }
                        }
                    }

                    for(i=0; i<old_lst.length; i++){
                        ohash = itemHash(old_lst[i]);
                        if(!oichecked[ohash+i]){
                            old_lst[i].nowcount = 0;
                        }
                    }

                    // Проверка, переставляли ли магазин?
                    for(j=0; j<new_lst.length; j++){
                        nhash = itemHash(new_lst[j]);
                        for(i=0; i<old_lst.length; i++){
                            var found = false;
                            ohash = itemHash(old_lst[i]);
                            if(nhash == ohash){
                                found = true; break;
                            }
                        }
                        if(!found){
                            old_lst = new_lst;
                            Merc.MercData.timed_profit = 0;
                            Merc.MercData.profit = 0;
                            notify(Merc.name, 'Новый венд. Данные торговца обновленны.');
                            break;
                        }
                    }
                }
                for(i=0; i<old_lst.length; i++){
                    if(old_lst[i].owner == Merc.name){
                        old_lst[i].profit = (old_lst[i].count - old_lst[i].nowcount) * old_lst[i].real_price;
                        items[items.length] = old_lst[i];
                        profit += old_lst[i].profit;
                    }
                }
            }
            var time = new Date();
            Merc.MercData.items = items;
            Merc.MercData.profit = profit;
            if(Merc.MercData.timed_profit < Merc.MercData.profit){
                notify(Merc.name, '+ '+number_format(Merc.MercData.profit - Merc.MercData.timed_profit, {decimals: 0, thousands_sep: "."}));
                Merc.MercData.timed_profit = Merc.MercData.profit;
            }
            var hours=time.getHours();
            var minutes=time.getMinutes();
            if(minutes<10) minutes='0'+minutes;
            Merc.MercData.refreshed = hours+':'+minutes;
            Merchants.persist(Merc);
            update_callback?update_callback():false;
        });
    };
    this.getItems = function(){
        return Merc.MercData.items?Merc.MercData.items:[];
    };
    this.eachItem = function(func){
        var items = self.getItems();
        for(i in items){
            func(i, items[i]);
        }
    };
    //refreshed: time.getHours()+':'+time.getMinutes(),
    //time: time.getHours()+':'+time.getMinutes()+' '+time.getDate()+'/'+time.getMonth(),
})();
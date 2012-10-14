var Tracker = (function(){
    return {
        listMerchants: function(){
            var merchant_name = localStorage.getObject('merchants_list',[])
                , merchants_list = [];
            _.each(merchant_name, function(name){
                var merchant = new Merchant( name )
                merchants_list[merchants_list.length] = merchant
            })
            return merchants_list;
        }
        , updateMerchantsList: function(tracking_items){
            localStorage.setObject('merchants_list', tracking_items)
        }
    }
})();

var Merchant = function(name){
    var self = this
        , getDefaultData = function(name){ return { items: { sell: [], buy: []}, create: (new Date()).toString(), update: (new Date()).toString(), profit: {summary: 0, last: 0}, lose:{ summary: 0, last: 0}, name: name } }

    self.data = localStorage.getObject("Merchant_"+name, getDefaultData(name));

    this.renew = function(callback){
        self.data = getDefaultData(self.data.name);
        self.update(callback);
    };
    this.update = function(update_callback){
        var call_waiting = 0
            , sell_result = {} , buy_result = {}
            , callback_func = function(){
                call_waiting--
                if(call_waiting > 0) return false
                if ( sell_result.is_created || buy_result.is_created ){
                    self.data.items = { sell: sell_result.new_items, buy: buy_result.new_items }
                } else {
                    self.data.items = {sell: sell_result.items, buy: buy_result.items}
                    self.calcProfit()
                }
                self.data.update = (new Date()).toString()
                self.save();
                update_callback?update_callback():false
            }
        call_waiting ++
        market.load.sell(self.data.name, function(new_items){
            new_items = _.filter(new_items ,function(item){ return item.owner == self.data.name })
            sell_result = self.compareLists(self.data.items.sell, new_items, self.sell_hash)
            callback_func()
        });
        call_waiting ++
        market.load.buy(self.data.name, function(new_items){
            new_items = _.filter(new_items ,function(item){ return item.owner == self.data.name })
            buy_result = self.compareLists(self.data.items.buy, new_items, self.buy_hash);
            callback_func()
        });
    };
    this.remove = function(){
        localStorage.removeItem("Merchant_"+this.data.name);
        var merchants = _.filter(Tracker.listMerchants(), function(merchant){
            return merchant.data.name != self.data.name;
        });
        Tracker.updateMerchantsList(_.map(merchants, function(m){return m.data.name}))
    }
};

Merchant.prototype.calcProfit = function(){
    var profit = 0;
    for(var i= 0; i<this.data.items.sell.length; i++){
        var item = this.data.items.sell[i];
        profit += (item.count - item.amount)* item.price;
    }
    this.data.profit.summary = profit;
}

Merchant.prototype.sell_hash = function(item){ return "hash"+[item.id, item.refine, item.price, item.slots, _.reduce(item.features,function(memo, feature){ return '|' + feature.id },'|')].join("|"); }
Merchant.prototype.buy_hash = function(item){ return "hash"+[item.id, item.price].join("|"); }

/**
 * Функция сравнения список товаров, решает что изменилось
 * */
Merchant.prototype.compareLists = function(old_items, new_items, getItemHash){
    var items = []
        , is_created = is_updated = false
        , old_item_checked = {}, new_item_checked = {}; // Предметы проверенные в (старом|новом) списке и не участвующие в сравнении
    if(old_items.length > 0 && new_items.length > 0){ // Если есть старые предметы
        // Ключ каждого массива это хэш предмета и его номер.
        // Блок поиска предметов которые у есть как в старом так и в новом списке
        for(var i= 0; i<old_items.length; i++){
            var old_item_hash = getItemHash(old_items[i])
            for(var j= 0; j<new_items.length; j++){
                var new_item_hash = getItemHash(new_items[j])
                if(!old_item_checked[old_item_hash+'|'+i] // Мы не проверяли этот старый предмет
                    && !new_item_checked[new_item_hash+'|'+j] // Мы не проверяли этот новый предмет
                    // Хэши предметов совпадают - наверное один и тот же
                    && new_item_hash == old_item_hash
                    // Количество в старом магазине должно быть быть больше или равно количеству в новом
                    && parseInt(old_items[i].amount?old_items[i].amount:old_items[i].count) >= parseInt(new_items[j].count) ){
                        is_updated = true
                        old_item_checked[old_item_hash+'|'+i] = true
                        new_item_checked[old_item_hash+'|'+j] = true
                        old_items[i].amount = new_items[j].count
                }
            }
        }
        // Проверям проданные вещи, которых не оказалось в новом списке
        for(var i=0; i<old_items.length; i++){
            var old_item_hash = getItemHash(old_items[i]);
            if(!old_item_checked[old_item_hash+'|'+i]){
                old_items[i].amount = 0 // значит их осталось 0 штук ;)
                is_updated = true
            }
        }
    }

    // Хера се условице.
    is_created = (!old_items.length && new_items.length)
        || ( old_items.length && (!new_items.length || _.size(new_item_checked) < new_items.length) );
    return {
        items: is_created ? new_items : old_items
        , new_items: new_items
        , is_updated: !is_created && is_updated
        , is_created: is_created
    };
}

Merchant.prototype.save = function(){
    localStorage.setObject('Merchant_'+this.data.name, this.data)
    localStorage.setObject('lastUpdate', (new Date()).toString())
}
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
        , getDefaultData = function(name){ return { items: { sell: [], buy: []}, create: (new Date()).toString(), update: (new Date()).toString(), profit: {summary: 0, last: 0}, name: name, isNew: true } }
        , loadInitData = function(name){
            data = getDefaultData(name)
            data.items.sell = market.load.buy(name, function(){

            })
        }

    self.data = localStorage.getObject("Merchant_"+name, getDefaultData(name));

    this.renew = function(callback){
        self.data = getDefaultData(self.data.name);
        self.update(callback?callback:function(){});
    };
    this.update = function(update_callback){
        market.load.sell(self.data.name, function(new_items){
            self.proceedSellData(new_items)
            self.data.update = (new Date()).toString()
            self.save();
            update_callback?update_callback():false;
        });
    };
    this.remove = function(){
        localStorage.removeItem("Merchant_"+this.data.name);
        var merchants = _.filter(Tracker.listMerchants(), function(merchant){
            return merchant.data.name != self.data.name;
        });
        Tracker.updateMerchantsList(_.map(merchants, function(m){return m.data.name}))
    }
    //refreshed: time.getHours()+':'+time.getMinutes(),
    //time: time.getHours()+':'+time.getMinutes()+' '+time.getDate()+'/'+time.getMonth(),
};

Merchant.prototype.proceedSellData = function(new_items){
    var items = []
        , profit = 0
        , old_items = this.data.items.sell
        , flag = {isReset: false, isNewVend: false, isFall: false}
        , getItemHash = function(item){
            return 'hash' + item.id + item.refine + ':' + item.price + '+' + item.slots + '/' + _.reduce(item.features,function(memo, feature){ return '|' + features.id },'|');
        };
    if(0 < old_items.length){
        if(0 < new_items.length){ // Предметы есть

            var old_item_checked = new Array(); // Предметы проверенные в старом списке
            var new_item_checked = new Array(); // Предметы проверенные в новом списке
            // Ключ каждого массива это хэш предмета и его номер.
            // Блок поиска предметов которые у есть как в старом так и в новом списке
            for(var i= 0; i<old_items.length; i++){
                var old_item_hash = getItemHash(old_items[i])
                for(var j= 0; j<new_items.length; j++){
                    var new_item_hash = getItemHash(new_items[j])
                    if(!old_item_checked[old_item_hash+i] // Мы не проверяли предмет
                        && !new_item_checked[new_item_hash+j]
                        // Хэши предметов совпадают - наверное один и тот же
                        && new_item_hash == old_item_hash){
                        old_item_checked[old_item_hash+i] = true; new_item_checked[new_item_hash+j] = true;
                        old_items[i].amount = new_items[j].count;
                    }
                }
            }
            // Проверям проданные вещи, которых не оказалось в новом списке
            for(var i=0; i<old_items.length; i++){
                old_item_hash = getItemHash(old_items[i]);
                if(!old_item_checked[old_item_hash+i]){
                    old_items[i].amount = 0; // значит их осталось 0 штук ;)
                }
            }
            items = old_items;

            // Подсчитаем прибыль
            for(var i=0; i<items.length; i++){
                var item = items[i];
                profit += (item.count - item.amount) * item.price
            }

            // Проверяем наличие новых предметов которых нет в старом венде
            for(var j=0; j<new_items.length; j++){
                var new_item_hash = getItemHash(new_items[j]);
                for(var i=0; i<old_items.length; i++){
                    var found = false
                        , old_item_hash = getItemHash(old_items[i]);
                    if(new_item_hash == old_item_hash){
                        found = true; break;
                    }
                }
                if(!found){
                    flag.isNewVend = true
                    this.data.profit.summary = 0
                    items = new_items
                    notify(this.data.name, 'Новый венд. Данные торговца обновленны.');
                    break;
                }
            }

        } else { // Наш венд слетел
            items = []
            flag.isFall = true;
        }
    } else {// Если раньше у нас не было новых вещей
        flag.isNewVend = !!(items = new_items).length;
    }
    this.data.items.sell = items;
    this.data.profit.last = profit - this.data.profit.summary;
    this.data.profit.summary = profit;
    // profit > 0 && notify(self.data.name, '+ '+number_format(profit, {decimals: 0, thousands_sep: "."}));
}
Merchant.prototype.save = function(){
    if(this.data.isNew){
        this.data.isNew = false;
    }
    localStorage.setObject('Merchant_'+this.data.name, this.data)
    localStorage.setObject('lastUpdate', (new Date()).toString())
}
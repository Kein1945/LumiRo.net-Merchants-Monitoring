/**
 * Merchant model
 */
define([
    'underscore'
    , 'backbone'
    , 'collections/items/sell'
    , 'collections/items/buy'
    , 'views/merchants/merchant'
    , 'models/item/sell'
    , 'lumi/market'
], function(_, Backbone, SellItemsCollection, BuyItemsCollection, MerchantView, SellModel, LumiMarket){

    var MerchantModel = Backbone.Model.extend({
        defaults: {
            create: (new Date()).toString()
            , update: (new Date()).toString()
            , profit: {
                summary: 0
                , last: 0}
            , lose:{
                summary: 0
                , last: 0}
            , name: "Hitler"
        }
        , initialize : function(){
            _.bindAll(this, 'render', 'reset', 'delete', 'synchronize', 'save','onSynchronize')
            this.sell = SellItemsCollection.where({owner: this.get('name')})
            this.buy = BuyItemsCollection.where({owner: this.get('name')})
            this.view = new MerchantView({model: this})
        }
        , synchronize: function(){
            console.log('Update merchant '+this.get('name'))
            var sell, buy
                , merchant = this;
            this.sell_sync = null;
            this.buy_sync = null;
            LumiMarket.load.sell(this.get('name'), function(data){
                var newItems = _.filter(data,function(item){ return item.get('owner') == merchant.get('name')})
                merchant.sell_sync = merchant.compareList(merchant.sell, newItems)
                merchant.onSynchronize()
            })
            LumiMarket.load.buy(this.get('name'), function(data){
                var newItems = _.filter(data,function(item){ return item.get('owner') == merchant.get('name')})
                merchant.buy_sync = merchant.compareList(merchant.buy, newItems)
                merchant.onSynchronize()
            })
        }
        , onSynchronize: function(){
            var sell = this.sell_sync
                , buy = this.buy_sync
            if( !sell || !buy ) return
            if(sell.is_created || sell.is_updated || buy.is_created || buy.is_updated){
                if( sell.is_created || buy.is_created){
                    if(sell.new_items.length || buy.new_items.length){
                        console.log(this.get('name')+":\t new vend")
                        this.trigger('vend:new')
                        this.sell = sell.new_items
                        this.buy = buy.new_items
                    } else {
                        this.sell = []
                        this.buy = []
                        console.log(this.get('name')+":\t vend fall")
                        this.trigger('vend:fall')
                    }
                } else {
                    if( sell.is_updated ) {
                        console.log(this.get('name')+":\t something sold")
                        this.trigger('vend:sold')
                        this.sell = sell.items
                    }
                    if( buy.is_updated ) {
                        console.log(this.get('name')+":\t something purchased")
                        this.trigger('vend:purchased')
                        this.buy = buy.items
                    }
                }
                this.save()
            }
        }
        , reset: function(){
            SellItemsCollection.removeWhere({owner: this.get('name')})
            BuyItemsCollection.removeWhere({owner: this.get('name')})
            this.sell = []
            this.buy = []
            this.attributes.profit.summary = 0;
        }
        , save: function(){
            SellItemsCollection.removeWhere({owner: this.get('name')})
            _.map(this.sell, function(item){
                SellItemsCollection.add(item)
                item.save()
            })
            BuyItemsCollection.removeWhere({owner: this.get('name')})
            _.map(this.buy, function(item){
                BuyItemsCollection.add(item)
                item.save()
            })
            Backbone.Model.prototype.save.call(this);
        }
        , delete: function() {
            this.reset()
            this.destroy();
            this.view.remove();
        }
        , compareList: function(old_items, new_items){
            var items = []
                , is_created = true, is_updated = false
                , old_item_checked = {}, new_item_checked = {}; // Предметы проверенные в (старом|новом) списке и не участвующие в сравнении
            if(old_items.length > 0 && new_items.length > 0){ // Если есть предметы
                // Ключ каждого массива это хэш предмета и его номер.
                // Блок поиска предметов которые у есть как в старом так и в новом списке
                for(var i= 0; i<old_items.length; i++){
                    var oldItem = old_items[i]
                        , old_item_hash = oldItem.hash()
                    for(var j= 0; j<new_items.length; j++){
                        var newItem = new_items[j]
                            , new_item_hash = newItem.hash()
                        if(!old_item_checked[old_item_hash+'|'+i] // Мы не проверяли этот старый предмет
                            && !new_item_checked[new_item_hash+'|'+j] // Мы не проверяли этот новый предмет
                            // Хэши предметов совпадают - наверное один и тот же
                            && new_item_hash == old_item_hash
                            // Количество в старом магазине должно быть быть больше или равно количеству в новом
                            && parseInt(oldItem.get('amount')) >= parseInt(newItem.get('count')) ){
                                old_item_checked[old_item_hash+'|'+i] = true
                                new_item_checked[old_item_hash+'|'+j] = true
                                if( parseInt(oldItem.get('amount')) > parseInt(newItem.get('count')) ){
                                    oldItem.set('amount', newItem.get('count'))
                                    is_updated = true
                                }
                        }
                    }
                }
                // Проверям проданные вещи, которых не оказалось в новом списке
                for(var i=0; i<old_items.length; i++){
                    var oldItem = old_items[i]
                        , old_item_hash = oldItem.hash()
                    if(!old_item_checked[old_item_hash+'|'+i]){
                        oldItem.set('amount', 0) // значит их осталось 0 штук ;)
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
        , render: function(){
            return this.view.render()
        }
    });
    return MerchantModel;
});
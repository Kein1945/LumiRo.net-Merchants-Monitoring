define([
    'underscore'
    , 'backbone'
    , 'backbone/storage'
    , 'models/item/sell'
], function(_, Backbone, Store, SellItemModel){
    var SellItemsCollectionFactory = function(merchant_name){
        return Backbone.Collection.extend({
            model: SellItemModel
            , localStorage: new Store("merchant_sell_"+merchant_name)
        });
    }
    return SellItemsCollectionFactory;
});
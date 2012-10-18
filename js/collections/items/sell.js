/**
 * Sell collection
 */
define([
    'underscore'
    , 'backbone'
    , 'backbone/storage'
    , 'models/item/sell'
], function(_, Backbone, Store, SellItemModel){
    var SellItemsCollection =  Backbone.Collection.extend({
        model: SellItemModel
        , localStorage: new Store("Merchant_sell")
        , initialize: function(){
            _.bindAll(this, 'removeWhere')
            this.fetch()
        }
        , removeWhere: function(conditional){
            _.map(this.where(conditional), function(item){ item.destroy() })
        }
    });
    return new SellItemsCollection;
});
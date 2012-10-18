/**
 * Buy item collection
 */
define([
    'underscore'
    , 'backbone'
    , 'backbone/storage'
    , 'models/item/buy'
], function(_, Backbone, Store, BuyItemModel){
    var BuyItemsCollection =  Backbone.Collection.extend({
        model: BuyItemModel
        , localStorage: new Store("Merchant_buy")
        , initialize: function(){
            _.bindAll(this, 'removeWhere')
            this.fetch()
        }
        , removeWhere: function(conditional){
            _.map(this.where(conditional), function(item){ item.destroy() })
        }
    });
    return new BuyItemsCollection ;
});
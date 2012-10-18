define([
    'underscore'
    , 'backbone'
    , 'backbone/storage'
    , 'models/merchant'
], function(_, Backbone, Store, MerchantModel){
    var MerchantCollection = Backbone.Collection.extend({
        model: MerchantModel
        , localStorage: new Store("merchants")
        , retrieve: function(name){
            var merchant = this.where({name: name})[0];
            if( !merchant ){
                merchant = new MerchantModel({name: name});
                this.add(merchant)
                merchant.save()
            }
            return merchant
        }
    });
    return new MerchantCollection;
});
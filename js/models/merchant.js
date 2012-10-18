define([
    'underscore'
    , 'backbone'
    , 'collections/items/sells'
    , 'views/merchants/merchant'
], function(_, Backbone, SellsItemsCollection, MerchantView){
    var MerchantModel = Backbone.Model.extend({
        defaults: {
            items: { sell: [], buy: []}
            , create: (new Date()).toString()
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
            _.bindAll(this, 'render')
            this.items = {
                sell: new SellsItemsCollection(this.get('name'))
            }
            this.view = new MerchantView({model: this})
            this.on('change', this.view.render)
        }
        , render: function(){
            return this.view.render()
        }
        , delete: function() {
            this.destroy();
            this.view.remove();
        }
    });
    return MerchantModel;
});
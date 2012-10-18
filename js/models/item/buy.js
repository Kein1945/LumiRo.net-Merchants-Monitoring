/**
 * Buy item model
 */
define([
    'underscore'
    , 'backbone'
], function(_, Backbone){
    var BuyItemModel = Backbone.Model.extend({
        tagName: 'div'
        , defaults: {
            id: 0
            , name: undefined
            , price: 0
            , count: 0 , amount :0
            , owner: undefined
        }
        , hash: function(){
            // h вначале, потому что если число первое, js интерпретирует наш хэш как число
            return "h"+[
                this.get('id')
                , this.get('price')
            ].join("|");
        }
    });
    return BuyItemModel;
});
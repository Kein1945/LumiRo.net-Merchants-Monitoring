/**
 * Sell item model
 */
define([
    'underscore'
    , 'backbone'
], function(_, Backbone){
    var SellItemModel = Backbone.Model.extend({
        tagName: 'div'
        , defaults: {
            id: 0
            , name: undefined
            , slots: 0
            , refine: 0
            , features : []
            , price: 0
            , count: 0 , amount :0
            , owner: undefined
        }
        , hash: function(){
            // h вначале, потому что если число первое, js интерпретирует наш хэш как число
            return "h"+[
                this.get('id')
                , this.get('refine')
                , this.get('price')
                , this.get('slots')
                , _.reduce(this.get('features'),function(memo, feature){ return '|' + feature.id },'|')
            ].join("|");
        }
    });
    return SellItemModel;
});
define([
    'jquery'
    , 'underscore'
    , 'backbone'
    , 'text!templates/merchant/merchant.html'
    , 'underscore/chrome-render'
    , 'lumi/market'
], function($, _, Backbone, merchantTemplate, ChromeRender, LumiMarket){
    var MerchantView = Backbone.View.extend({
        tagName: 'li'
        , initialize: function(){
            _.bindAll(this, 'render', 'update')
            this.template = new ChromeRender('merchant', merchantTemplate)
            this.render(null)
        }
        , render: function(callback){
            this.template( { merchant: this.model.toJSON() }, _.bind(function(compiledTemplate){
                this.$el.html(compiledTemplate)
            }, this) );
            return this
        }
        , update: function(){
            //LumiMarket.
        }
    });
    // Returning instantiated views can be quite useful for having "state"
    return MerchantView;
});
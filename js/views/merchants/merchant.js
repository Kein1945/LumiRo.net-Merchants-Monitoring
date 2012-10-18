/**
 * Merchant view
 */
define([
    'jquery'
    , 'underscore'
    , 'backbone'
    , 'text!templates/merchant/merchant.html'
    , 'underscore/chrome-render'
], function($, _, Backbone, merchantTemplate, ChromeRender){
    var MerchantView = Backbone.View.extend({
        tagName: 'li'
        , events: {
            'click header h4 a': 'updateMerchant'
            , 'click header a.remove': 'deleteMerchant'
            , 'click header a.reset': 'resetMerchant'
        }
        , initialize: function(){
            _.bindAll(this, 'render', 'updateMerchant', 'deleteMerchant', 'resetMerchant')
            this.template = new ChromeRender('merchant', merchantTemplate)
            this.model.on('change', this.render)
            this.model.on('all', this.render)
            this.render(null)
        }
        , updateMerchant: function(e){
            this.model.synchronize()
            e.preventDefault()
        }
        , deleteMerchant: function(e){
            this.model.delete()
            e.preventDefault()
        }
        , resetMerchant: function(e){
            this.model.reset()
            this.model.synchronize()
            e.preventDefault()
        }
        , render: function(callback){
            var merchant = this.model.toJSON()
            merchant.sell = _.map(this.model.sell, function(item){return item.toJSON()})
            merchant.buy = _.map(this.model.buy, function(item){return item.toJSON()})
            this.template( { merchant: merchant }, _.bind(function(compiledTemplate){
                this.$el
                    .html(compiledTemplate)
                    .find('[rel="tooltip"]').tooltip()
            }, this) );
            return this
        }
    });
    return MerchantView;
});
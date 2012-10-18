define([
    'jquery'
    , 'underscore'
    , 'backbone'
    , 'collections/merchants'
    , 'views/merchants/list'
    , 'text!templates/merchants.html'
], function($, _, Backbone, Merchants){
    var MerchantsListView = Backbone.View.extend({
        el: $("#merchants-list ul"),
        initialize: function(){
            _.bindAll(this, 'render')
            this.collection = Merchants
            this.collection.on('change', this.render)
            this.render()
        }
        , render: function(){
            console.log('Render merchants list')
            this.$el.html('')
            this.collection.fetch()
            _.each(this.collection.models, _.bind(function(merchant){
                this.$el.append(merchant.view.render().el)
            }, this))
        }
    });
    return MerchantsListView;
});
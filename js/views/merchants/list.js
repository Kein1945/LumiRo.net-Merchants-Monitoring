define([
    'jquery'
    , 'underscore'
    , 'backbone'
    // Using the Require.js text! plugin, we are loaded raw text
    // which will be used as our views primary template
    , 'collections/merchants'
    , 'views/merchants/list'
    , 'text!templates/merchant/list.html'
], function($, _, Backbone, MerchantsCollection, MerchantView, merchantsListTemplate){
    var MerchantsListView = Backbone.View.extend({
        el: $("#merchants-list ul"),
        initialize: function(){
            _.bindAll(this, 'render')
            this.collection = MerchantsCollection;
            this.collection.on()
            // this.collection.create({ name: "Hitler"});

            this.render()
        }
        , render: function(){
            this.$el.html('')
            var fragment = document.createDocumentFragment();
            _.each(this.collection.models, function(merchant){
                fragment.appendChild(merchant.view.render().el)
            })
            //var compiledTemplate = _.template( merchantsListTemplate, { merchants: this.collection.models } );
            this.$el.append(fragment);
        }
    });
    // Returning instantiated views can be quite useful for having "state"
    return MerchantsListView;
});
define([
    '../jquery'
    , 'underscore'
    , 'backbone'
    , 'router'
    , 'collections/merchants'
    , 'views/MerchantsView'
    , 'text!templates/merchant/list.html'
], function($, _, Backbone, Router, Merchants, MerchantViews, merchantListTemplate){
    var AppView = Backbone.View.extend({
        el: $('#lumi-app')
        , topNavigation : $('#top-navigation')
        , contentDiv: $('#content')
        , events: {
            'click #new-merchant': "addMerchant"
        }

        ,initialize: function(){
            _.bindAll(this, 'addMerchant', 'render', 'switchTab')
//            Merchants.bind('add', this.addOne)
            MerchantViews.bind('render', this.render)
//            Merchants.fetch()
            //new MerchantViews()
            this.render()
        }

        // ======== Navigation ========
        , help: function(){
            this.switchTab('help')
        }
        , settings: function(){
            this.switchTab('settings')
        }
        , merchants: function(){
            this.switchTab('merchants')
        }
        , selling: function(){
            this.switchTab('selling')
        }
        , buying: function(){
            this.switchTab('buying')
        }
        , switchTab: function(tabName){
            console.log('Switch to tab '+tabName)
            this.topNavigation.find('li').removeClass('active')
            this.topNavigation.find('i').addClass('icon-white')
            $('#top-navigation').find('a[href="#'+tabName+'"] i').removeClass('icon-white').parent().parent().addClass('active')
            this.contentDiv.find('>section').addClass('hide')
            this.contentDiv.find('#'+tabName).removeClass('hide')
        }
        // ======== ========
        , addMerchant : function(){
            var merchant = Merchants.retrieve( prompt("merchant name") )
            console.log('Add new merchant "'+merchant.get('name')+'"')
        }
        , render: function(){
            this.$el.find('#total').html(Merchants.length)
        }
    })
    return AppView
})

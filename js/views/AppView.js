define([
    '../jquery'
    , 'underscore'
    , 'backbone'
    , 'router'
    , 'collections/merchants'
    , 'views/MerchantsView'
    , 'text!templates/merchant/list.html'
    , 'bootstrap'
], function($, _, Backbone, Router, Merchants, MerchantViews, merchantListTemplate){
    var AppView = Backbone.View.extend({
        el: $('#lumi-app')
        , topNavigation : $('#top-navigation')
        , contentDiv: $('#content')
        , events: {
            'click #add-new': "add"
        }

        ,initialize: function(){
            _.bindAll(this, 'add', 'add_merchants', 'add_monitoring', 'render', 'switchTab', 'notification')
//            Merchants.bind('add', this.addOne)
            //MerchantViews.bind('render', this.render)
//            Merchants.fetch()
            //new MerchantViews()
            //$('.dropdown-toggle').dropdown()
            this.merchantsView = new MerchantViews({app: this})
            _.each(this.merchantsView.collection.models, _.bind(function(merchant){
                merchant.on('vend:fall vend:new vend:sold vend:purchased', _.bind(function(){
                    debugger;
                    this.notification('ok','ok')
                }, this))
            }, this))
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
        , monitoring: function(){
            this.switchTab('monitoring')
        }
        , switchTab: function(tabName){
            console.log('Switch to tab '+tabName)
            this.topNavigation.find('li').removeClass('active')
            this.topNavigation.find('.tab-switcher i').addClass('icon-white')
            $('#top-navigation').find('a[href="#'+tabName+'"] i').removeClass('icon-white').parent().parent().addClass('active')
            this.contentDiv.find('>section').addClass('hide')
            this.contentDiv.find('#'+tabName).removeClass('hide')
        }
        // ======== ========
        , add: function(e){
            this['add_'+this.topNavigation.find('.active a').data('tab')].call()
            e.preventDefault()
        }
        , add_merchants : function(){
            var merchantName = prompt("merchant name")
            if( merchantName) {
                var merchant = Merchants.retrieve( merchantName )
                merchant.synchronize()
                console.log('Add new merchant "'+merchant.get('name')+'"')
            }
        }
        , add_monitoring: function(){
            console.log('Add new monitoring')
        }
        , render: function(){
            this.$el.find('#total').html(Merchants.length)
        }
        , notification: function(title, text){
            title = title || 'LumiRo.net extension'
            if(!localStorage.notify || !localStorage.notify.length) return;
            var notification = webkitNotifications.createNotification(
                'Images/ico_128x128.png',  // icon url - can be relative
                title,  // notification title
                text // notification body text
            );

            // Then show the notification.
            notification.show();
            setTimeout(function(){
                notification.cancel()
            }, 15000);
        }
    })
    return AppView
})

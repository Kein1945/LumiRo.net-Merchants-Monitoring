define([
    "underscore"
    , "backbone"
    , "views/AppView"
], function(_, Backbone, App){
    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            "help": "help"
            , "settings" : "settings"

            , "merchants": "merchants"
            , "monitoring" : "monitoring"
            , "": "merchants"
        }
        , welcome: function(){
            this.App.welcome()
        }

        , merchants: function(){
            this.App.merchants()
        }

        , monitoring: function(){
            this.App.monitoring()
        }
        , settings: function(){
            this.App.settings()
        }
        , help: function(){
            this.App.help()
        }
        , initialize: function(){
            this.App = new App({router: this})
            Backbone.history.start()
        }
    })
    return ApplicationRouter
})
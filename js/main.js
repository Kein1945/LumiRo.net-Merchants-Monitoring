requirejs.config({
    paths: {
        jquery: 'libs/jquery.min'
        , underscore: 'libs/underscore-min'
        , 'underscore/chrome-render': 'libs/underscore/chrome-render'
        , backbone: 'libs/backbone/backbone-min'
        , 'backbone/storage': 'libs/backbone/localstorage'
        , bootstrap: 'libs/bootstrap.min'
        , 'bootstrap/box': 'libs/bootstrap/bootbox.min'
        // require js plugins
        , text: 'libs/plugins/text'
        , domReady: 'libs/plugins/domReady'
        , i18n:  'libs/plugins/i18n'
    },
    baseUrl: '/js'
});

requirejs([
    'jquery'
    , 'domReady'
    , 'router'
], function($, domReady, ApplicationRouter){
   domReady(function(){
       //$('#sandbox').load(function(){
               var router = new ApplicationRouter;
       //})
    })
});
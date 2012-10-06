var app = (function(){
    var updateBindingJSActions = function(){
        $('.cards').each(function(){
            $(this).popover({title: 'Cards', content: $(this).next().html(), trigger: 'hover'})
        })
        $('[rel="tooltip"]').tooltip()
//        $('[data-spy="scroll"]').each(function () {
//            var $spy = $(this).scrollspy('refresh')
//            console.log($spy);
//        });
    }
        , updateMerchantsSumProfit = function(){
        var li = $('#merchant-list-sidebar li');
        if( li.length > 1 ){
            profit = _.reduce(li, function(memo, li){ var pr = $(li).find('.profit').data('profit'); return memo + (pr?pr:0); }, 0);
            if(profit)
            $('#merchant-list-sidebar')
                .append($($('<li class="divider"></li>')))
                .append($('<li></li>').html('Итого: <span class="pull-right">+'+formatPrice(profit)+'</span>' ));
        }
    }
        , bindTabSwitcher = function(){
            $('a.tab-switch').bind('click',function(){
                $('.tab-pane').addClass('hide');
                $('a.tab-switch').parent().removeClass('active')
                $('#' + $(this).data('tab-id')).removeClass('hide')
                $(this).parent().addClass('active')
            })
        }
        , bindRefresh = function(){

            (function(){
                setTimeout(arguments.callee, 4*60000)
                redrawList()
                app.updateInterface()
            })();
            $('#refresh_data').bind('click', function(){
                updateData(function(){
                    app.updateInterface()
                })
            })
        }
        , bindMerchantActions = function(){
            $('a.refresh_merchant').live('click', function(){
                var merc = new Merchant($(this).data('name'))
                merc.renew(function(){
                    redrawList()
                })
            })
            $('a.remove_merchant').live('click', function(){
                var merc = new Merchant($(this).data('name'))
                merc.remove()
                redrawList()
            })
        } // Вреднота
        , bindAddMerchant = function(){
            $('#add_merchant').click(function(){
                var merchants = Tracker.listMerchants()
                var merchant_name = prompt('Введите имя торговца(если он поставлен на венд только что, вещи появятся скорее всего не сразу, а спустя некоторое время)','');
                if(merchant_name.length && !_.find(merchants, function(merc){ return merc.data.name == merchant_name })){
                    var merc = new Merchant(merchant_name);
                    merc.renew(function(){
                        merchants[merchants.length] = merc;
                        Tracker.updateMerchantsList(_.map(merchants, function(merc){ return merc.data.name }))
                        notify(merc.data.name, 'Новый венд. Данные торговца обновленны.');
                        redrawList();
                        updateRefreshTimer();
                    });
                    return ;
                }
            })
        }
        , updateData = function(callback_func){
            var merchants = Tracker.listMerchants();
            _.each(merchants, function(merchant){
                merchant.update(function(){
                    updateRefreshTimer()
                });
            })
        }
        , updateRefreshTimer = function(){
            var updateTime = localStorage.getObject('lastUpdate');
            if(updateTime) {
                var update = new Date()
                $('#last-update-time').html(update.getHours()+':'+update.getMinutes())
            }
        }
    return {
        init: function(){
            bindTabSwitcher()
            bindMerchantActions()
            bindRefresh()
            bindAddMerchant()
        }
        , updateInterface: function(){
            updateBindingJSActions()
            updateMerchantsSumProfit()
            updateRefreshTimer()
        }
        , openTab: function(name){
            $('a.tab-switch[data-tab-id="'+name+'-id"]').click()
        }
    }
})()

$(function(){
    $('#sandbox').load(function(){
        app.init()
        redrawList()
    })


})
function redrawList(){

    var waiting_templates = 0, itemList = $('<div></div>'), itemListSidebar = $('<div></div>');
    var updateMerchantsList = function(){
        $('#merchant-list').html(itemList.html())
        $('#merchant-list-sidebar').html(itemListSidebar.html())
        delete itemList;
        delete itemListSidebar;
        app.updateInterface()
    }
    var merchants = Tracker.listMerchants();
    _.each(merchants, function(merch){
        var template = getTemplate('item-merchant', $('#item-merchant').html())
        var templateSidebar = getTemplate('item-merchant-sidebar', $('#item-merchant-sidebar').html())
        waiting_templates++;
        template(merch.data, function(html){
            itemList.append($('<div></div>').html(html))
            waiting_templates--
            if(!waiting_templates)
                updateMerchantsList();
        })
        waiting_templates++
        templateSidebar(merch.data, function(html){
            itemListSidebar.append($('<li></li>').html(html))
            waiting_templates--
            if(!waiting_templates)
                updateMerchantsList();
        })
    })
}
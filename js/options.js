$(function(){
    $('#sandbox').load(function(){
        $('#itemList').sortable({ axis: 'y', connectWith: '.sortableUl', handle: '.drug-holder', cursor: 'move' , opacity: 0.5, delay: 200, update: function(){
            var reorder_track_list = [];
            $('.li-header .merchant-name').each(function(){
                reorder_track_list[reorder_track_list.length] = $(this).html();
                Tracker.updateList(reorder_track_list);
            })
        }});
  $('.itemlist li div.li-header a.m-set-time').live('click',function(){
    $(this).html('Обновляем...');
    mercName = $(this).parent().find('.merchant-name').html();
    Merchants.get(mercName).update(function(){
      redrawList();
    });
    return false;
  });
  $('.itemlist li div.li-header a.remove').live('click', function(){
    var mercName = $(this).parent().find('.merchant-name').html();
    if(confirm('Вы действительно хотите удалить торговца "'+mercName+'" ?')){
      var merc = Merchants.get(mercName);
      Merchants.remove(merc);
      redrawList();
    }
    return false;
  });
  $('.itemlist li div.li-header a.refresh').live('click', function(){
    var mercName = $(this).parent().find('.merchant-name').html();
    var merc = Merchants.get(mercName);
    merc.renew(function(){
      redrawList();
    });
    return false;
  });
  $('.merchant-name').live('click', function(){
    $(this).parent().toggleClass('minimized');
    var merc = Merchants.get($(this).html());
    merc.MercData.minimized = $(this).parent().hasClass('minimized');
    Merchants.persist(merc);
  });
  (function(){
    setTimeout(arguments.callee, 20*60000);
    redrawList();
  })();
  $('#btnAddNewItem').click(function(){
      var new_track = new Merchant(merchant_name)
      // Old version
    var time = new Date();
    var merchant_name = prompt('Введите имя торговца(если он поставлен на венд только что, вещи появятся скорее всего не сразу, а спустя некоторое время)','');
    if(merchant_name.length){
      var Merc = Merchants.get(merchant_name);
      Merc.renew(function(){
        notify(Merc.name, 'Новый венд. Данные торговца обновленны.');
        redrawList();
      });
      return ;
    }
  });
  $('#btnAddNewBuyItem').click(function(){
    var time = new Date();
    var merchant_name = prompt('Введите имя торговца(если он поставлен на венд только что, вещи появятся скорее всего не сразу, а спустя некоторое время)','La Chimiste');
    if(merchant_name.length){
      var merch = Merchants.get(merchant_name, true);
      merch.renew(function(){
        redrawList();
      });
      return ;
    }
  });

        // Notification checker
        (function (){
            var notify = $('#notify');
            if(localStorage.notify && localStorage.notify.length)
                notify.addClass('active', true);
            notify.click(function(){
                notify.toggleClass('active')
                localStorage.notify = notify.hasClass('active')?'active':'';
            });
        })();

    })
});

function showHelp(){
  if($('#info .infoblock').is(':hidden')){
    $('#info .infoblock').slideDown();
  } else {
    $('#info .infoblock').slideUp();
  }
}
function report(){
  $('#dump').html(localStorage.getMercData()).slideDown();
}
function redrawList(){

    var waiting_templates = 0, itemList = $('<div></div>');
    function updateList(){
        $('#itemList').html(itemList.html())
        delete itemList
    }
    Merchants.eachMerch(function(merch){
        var template = getTemplate('item-element', $('#item-element').html())
        waiting_templates++
        template(merch.getData(), function(html){
            itemList.append($('<div></div>').html(html))
            waiting_templates--
            if(!waiting_templates)
                updateList();
        })
    });
}
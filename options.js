$(function(){
  $('#itemList').sortable({ axis: 'y', connectWith: '.sortableUl', handle: '.drug-holder', cursor: 'move' , opacity: 0.5, delay: 200, update: function(){
    var reorder_merch_list = [];
    $('.li-header .merchant-name').each(function(){
      reorder_merch_list[reorder_merch_list.length] = $(this).html();
      Merchants.setList(reorder_merch_list);
    })
  } });
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
  if(typeof(localStorage.notify) == 'undefined' || !localStorage.notify.length){
    $('#notify input').attr('checked', true);
    $('#notify input').click(function(){
      localStorage.notify = this.checked?'':'false';
    });
  }
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
  $('#itemList').html('');
  Merchants.eachMerch(function(merch){
    $('#item-element').tmpl(merch.getData(),{
      formatPrice: function(value){
        return number_format(value, {decimals: 0, thousands_sep: "."});
      }
    }).appendTo('#itemList');
  });
}
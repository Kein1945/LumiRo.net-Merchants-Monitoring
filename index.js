(function(){
  var self = this;
  var PREFIX = 'MercList';
  /** Private */
  function getMerchantObj(name){
    merch = localStorage.getObject(PREFIX+name);
    return new Merchant(merch?merch:{name:name});
  }
  function setMerchantObj(merc){
    localStorage.setObject(PREFIX+merc.name, merc.getData());
  }

  this.persist = function(merchant){
    if(!this.exists(merchant.name)){
      merchants = this.getList();
      merchants[merchants.length] = merchant.name;
      self.setList(merchants);
    }
    setMerchantObj( merchant );
  }
  this.remove = function(merchant){
    merchants = this.getList(); nlist = [];
    for(i=0; i<merchants.length; i++)
      if(merchants[i] != merchant.name)
        nlist[nlist.length] = merchants[i];
    setMerchantObj(new Merchant({name:merchant.name}));
    self.setList(nlist);
  }
  this.exists = function(name){
    merchants = this.getList();
    for(i=0; i<merchants.length; i++) if(merchants[i] == name) return true;
    return false;
  }
  this.get = function(name){
    return getMerchantObj(name);
  }
  this.startUpdate = function(){
    self.eachMerch(function(merch){
      merch.update();
      Merchants.persist(merch);
    });
    setTimeout(arguments.callee, 5*60000);
  }
  this.eachMerch = function(callback_func){
    merchants = this.getList();
    for(var i=0; i<merchants.length; i++){
      callback_func( getMerchantObj(merchants[i]) );
    }
  }
  this.getList = function(){
    var list = localStorage.getObject(PREFIX);
    return list?list:[];
  }
  this.setList = function(List){
    localStorage.setObject(PREFIX, List);
  }

  this.loadData = function(name, callback_func){
    $.ajax({
      url: ('http://market.lumiro.net/'+'/whosell.php?s=' + encodeURI(name) + '&field=price&order=asc&rand=' + Math.random()),
      success: function(data){
        callback_func(parseData(data));
      }
    });
  };
  parseData = function(data){
    var ResultMatchRegExp = /tr\sclass="line(?:[\s\S]*?)div\sstyle="([\s\S]*?)"(?:[\s\S]*?)<small>([\d\+]*)<\/small>(?:[\s\S]*?)javascript:perf\('([\d]+)'\);">([^<]+?)<\/a>([\s\S]*?)<\/td>(?:[\s\S]*?)class="value">([\s\S]*?)class="value"\salign="right">([^<]+)<(?:[\s\S]*?)align="center">([^<]+)(?:[\s\S]*?)class="trader(?:[\s\S]*?)<a[^>]+>([^<]+)/gim
    items = [];
    a = [];
    while( (re = ResultMatchRegExp.exec(data)) ){
      tmp_cards = [];
      AditionalsString = re[6].trim();
      var creator = '';
      if(AditionalsString.length){
        var CardsRegExp = /javascript:perf\('[^']+'\);">([^<]+?)<\/a><\/td/gim;
        while( (card = CardsRegExp.exec(AditionalsString)) ){
          tmp_cards[tmp_cards.length] = card[1];
        }
        var CreatorRegExp = /javascript:perf\('[^']+'\);">([^<]+?)<\/a>'s/gim;
        if(creatorRExec = CreatorRegExp.exec(AditionalsString))
          creator = creatorRExec[1] + '\'s ';
      }
      a[a.length] = AditionalsString;
      items[items.length] = {
        style : re[1],
        id: re[3],
        name: creator+ re[4]+re[5].trim().replace(/\<a\shref=\"http:\/\/www.poring.ru\/.*?>[\s\S]*<img.*?>[\s\S]*?\<\/a>/gim, ''),
        refain: re[2],
        price: re[7],
        real_price: re[7].replace(/\./g,''),
        profit: 0,
        count: re[8],
        nowcount: re[8],
        attr: tmp_cards,
        owner: re[9],
      };

    }
    return items;
  }

  window['Merchants'] = this;
})()

var Merchant = function(data){
  var Merc = this;
  Merc.MercData = data;
  Merc.MercData.timed_profit = data.timed_profit?data.timed_profit:0;
  Merc.name = data.name;
  this.getData = function(){
    return Merc.MercData;
  }
  this.renew = function(callback){
    Merc.MercData = {name: Merc.name};
    Merc.update(callback?callback:function(){});
  };
  this.update = function(update_callback){
    Merchants.loadData(Merc.name, function(new_lst){
      old_lst = Merc.getItems();

      var items = [];
      var profit = 0;

      if(new_lst.length){
        if(!old_lst.length){
          old_lst = new_lst;
        } else {
          oichecked = new Array(); ichecked = new Array();
          for(i=0; i<old_lst.length; i++){
            ohash = itemHash(old_lst[i]);
            for(j=0; j<new_lst.length; j++){
              nhash = itemHash(new_lst[j]);
              if(!oichecked[ohash+i] && !ichecked[nhash+j] && nhash == ohash){
                oichecked[ohash+i] = true; ichecked[nhash+j] = true;
                old_lst[i].nowcount = new_lst[j].count;
              }
            }
          }

          for(i=0; i<old_lst.length; i++){
            ohash = itemHash(old_lst[i]);
            if(!oichecked[ohash+i]){
              old_lst[i].nowcount = 0;
            }
          }

          // Проверка, переставляли ли магазин?
          for(j=0; j<new_lst.length; j++){
            nhash = itemHash(new_lst[j]);
            for(i=0; i<old_lst.length; i++){
              var found = false;
              ohash = itemHash(old_lst[i]);
              if(nhash == ohash){
                found = true; break;
              }
            }
            if(!found){
              old_lst = new_lst;
              Merc.MercData.timed_profit = 0;
              Merc.MercData.profit = 0;
              notify(Merc.name, 'Новый венд. Данные торговца обновленны.');
              break;
            }
          }
        }
        for(i=0; i<old_lst.length; i++){
          if(old_lst[i].owner == Merc.name){
            old_lst[i].profit = (old_lst[i].count - old_lst[i].nowcount) * old_lst[i].real_price;
            items[items.length] = old_lst[i];
            profit += old_lst[i].profit;
          }
        }
      }
      var time = new Date();
      Merc.MercData.items = items;
      Merc.MercData.profit = profit;
      if(Merc.MercData.timed_profit < Merc.MercData.profit){
        notify(Merc.name, '+ '+number_format(Merc.MercData.profit - Merc.MercData.timed_profit, {decimals: 0, thousands_sep: "."}));
        Merc.MercData.timed_profit = Merc.MercData.profit;
      }
      var hours=time.getHours();
      var minutes=time.getMinutes();
      if(minutes<10) minutes='0'+minutes;
      Merc.MercData.refreshed = hours+':'+minutes;
      Merchants.persist(Merc);
      update_callback?update_callback():false;
    });
  };
  this.getItems = function(){
    return Merc.MercData.items?Merc.MercData.items:[];
  };
  this.eachItem = function(func){
    var items = self.getItems();
    for(i in items){
      func(i, items[i]);
    }
  };

  //refreshed: time.getHours()+':'+time.getMinutes(),
  //time: time.getHours()+':'+time.getMinutes()+' '+time.getDate()+'/'+time.getMonth(),
}

function itemHash(item){
  return item.id+item.refain+item.price+item.attr.join('|');
}
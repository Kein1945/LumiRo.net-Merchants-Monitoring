
function bindCardsPopover(){
    $('.cards').each(function(){
        $(this).popover({
            title: 'Cards'
            , content: $(this).next().html()
        })
    })
}

$(function(){

    // merchant-list
    bindCardsPopover();
    $('#sandbox').load(function(){
        redrawList()
    })
})
function redrawList(){

    var waiting_templates = 0, itemList = $('<div></div>'), itemListSidebar = $('<div></div>');
    function updateList(){
        $('#merchant-list').html(itemList.html())
        $('#merchant-list-sidebar').html(itemListSidebar.html())
        delete itemList
        bindCardsPopover()
    }
    Merchants.eachMerch(function(merch){
        var template = getTemplate('item-merchant', $('#item-merchant').html())
        var templateSidebar = getTemplate('item-merchant-sidebar', $('#item-merchant-sidebar').html())
        waiting_templates++
        template(merch.getData(), function(html){
            itemList.append($('<div></div>').html(html))
            waiting_templates--
            if(!waiting_templates)
                updateList();
        })
        waiting_templates++
        templateSidebar(merch.getData(), function(html){
            itemListSidebar.append($('<li></li>').html(html))
            waiting_templates--
            if(!waiting_templates)
                updateList();
        })
    });
}
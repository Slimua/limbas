/**
 * Global variables
 */
var noMoreRefresh = 0;
var refreshMultiPreview = [];
var hide_sidenav_size = 200;
var hide_multiframe_size = 200;
var dropel = null;
var posx = null;
var elwidth = null;
var scrollbarWidth = null;
var typingTimer;
var typingInterval = 500; // ms
var activ_menu = null;
var activ1 = 0;
var activ2 = 0;


$(function(){
   $('.evt-hide-frame-con').contextmenu(hide_frame);
   $('.evt-hide-frame').click(hide_frame);
   $('[data-showframe]').click(hide_frame);


    $(".lmbfringeFrameNav a").click(function(e) {
        e.stopPropagation();
    });

    startautoopen();

    $('[data-mid]').click(setMultitenant);
});


/** Linkfunktionen */

browserType();

/* ---------------- User ------------------ */
function f_2(act,frame1,frame2,main) {
    window.main.location.href = "main.php?action="+ act + "&frame1para=" + frame1 + "&frame2para=" + frame2;
}

function f_3(act,frame1,frame2) {
    window.main.location.href = "main_admin.php?action="+ act + "&frame1para=" + frame1 + "&frame2para=" + frame2;
}

function f_4(PARAMETER) {
    watcher = open("main_admin.php?action="+ PARAMETER+ "" ,"watcher","toolbar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0,width=400,height=500");
}

function print_report(tabid,value,defformat) {
    window.main.location.href="main.php?action=report&gtabid="+tabid+"&report_id="+value+"&report_medium="+defformat;
}





function hideShow(event, name, show=false, noAjax=false){
    event.stopPropagation();

    var $el = $('#CONTENT_' + name).parent();
    var $angle = $('#HS' + name);

    if (!$el.hasClass('open') || show) {
        $el.addClass('open');
        $angle.removeClass("lmb-angle-down").addClass("lmb-angle-up");
        show = 1;
    } else {
        $el.removeClass('open');
        $angle.removeClass("lmb-angle-up").addClass("lmb-angle-down");
        show = 0;
    }

    if (!noAjax) {
        ajaxGet(null,'main_dyns.php','layoutSettings&menu='+name+'&show='+show,null);
    }
}



function hideShowSub(event, div, elt, noAjax=false){
    event.stopPropagation();

    var subMenu = $('#subElt_'+elt);
    if(subMenu.length <= 0) return;

    var arrowIcon = $('i[id^=arrowSub' + elt + ']').filter(':visible').first(); // because the id was given twice, once in a hidden div
    if(!arrowIcon) return;

    var show;
    if(arrowIcon.hasClass('lmb-caret-down')){
        arrowIcon.removeClass('lmb-caret-down').addClass('lmb-caret-right');
        subMenu.parent().removeClass('open');
        show = 0;
    }else{
        arrowIcon.removeClass('lmb-caret-right').addClass('lmb-caret-down');
        subMenu.parent().addClass('open');
        show = 1;
    }
    if (!noAjax) {
        ajaxGet(null, 'main_dyns.php', 'layoutSettings&submenu=' + div + '_' + elt + '&show=' + show, null);
    }
}


function hideShowMulti(evt,id,name,gtabid,params,type,manual){

    var $angle = $('#HS' + id);
    var $el = $angle.parents('li');


    if ($el.hasClass('open')) {
        $el.removeClass('open');
        $angle.removeClass("lmb-angle-up").addClass("lmb-angle-down");
        if(type && refreshMultiPreview[id]){clearInterval(refreshMultiPreview[id])}
        if(evt){ajaxGet(null,'main_dyns.php','layoutSettings&menu='+name+'&show=0',null);}
    }else if(evt === null || (!evt.shiftKey && !evt.ctrlKey)){
        $el.addClass('open');
        $angle.removeClass("lmb-angle-down").addClass("lmb-angle-up");
        if(evt){ajaxGet(null,'main_dyns.php','layoutSettings&menu='+name+'&show=1',null);}
        if(type){limbasMultiframePreview(id,type,manual,0,gtabid,params);}
    }else if(evt.shiftKey || evt.ctrlKey){
        limbasMultiframePreview(id,type,manual,0,gtabid,params);
    }
}


function hide_frame(e){

    var isSidenav;
    var showframe = $(this).data('showframe');

    if (showframe === 'sidenav') {
        isSidenav = true;
    } else {
        isSidenav = ($(this).parents('#sidenav').length > 0);
    }

    var hiddenDiv;
    var multiDiv;

    if (isSidenav) {
        hiddenDiv = $('#hiddensidenav');
        multiDiv = $('#sidenav');
    } else {
        hiddenDiv = $('#hiddenmultiframe');
        multiDiv = $('#multiframe');
    }


    var navFrame = $(this).parents('.mainsidebar');

    var navFrameWidth = navFrame.width();

    var newWidth;
    var frameSize;
    if (navFrameWidth <= 30) {
        hiddenDiv.hide();
        multiDiv.show();
        navFrame.addClass('open');
        frameSize = 0;
        if (isSidenav) {
            newWidth = hide_sidenav_size;
        } else {
            newWidth = hide_multiframe_size;
            noMoreRefresh = 0;
        }
    } else {
        newWidth = 15;
        hiddenDiv.show();
        multiDiv.hide();
        navFrame.removeClass('open');
        frameSize = newWidth;
        if (!isSidenav) {
            noMoreRefresh = 1;
        }
    }


    if (isSidenav) {
        ajaxGet(null, 'main_dyns.php', 'layoutSettings&frame=nav&size=' + frameSize, null);
    } else {
        ajaxGet(null, 'main_dyns.php', 'layoutSettings&frame=multiframe&size=' + frameSize, null);
    }




    navFrame.width(newWidth);

    document.onmouseup = null;
    document.onmousemove = null;
    return false;
}





function lmbIniDrag(evt,el) {
    dropel = el;
    document.onmouseup = lmbEndResizeFrame;
    elwidth = el.offsetWidth;
    if(browser_ns5){
        posx = evt.screenX;
    }else{
        posx = window.event.screenX;
    }
    document.onmousemove = lmbResizeFrame;


    scrollbarWidth = el.scrollHeight > el.clientHeight ? lmbGetScrollbarWidth() : 0;
    return false;
}

// https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript
function lmbGetScrollbarWidth() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}

function lmbEndResizeFrame(e) {
    var isSidenav = ($(e.target).parents('#sidenav').length > 0);

    document.onmouseup = null;
    document.onmousemove = null;

    var elw = dropel.offsetWidth;
    if(elwidth > 50 && elwidth < 400 && Math.abs((elw-elwidth)) > 10 ){
        if (isSidenav) {
            hide_sidenav_size = elw+10;
            ajaxGet(null,'main_dyns.php','layoutSettings&frame=nav&size='+elw,null);
        }
        else {
            hide_multiframe_size = elw+10;
            ajaxGet(null,'main_dyns.php','layoutSettings&frame=multiframe&size='+elw,null);
        }
    }

    return false;
}

function lmbResizeFrame(e) {

    var isSidenav = ($(e.target).parents('#sidenav').length > 0);


    var evw; // drag width
    if(browser_ns5) {
        evw = e.screenX - posx;
    } else {
        evw = window.event.screenX - posx;
    }

    // 5px minimum drag distance
    if(Math.abs(evw) < 5) { return false; }

    // destination width


    var dw;
    if (isSidenav) {
        dw = evw + elwidth + scrollbarWidth;
        if (evw < 0) {
            dw += 10;
        }
    } else {
        dw = (elwidth + scrollbarWidth) - evw;
        if (evw > 0) {
            dw += 10;
        }
    }

    // max/min width
    if(dw > 400 || dw < 50) { return false; }

    // catch click event after resize
    var captureClick = function(e) {
        e.stopPropagation(); // Stop the click from being propagated.
        this.removeEventListener('click', captureClick, true); // cleanup
    };
    dropel.addEventListener(
        'click',
        captureClick,
        true
    );


    $(e.target).parents('.mainsidebar').width(dw);

    return false;
}

function lmb_treeElOpen(treeid,tabid,elid,rand){
    var elname = treeid+'_'+tabid+'_'+elid+'_'+rand;
    var el = document.getElementById('lmbTreeEl_'+elname);
    var img_src = document.getElementById('lmbTreePlus_'+elname).src;

    if(el.style.display == 'none'){
        el.style.display = '';
        document.getElementById('lmbTreePlus_'+elname).src = img_src.replace(/(plus)/,"minus");
    }else{
        el.style.display = 'none';
        document.getElementById('lmbTreePlus_'+elname).src = img_src.replace(/(minus)/,"plus");
    }
}


function lmb_treeOpen(treeid,tabid,id){

    if(id.length>0 && document.getElementById("img"+treeid)){
        var img_src = document.getElementById("img"+treeid).src;
        if(img_src && img_src.match(/(minus)+/g)){
            document.getElementById("img"+treeid).src = img_src.replace(/(minus)/,"plus");
            document.getElementById(treeid).style.display = "none";
            return;
        }
        if(document.getElementById(treeid)
            && document.getElementById(treeid).innerHTML.length>1
            && img_src.match(/(plus)+/g)){
            document.getElementById("img"+treeid).src = img_src.replace(/(plus)/,"minus");
            document.getElementById(treeid).style.display = "";
            return;
        }
    }

    ajaxGet(null,"main_dyns.php","getRelationTree&gtabid="+tabid+"&treeid="+treeid,null,"","",treeid);
}


function lmb_treeSubOpen(treeid,tabid,elid,rand,gtabid,rkey){

    var elname = treeid+'_'+tabid+'_'+elid+'_'+rand;
    var el = document.getElementById('lmbTreeTR_'+elname);
    var img_src1 = document.getElementById('lmbTreeSubPlus_'+elname).src;

    if(el.style.display == 'none'){
        el.style.display = '';
        document.getElementById('lmbTreeSubPlus_'+elname).src = img_src1.replace(/(plus)/,"minus");

        if($('#lmbTreeSubBox_'+elname).hasClass('lmb-folder-closed')){
            $('#lmbTreeSubBox_'+elname).removeClass('lmb-folder-closed');
            $('#lmbTreeSubBox_'+elname).addClass('lmb-folder-open');
        }
    }else{
        el.style.display = 'none';
        document.getElementById('lmbTreeSubPlus_'+elname).src = img_src1.replace(/(minus)/,"plus");

        if($('#lmbTreeSubBox_'+elname).hasClass('lmb-folder-open')){
            $('#lmbTreeSubBox_'+elname).removeClass('lmb-folder-open');
            $('#lmbTreeSubBox_'+elname).addClass('lmb-folder-closed');
        }
    }

    ajaxGet(null,"main_dyns.php","getRelationTree&gtabid="+tabid+"&treeid="+treeid+"&verkn_tabid="+gtabid+"&verkn_fieldid="+rkey+"&verkn_ID="+elid,null,"","","lmbTreeDIV_"+elname);

}


function lmbTreeOpenTable(gtabid,verkn_tabid,verkn_fieldid,verkn_ID){
    parent.main.location.href='main.php?action=gtab_erg&verknpf=1&verkn_showonly=1&verkn_ID='+verkn_ID+'&gtabid='+gtabid+'&verkn_tabid='+verkn_tabid+'&verkn_fieldid='+verkn_fieldid;
}

function lmbTreeOpenData(gtabid,ID,verkn_tabid,verkn_fieldid,verkn_ID,form_id){
    var url = '';
    if(verkn_ID && verkn_tabid && verkn_fieldid){
        url += '&verkn_ID='+verkn_ID+'&verkn_tabid='+verkn_tabid+'&verkn_fieldid='+verkn_fieldid+'+&verknpf=1&verkn_showonly=1';
    }
    if(form_id){
        url += '&form_id='+form_id;
    }

	parent.main.location.href='main.php?action=gtab_change&gtabid='+gtabid+'&ID='+ID+url;
}


function format_tree(elemid){
    var tmp = document.getElementsByTagName("a");
    var elems = new Array();
    if(tmp && tmp.length>0){
        var i,s;
        for(i=0;i<tmp.length;i++){
            s = tmp[i].id;
            if(!s) continue;

            if(s.match(/(atitle)+/g)){
                elems.push(tmp[i]);
                if(tmp[i].id=="atitle"+elemid){
                    for(var k=elems.length;k>0;k--){
                        if(elems[k-1].className==tmp[i].className && elems[k-1].id!=tmp[i].id)
                            continue;
                        elems[k-1].style.fontWeight = "bold";
                        if(elems[k-1].className=="atitle_level0") break;
                    }
                }else
                    tmp[i].style.fontWeight = "normal";
            }
        }
    }
    return true;
}



// add clicked menu item to favorites
function addToFavorites(evt) {
    // only add if shift is pressed
    if (!evt.shiftKey)
        return;

    // stop click event
    evt.preventDefault();
    evt.stopImmediatePropagation();
    evt.stopPropagation();

    // get menu item id
    const target = $(this);
    const type = target.attr("data-lmb-type");
    const tabid = target.attr("data-lmb-tabid");
    const id = target.attr("data-lmb-id");
    const idStr = id ? ("&id=" + id) : "";

    ajaxGet(null, "main_dyns.php", "addToFavorites&type=" + type +"&tabid=" + tabid + idStr, null, function() {
        document.location.href = "main.php?&action=nav&sparte=gtab&tab_group=1&refresh=no";
    });
}
// add star icon to menu item
function addFavIconTo(elem) {
    if (elem.children().not("i").length > 0) {
        if (elem.children().children("i[data-lmb-fav-icon]").length > 0)
            return;
        elem.children().first().append("<i class=\"lmb-icon lmb-fav\" data-lmb-fav-icon></i>");
    } else {
        if (elem.children("i[data-lmb-fav-icon]").length > 0)
            return;
        elem.append("<i class=\"lmb-icon lmb-fav\" data-lmb-fav-icon></i>");
    }
}
// remove star icon from menu item
function removeFavIconFrom(elem) {
    if (elem.children().not("i").length > 0) {
        elem.children().children("i[data-lmb-fav-icon]").remove();
    } else {
        elem.children("i[data-lmb-fav-icon]").remove();
    }
}
// add onclick listener to add menu item to favorites
$(function() {
    $("[data-lmb-type][data-lmb-tabid]").on('click', addToFavorites);

    $('body').on('mousemove', function(evt) {
        var added = ($(this).attr('data-lmb-added') === 'true');
        if (evt.shiftKey && !added) {
            $(this).attr('data-lmb-added', 'true');
            $("[data-lmb-type][data-lmb-tabid]")
                .each(function () { addFavIconTo($(this)); });
        } else if (!evt.shiftKey && added) {
            $(this).attr('data-lmb-added', 'false');
            $("[data-lmb-type][data-lmb-tabid]")
                .each(function () { removeFavIconFrom($(this)); });
        }
    });
});

// show shadow on scroll
$(function() {
    $(document).scroll(function() {
        const searchTable = $("table.lmbfringeMenuSearch");
        if ($("body").scrollTop() > 0) {
            searchTable.css("box-shadow", "0 4px 2px -2px gray");
        } else {
            searchTable.css("box-shadow", "");
        }
    });
});



function lmbFilterTablesTimer(event, searchFieldEl, navID) {
    clearTimeout(typingTimer);

    if (event.code === "Enter" || event.code === "Escape") {
        // filter now
        lmbFilterTables(event, searchFieldEl, navID, true);
    } else {
        // filter tables after <typingInterval> ms without keyup
        typingTimer = setTimeout(function() { lmbFilterTables(event, searchFieldEl, navID); }, typingInterval);
    }
}



function startautoopen(){
    var t = 0;
    $('[data-autoopen]').each(function(){
        t = t + 1000;
        window.setTimeout($(this).data('autoopen'), t);
    });
}


// window open
function open_quickdetail(gtabid,ID,form_id){
    newwin=open("main.php?action=gtab_change&gtabid="+gtabid+"&ID="+ID+"&form_id="+form_id ,"quickdetail","toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=850,height=500");
}


function divclose() {
    if(!activ_menu){
        document.getElementById("frmlist").style.visibility='hidden';
    }
    activ_menu = 0;
}

// Schließe alle Context-Menüs bei Klick auf Hintergrund
function body_click(){
    window.setTimeout("divclose()", 50);
}



function limbasMultiframePreview(id,type,manual,dropitem,gtabid,params){
    if(!noMoreRefresh || manual){
        ajaxGet(0,"main_dyns.php","multiframePreview&limbasMultiframeItem="+type+"&id="+id+"&gtabid="+gtabid+"&dropitem="+dropitem+"&"+params,null,"limbasMultiframePreviewPost");
        if (refreshMultiPreview[id]) {
            window.clearInterval(refreshMultiPreview[id]);
        }
        var fct = "limbasMultiframePreview(" + id + ",'" + type + "',0,0,'"+gtabid+"','"+params+"')";
        var rateEl = document.getElementById("autorefreshPreviewWorkflow_"+id);
        if(rateEl && rateEl.value){
            var rate = rateEl.value;

            refreshMultiPreview[id] = window.setInterval(fct,rate*60*1000);
        }
    }
}

function limbasMultiframePreviewPost(string){
    var string_ = string.split("#L#");
    var string_type = string_[0].trim();
    var string_value = string_[1].trim();
    var ldmfpstring = document.getElementById("limbasDivMultiframePreview"+string_type);
    if(string != "" && ldmfpstring){
        ldmfpstring.innerHTML = string_value;
        ldmfpstring.style.visibility = "visible";
    }
}

/**
 * Filters a nav entry s.t. only subentries matching the search text are shown
 * @param event keydown event
 * @param searchFieldEl search text field
 * @param navID id of .mainmenu
 * @param enterPressed whether the enter key was pressed -> click search result if only one found
 */
function lmbFilterTables(event, searchFieldEl, navID, enterPressed=false) {
    const nav = $('#' + navID);
    const searchField = $(searchFieldEl);

    /**
     * Closes a nav entry
     * @param el li element
     * @param reset true if no helper-classes should be added (during reset)
     */
    const close = function(el, reset=false) {
        if (!el.length) {
            return;
        }

        // remove hidden status from hidden elements s.t. they can be open again
        const body = el.children(':last');
        body.find('.lmb-table-search-hide').removeClass('lmb-table-search-hide');

        // mark as open s.t. body is shown
        if (!el.hasClass('open')) {
            return;
        }
        el.removeClass('open');
        if (!reset) {
            el.addClass('lmb-table-search-closed');
        }

        const header = el.children(':first');
        const caretIcon = header.find('.lmb-caret-down');
        if (caretIcon.length) {
            caretIcon.removeClass('lmb-caret-down').addClass('lmb-caret-right');
            return;
        }

        const angleIcon = header.find('.lmb-angle-up');
        if (angleIcon.length) {
            angleIcon.removeClass('lmb-angle-up').addClass('lmb-angle-down');
            return;
        }

        console.warn('No .lmb-angle-up or .lmb-caret-down icon found in element', header);
    };

    /**
     * Opens a nav entry
     * @param el li element
     * @param reset true if no helper-classes should be added (during reset)
     */
    const open = function(el, reset=false) {
        if (!el.length || el.hasClass('open')) {
            return;
        }
        el.addClass('open');
        if (!reset) {
            el.addClass('lmb-table-search-opened');
        }

        // exchange open/close icons
        const header = el.children(':first');
        const caretIcon = header.find('.lmb-caret-right');
        if (caretIcon.length) {
            caretIcon.removeClass('lmb-caret-right').addClass('lmb-caret-down');
            return;
        }

        const angleIcon = header.find('.lmb-angle-down');
        if (angleIcon.length) {
            angleIcon.removeClass('lmb-angle-down').addClass('lmb-angle-up');
            return;
        }

        console.warn('No .lmb-caret-right or .lmb-angle-down icon found in element', header);
    };

    /**
     * Removes all .lmb-table-search-* classes
     */
    const resetClasses = function(elem) {
        elem.find('.lmb-table-search-hide').removeClass('lmb-table-search-hide');
        elem.find('.lmb-table-search-popup').removeClass('lmb-table-search-popup').hide();
        elem.find('[lmb-table-search-onclick]').each(function() {
            $(this).attr('onclick', $(this).attr('lmb-table-search-onclick'));
            $(this).removeAttr('lmb-table-search-onclick');
        });
        elem.find('.lmb-table-search-opened').removeClass('lmb-table-search-opened').filter('.open').each(function() {
            close($(this), true);
        });
        elem.find('.lmb-table-search-closed').removeClass('lmb-table-search-closed').not('.open').each(function() {
            open($(this), true);
        });
        elem.find('.lmb-table-search-result').removeClass('lmb-table-search-result');
    };

    // restore to defaults
    resetClasses(nav);

    // clear text on escape key
    if (event && event.keyCode === 27) {
        searchField.val('');
    }

    // abort if no text
    const text = searchField.val().toLowerCase();
    const textUpper = text.toUpperCase();
    if (!text) {
        return;
    }

    /**
     * Replaces the default onclick with a custom onclick that prevents ajax calls
     * @param elem
     */
    const replaceOnclick = function(elem) {
        if (!elem.length) {
            return true;
        }
        const oldOnclick = elem.attr('onclick');
        elem.attr('lmb-table-search-onclick', oldOnclick);

        const newOnclick = oldOnclick
            .replace(/hideShowSub\((.*?)\)/, "$`hideShowSub($1, true)$'")
            .replace(/hideShow\((.*?)\)/, "$`hideShow($1, false, true)$'");
        elem.attr('onclick', newOnclick);

        return oldOnclick === newOnclick;
    };

    /**
     * Returns true if the action matches the search text and is not a 'new dataset' entry
     * @param action
     * @returns boolean
     */
    const levelNActionMatches = function(action) {
        if (action.find('[data-newrec]').length) {
            return false;
        }
        return textMatches(action.find('.lmbMenuItemBodyNav'));
    };

    /**
     * Returns true if the table's name/id/relations match the search text
     * @param header
     * @returns boolean
     */
    const levelLHeaderMatches = function(header) {
        // tabid
        var tabID = header.attr('data-lmb-tabid');
        if (tabID && tabID === text) {
            return true;
        }

        // form/rep/snapshot id
        var anyID = header.attr('data-lmb-id');
        if (anyID && anyID === text) {
            return true;
        }

        // physical table name
        var tabName = header.attr('data-lmb-table');
        if (tabName && tabName.toLowerCase().indexOf(text) >= 0) {
            return true;
        }

        // relations
        var relations = header.data('lmb-relations');
        if (relations && relations.indexOf(textUpper) === 0) {
            return true;
        }

        return textMatches(header);
    };

    /**
     * @param el ul element
     * @returns boolean true if any nav entry under el matches the search string
     */
    const bodyMatches = function(el) {
        return 0 < el.children('li').filter(function() {
            // filter tables (level > 0)
            const header = $(this).children(':first');
            const body = $(this).children(':last');
            if (!header.is(body)) {
                if (bodyMatches(body)) { //recursive call
                    // show body (expand)
                    open($(this));
                    if (levelLHeaderMatches(header)) {
                        $(this).addClass('lmb-table-search-result');
                    }
                } else if (levelLHeaderMatches(header)) {
                    // hide body (collapse)
                    close($(this));
                    $(this).addClass('lmb-table-search-result');
                } else {
                    // hide whole entry (header + body)
                    $(this).addClass('lmb-table-search-hide');
                    return false;
                }

                // replace onclick with no-ajax-onclick
                replaceOnclick(header.children('span'));
                return true;
            }

            // filter table actions (last level)
            const action = $(this).children('span');
            if (action.length) {
                if (levelNActionMatches(action)) {
                    $(this).addClass('lmb-table-search-result');
                    return true;
                } else {
                    action.addClass('lmb-table-search-hide');
                }
            }
            return false;
        }).length;
    };

    /**
     * @param el any jQuery element
     * @returns boolean true if text matches search text
     */
    const textMatches = function(el) {
        return el.text().trim().toLowerCase().indexOf(text) >= 0;
    };

    // filter level0 entries and recursively advance
    nav.children('li').each(function(index) {
        // skip search bar
        if (index === 0) {
            return;
        }

        // filter table group (level 0)
        const header = $(this).children(':first');
        const body = $(this).children(':last');
        if (bodyMatches(body)) {
            // show body (expand)
            open($(this));

            // replace onclick with no-ajax-onclick
            replaceOnclick($(this));
        } else if (textMatches(header)) {
            // hide body (collapse)
            close($(this));

            // replace onclick with no-ajax-onclick
            const hasOnclick = replaceOnclick($(this));

            // mark level0 header as search result if it has onclick other than 'hideShow'
            // this will click the entry automatically if it is the only search result
            if (hasOnclick) {
                $(this).addClass('lmb-table-search-result');
            }
        } else {
            // hide whole entry (header + body)
            $(this).addClass('lmb-table-search-hide');
        }
    });

    // enter pressed and only one search result -> perform click
    if (enterPressed) {
        const results = nav.find('.lmb-table-search-result');
        if (results.length === 1) {
            if (results.is('[onclick]')) {
                results.click();
            } else if (results.children('a').length) {
                results.children('a').click();
            } else if (results.children('span').length) {
                results.children('span').find('a').click();
            }
        }
    }
}

function srefresh(el=null) {
    // start rotating icon
    var icon = null;
    if (el) {
        icon = $(el).find('i');
        icon.addClass('lmb-rotating');
        icon.css('color', '#e4d314');
    }

    $.ajax({
        url: 'main.php?action=sess_refresh&sess_refresh=1'
    }).done(function() {
        icon.removeClass('lmb-rotating').css('color', '');
    });
}





function infos(){
    parent.main.location.href='main.php?&action=nav_info';
    //information = open("main.php?&action=nav_info" ,"Infos","toolbar=1,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=800,height=600");
}






function openMenu(id){
    mainMenu(id);
}


function setMultitenant() {
    if ($(this).hasClass('disabled')) {
        return;
    }

    var active = $('[data-mid].disabled').removeClass('disabled border-bottom');


    $(this).addClass('disabled border-bottom').insertBefore(active);

    var id = $(this).data('mid');
    $('.active-tenant').text($(this).data('mname'));

    ajaxGet(null,'main_dyns.php','setMultitenant&mid='+id,'','');
}

function logout(){
    ajaxGet(null,'main_dyns.php','logout&logout=1','','logout_callback');
}

function logout_callback(result){
    window.location.href = 'index.php';
}


// sets active class
function limbasSetActiveClass(el,parentid,element) {
    $(''+parentid).find(element).removeClass('active');
    $(el).addClass('active');
}

function mainMenu(menu){

    $('.mainmenu').hide();
    $('#' + menu)
        .show()
        .find('.sidenav-quicksearch input')
        .focus();
}

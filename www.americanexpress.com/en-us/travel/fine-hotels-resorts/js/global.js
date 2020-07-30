// updated 3/18/2019 11:05am for testing Akamai purge
// all these are used for the filtering
"use strict";

var globalBasePath;
function getBaseUrl() {
	if (globalBasePath)
		return globalBasePath;
	var pat = /\/(en|fr|de|ja)-([a-zA-Z]{2})\/travel\/[^\/]*\//g
	var href = location.href.toLowerCase();

	if (pat.test(href)) {
		pat.lastIndex = 0;//reset to first
		let match = pat.exec(href);
		globalBasePath = match[0];
	}
	else {
		globalBasePath = "/";
	}
	return globalBasePath;
}

// all these are used for the filtering
function isSuperset(set, subset) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = subset[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var elem = _step.value;

            if (!set.has(elem)) {
                return false;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return true;
}

function union(setA, setB) {
    var _union = new Set(setA);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = setB[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var elem = _step2.value;

            _union.add(elem);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return _union;
}

function intersection(setA, setB) {
    var _intersection = new Set();
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = setB[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var elem = _step3.value;

            if (setA.has(elem)) {
                _intersection.add(elem);
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return _intersection;
}

function difference(setA, setB) {
    var _difference = new Set(setA);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = setB[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var elem = _step4.value;

            _difference.delete(elem);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    return _difference;
}
/*
function isSuperset(set, subset) {
    for (var elem of subset) {
        if (!set.has(elem)) {
            return false;
        }
    }
    return true;
}

function union(setA, setB) {
    var _union = new Set(setA);
    for (var elem of setB) {
        _union.add(elem);
    }
    return _union;
}

function intersection(setA, setB) {
    var _intersection = new Set();
    for (var elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

function difference(setA, setB) {
    var _difference = new Set(setA);
    for (var elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}
*/

var allComboSets = []; // array of Sets containing collections for selected regions
var comboSets = []; // array of Sets containing collections for selected regions
var masterSet;
var excludedRegions = [];

function InitMasterSet() {
	comboSets = [];

	regionCollections.forEach( function(element){
		comboSets.push(new Set(element.collections));
	});

	masterSet = new Set();
	comboSets.forEach( function(element){
		masterSet = union(masterSet, element);
	});

	allComboSets = comboSets;
	
//	regionCollections.forEach( function(element){
//		if (jQuery.inArray(element.region, regionsSelected)) {
//			comboSets.forEach( function(element){
//				masterSet = union(masterSet, element.collections);
//			});
//		}
//	});
}

function InitComboSetsForSelectedRegions() {
	var valueSelector = function() { 
		return $(this).attr("value"); 
	};
	var regionsSelected = $(".region-picks :checkbox:checked").map(valueSelector);
	
	if (regionsSelected.length == 0)
	{
		// enable all  (TODO: use master list, as some may need to be disabled)
		//selectedSet = masterSet;
		$(".collection-picks :checkbox").prop("disabled",false);
		//return;
	}
	
	comboSets = [];
	regionCollections.forEach( function(element){
		var regionid = element.regionid;
		if (regionsSelected.length == 0 ||
			jQuery.inArray(regionid, regionsSelected) != -1) {
			element.collections.forEach( function(ary) {
				comboSets.push(new Set(ary));
			});
		}
	});

	if (regionCollections.length == 0)
	{
		comboSets = allComboSets;
	}
	
	FilterCollectionCombos();
}

function DisableUnselectableRegions(selectedCollectionSet)  {
	var enabledRegions = [];
	var supersetTest = function (collection) {
			var collectionSet = new Set(collection);
			return isSuperset(collectionSet, selectedCollectionSet);
		};
	
	regionCollections.forEach( function(regionElement){
		var region = regionElement.regionid;
		if (regionElement.collections.some(supersetTest))
			enabledRegions.push(region);
	});
	
	$('.region-picks :checkbox').prop("disabled",true);

	var ctls = $('.region-picks :checkbox').filter(function(){
		var region = $(this).attr("value");
		var isInList = jQuery.inArray(region, enabledRegions) != -1;
		//console.log('Region "' + region + '" is in enabled regions list');
		return isInList;
	});
	ctls.prop("disabled",false);
}

"use strict";

function FilterCollectionCombos() {
	var selectedCollections = [];
	// Filter above sets to 
	var idSelector = function idSelector() {
		selectedCollections.push(parseInt(this.value));
	};
	var selectedCheckboxes = $(".collection-picks :checkbox:checked");
	selectedCheckboxes.map(idSelector);
	var selectedCollectionSet = new Set(selectedCollections);
	var result;

	if (selectedCollectionSet.size == 0 && comboSets.length == 0) {
		// enable all  (TODO: use master list, as some may need to be disabled)
		//selectedCollectionSet = masterSet;
		//$('.collection-picks :checkbox').prop("disabled",true);

		$('.collection-picks :checkbox').prop("disabled", false);
		$('.region-picks :checkbox').prop("disabled", false);
		updateMatchCount();
		return;
	} else {
		result = comboSets.filter(function (x) {
			return isSuperset(x, selectedCollectionSet);
		});
	}

	// now union the resulting arrays
	var superset = new Set();
	result.forEach(function (element) {
		superset = union(superset, element);
	});

	var enabledCtls = $('.collection-picks :checkbox').filter(function () {
		var v = this.value;
		var i = parseInt(v);
		var x = superset.has(i);
		return x;
	});
	$(enabledCtls).prop("disabled", false);

	var disabledCtls = $('.collection-picks :checkbox').filter(function () {
		var v = this.value;
		var i = parseInt(v);
		var x = !superset.has(i);
		return x;
	});
	$(disabledCtls).prop("disabled", true);

	DisableUnselectableRegions(selectedCollectionSet);
	updateMatchCount();
}
/*
function FilterCollectionCombos() {
	// Filter above sets to 
	var idSelector = function() { return parseInt(this.value); };
	var selectedCheckboxes = $(".collection-picks :checkbox:checked");
	var selectedCollections = selectedCheckboxes.map(idSelector);
	var selectedCollectionSet = new Set(selectedCollections);
	var result;

	if (selectedCollectionSet.size == 0 && comboSets.length == 0)
	{
		// enable all  (TODO: use master list, as some may need to be disabled)
		//selectedCollectionSet = masterSet;
		//$('.collection-picks :checkbox').prop("disabled",true);
		
		$('.collection-picks :checkbox').prop("disabled",false);
		$('.region-picks :checkbox').prop("disabled",false);
		updateMatchCount();
		return;
	}
	else {
		result = comboSets.filter(x => isSuperset(x, selectedCollectionSet));
	}
	
	// now union the resulting arrays
	var superset = new Set();
	result.forEach(  function(element) {
		superset = union(superset,element);
	});
	
	var enabledCtls = $('.collection-picks :checkbox').filter(function(){
		var v = this.value;
		var i = parseInt(v);
		var x = superset.has(i);
		return x;
	});
	$(enabledCtls).prop("disabled",false);
	
	var disabledCtls = $('.collection-picks :checkbox').filter(function(){
		var v = this.value;
		var i = parseInt(v);
		var x = !superset.has(i);
		return x;
	});
	$(disabledCtls).prop("disabled",true);
	
	DisableUnselectableRegions(selectedCollectionSet);
	updateMatchCount();
}
*/

function updateMatchCount() {
	var idSelector = function() { return this.value; };
	var regions = $(".region-picks :checkbox:checked").map(idSelector);
	var collections = $(".collection-picks :checkbox:checked").map(idSelector);
	
	if (regions.length == 0 && collections.length == 0)
	{
		   $("#propertiesFound").html("0");
		   return;
	}

	var regionsXml = "<regions>";
	regions.each( function(index) {
		regionsXml += "<r>"+ this + "</r>";
	});
	regionsXml += "</regions>";

	var collectionsXml = "<collections>";
	collections.each( function(index){
		collectionsXml += "<c>"+ this + "</c>";
	});
	collectionsXml += "</collections>";

	var formData = "regions="+escape(regionsXml)+"&collections="+escape(collectionsXml);
	
	$.ajax({
		type: "POST",
		url: getBaseUrl() + "resources/gethotelcount.asp",
		data: formData,
		processData: false,
		contentType: "application/x-www-form-urlencoded",
		async: true,
		complete: function(msg) {
		},
		success: function(msg){
			var splitMsg = msg.split(";");
			$("#propertiesFound").html(Number(splitMsg[0]).toLocaleString());
			DisableCollectionsNotInList(splitMsg[1]);
		},
		error: function(msg){
		   $("#propertiesFound").html("...");
		}
	});
}

function getResults() {
	var idSelector = function() { return this.value; };
	var regions = $(".region-picks :checkbox:checked").not(":disabled").map(idSelector);
	var collections = $(".collection-picks :checkbox:checked").not(":disabled").map(idSelector);
	
	if (regions.length == 0 && collections.length == 0)
	{
		   $(".getHotels").html("...");
		   return;
	}

	var regionsQS=regions.get().join();
	var collectionsQS=collections.get().join();
	var dt="";
	var d = "";
	var path = getBaseUrl() + "property-results";
	
	if (regionsQS != "") {
		path = path + "/r/" + regionsQS.replace(" ","");
	}
	if (dt != "") {
		path = path + "/dt/" + dt;
	}
	if (d != "") {
		path = path + "/d/" + d.replace(" ", "%20");
	}
	if (collectionsQS != "") {
		path = path + "/c/" + collectionsQS.replace(" ","");
	}
	location.href = path + location.search;
}

function checkRegionHead() {
	$(".rh").each(function() {
		var whichRegion=$(this).prop("id").replace("rh","");
		var numberInRegion=$("[data-regionHead='rh" + whichRegion + "']").not('.hideMe').length;  //how many in the list are not hidden
		$("#regionCount" + whichRegion).html(numberInRegion)  //update the display of the number in the region
		if(numberInRegion==0) {
			$(this).parent().hide();  //hide the header
			$("#regionMapBox" + whichRegion).hide();  //hide the right map if it was visible
		} else {
			$(this).parent().show(); //show the header
			//if the header was hidden, show the list: regionX needs to show() but only if the map was also hidden.
			if(!$("#regionMapBox" + whichRegion).is(":visible")) {
				$(".region" + whichRegion).show();
			}
		}

	});
	var totalCountOnPage=0
	$(".individualRegionCount").each(function() {
		var thisRegionCount=$(this).html() * 1;
		totalCountOnPage=totalCountOnPage + thisRegionCount
		$("#totalCountOnPage").html(totalCountOnPage);
	})
}

var icon1 = getBaseUrl() + "img/pin1.svg";  //default state
var icon2 = getBaseUrl() + "img/pin2.svg";   //hover state
var icon3 = getBaseUrl() + "img/pin3.svg";   //selected state

function initMap(locs,r) {  //the big JSON list of all locations and the region so that we can have a different JS variable for each map on the page (instead of just "map" like is shown throughout the documentation of Google Maps).

	properties=$.parseJSON(locs); //turn the list of JSON-looking data to actual JSON
	window["map" + r] = new google.maps.Map(document.getElementById('map' + r), {
		zoom: 10
	  });
	setMarkers(eval("map" + r));
}

function setMarkers(map) {
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < properties.length; i++) {
		var property = properties[i];
		var markerLatLngBounds = new google.maps.LatLng(property.latitude, property.longitude);
		bounds.extend(markerLatLngBounds);  //ensures the map is zoomed enough to show all markers
		var p=new google.maps.LatLng(property.latitude, property.longitude);  //position of the marker
		createMarker(map, p, property.supplierID, property.supplierNameURL, property.regionID, property.agID);  //all these are in the JSON data for the location
	}

	//https://stackoverflow.com/questions/4523023/using-setzoom-after-using-fitbounds-with-google-maps-api-v3
	google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
	  if (this.getZoom() > 15) { this.setZoom(15); }
	  if (this.getZoom() < 4) { this.setZoom(3); }
	});
	map.fitBounds(bounds);
}

function createMarker(m, pos, s, snu, r) {  //which map, position of marker, supplierID, supplierNameURL, regionID, Amenity Group ID
//console.log(snu)
	//necessary for SVG icons in IE11
	icon1 = {
		url: getBaseUrl() + "img/pin1.svg",
		scaledSize: new google.maps.Size(30,30)
	}

    var marker = new google.maps.Marker({       
        position: pos, 
        map: m,
        optimized: false,
        icon: icon1,
        supplierID: s,  
        supplierNameURL: snu,  
        regionID: r   
    }); 

    google.maps.event.addListener(marker, 'click', function() { 
       updateSupplierPanel(marker.supplierID,marker.regionID,marker.supplierNameURL);
    }); 
    
    

	google.maps.event.addListener(marker, 'mouseover', function() {
		var markerURL=marker.icon.url;
		if(markerURL != undefined) {
			if(markerURL.indexOf("pin3")==-1) {
				//necessary for SVG icons in IE11
				icon2 = {
					url: getBaseUrl() + "img/pin2.svg",
					scaledSize: new google.maps.Size(30,30)
				}
				marker.setIcon(icon2);
			}
		}
	});

	google.maps.event.addListener(marker, 'mouseout', function() {
		var markerURL=marker.icon.url;
		if(markerURL != undefined) {
			if(markerURL.indexOf("pin3")==-1) {
				//necessary for SVG icons in IE11
				icon3 = {
					url: getBaseUrl() + "img/pin3.svg",
					scaledSize: new google.maps.Size(30,30)
				}
				marker.setIcon(icon1);
			}
		}
	});

	markers.push(marker);  //probably not the best that markers are getting added each time the map is shown, but probably not worth keeping track.

	//if any of the amenity groups are unchecked, hide that marker
	$(".amenityCB").each(function() {
		if(!$(this).is(":checked")) {
			var whichAG=$(this).attr("id").replace("ag","")
			$("[data-ag='ag" + whichAG + "']").each(function() {
				var whichSupplier=$(this).attr("data-supplier").replace("supplier","");
				for (var i = 0; i < markers.length; i++) {
					if (markers[i].supplierID == whichSupplier) {
						markers[i].setMap(null);
					}
				}
			});
		}
	})
	
    return marker;  
}

var markerZIndex=1000;

function updateSupplierPanel(s,r,snurl) {
	var supplierInfo=$("[data-supplier='supplier" + s + "']").html();
	var pat = /\/(en|fr)-([a-zA-Z]{2})\/travel\/[^\/]*\//g
	$("#supplierForMap" + r).html(supplierInfo).attr("href", getBaseUrl() + "property/" + snurl);
	for (var i = 0; i < markers.length; i++) {
		if (markers[i].supplierID == s) {
			markers[i].setIcon(icon3);  //highlight the clicked marker. Use icon3 so that the hover still works.
			markers[i].setZIndex(markerZIndex);
			markerZIndex++;
		} else {
			markers[i].setIcon(icon1);
		}
	}
}

function getUrlParameter(name) {
	if (location.href.indexOf("/property-results/") > -1) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[/]' + name + '/([^/&#]*)');
		var results = regex.exec(location.href);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}
	else {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}
};

var resizeTimer;

//gotta figure out what we're going to do with these - panels or cards

//https://css-tricks.com/snippets/jquery/done-resizing-event/
$(window).on('resize', function(e) {

  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {

		if (window.matchMedia("(max-width: 779px)").matches) {
		  $(".property-card:not(.pc-forceCard)").addClass("pc-stacked");
		} else {
		  $(".property-card:not(.pc-forceCard)").removeClass("pc-stacked");
		}

		//There are two View Photos buttons so need to remove the data-fancybox attribute from the one that his hidden (desktop vs. mobile)
//		if (window.matchMedia("(min-width: 920px)").matches) {
//			$(".property-view-photos-mobile .cta-white").attr("data-fancybox","");
//			$(".property-title .cta-white").attr("data-fancybox","gallery");
//		} else {
//			$(".property-view-photos-mobile .cta-white").attr("data-fancybox","gallery");
//			$(".property-title .cta-white").attr("data-fancybox","");
//		}
            
  }, 250);

});

		if (window.matchMedia("(max-width: 779px)").matches) {
		  $(".property-card:not(.pc-forceCard)").addClass("pc-stacked");
		} else {
		  $(".property-card:not(.pc-forceCard)").removeClass("pc-stacked");
		}

		//There are two View Photos buttons so need to remove the data-fancybox attribute from the one that his hidden (desktop vs. mobile)
//		if (window.matchMedia("(min-width: 920px)").matches) {
//			$(".property-view-photos-mobile .cta-white").attr("data-fancybox","");
//			$(".property-title .cta-white").attr("data-fancybox","gallery");
//		} else {
//			$(".property-view-photos-mobile .cta-white").attr("data-fancybox","gallery");
//			$(".property-title .cta-white").attr("data-fancybox","");
//		}

//http://css-tricks.com/snippets/jquery/smooth-scrolling/

  $('a[href*="#"]:not([href="#"])').click(function() {
	if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {

	  var target = $(this.hash);
	  target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	  if (target.length) {
		$('html,body').animate({
		  scrollTop: target.offset().top - 100  // to accommodate for height of fixed header
		}, 500);

		return false;

	  }
	}
 });

// Start of destination/collection filtering
"use strict";

function InitComboSetsForSelectedDestinations() {
	var idSelector = function() { return this.value; };
	var collections = $(".collection-picks :checkbox:checked").map(idSelector);
	
	var regionsXml = "<regions></regions>";

	var collectionsXml = "<collections>";
	collections.each( function(index){
		collectionsXml += "<c>"+ this + "</c>";
	});
	collectionsXml += "</collections>";

	var destinationsXml = "<ds><d dt='"+ getUrlParameter("dt") + "'>" + getUrlParameter("d") + "</d></ds>";

	var formData = "collections="+escape(collectionsXml)+"&destinations="+escape(destinationsXml);
	
	$.ajax({
		type: "POST",
		url: getBaseUrl() + "resources/gethotelcount.asp",
		data: formData,
		processData: false,
		contentType: "application/x-www-form-urlencoded",
		async: true,
		complete: function(msg) {
		},
		success: function(msg){
			var splitMsg = msg.split(";");
			$("#propertiesFound").html(Number(splitMsg[0]).toLocaleString());
			DisableCollectionsNotInList(splitMsg[1]);
		},
		error: function(msg){
		   $("#propertiesFound").html("...");
		}
	});
}

function DisableCollectionsNotInList(delimitedList)
{
	if (delimitedList)
	{
		var array;
		if (delimitedList.length === 0) {
			array = new Array();
		} else {
			array = delimitedList.replace(/, +/g, ",").split(",").map(Number);
		}
		var enabledCtls = $('.collection-picks :checkbox').filter(function () {
			var v = this.value;
			var i = parseInt(v);
			var x = array.includes(i);
			return x;
		});
		$(enabledCtls).prop("disabled", false);

		var disabledCtls = $('.collection-picks :checkbox').filter(function () {
			var v = this.value;
			var i = parseInt(v);
			var x = !array.includes(i);
			return x;
		});
		$(disabledCtls).prop("disabled", true);
	}
}


function getResults_Destination() {
	var idSelector = function() { return this.value; };
	var collections = $(".collection-picks :checkbox:checked").not(":disabled").map(idSelector);
	
	var collectionsQS=collections.get().join();

	var r = "";
	var dt = getUrlParameter("dt");
	var d = getUrlParameter("d");

	var path = getBaseUrl() + "property-results"
	if (r != "") {
		path = path + "/r/" + r;
	}
	if (dt != "") {
		path = path + "/dt/" + dt;
	}
	if (d != "") {
		path = path + "/d/" + d.replace(" ", "%20");
	}
	if (collectionsQS != "") {
		path = path + "/c/" + collectionsQS.replace(" ","");
	}
	location.href=path + location.search;
}
// Start of destination/collection filtering

$(".rh-mobile-toggle").on("click",function() {
	$(this).parent().next().toggle();
	$(this).find(".plusVerticalStroke").toggle();
});

function listCitesAndAreasInStateCountry(sc) {
	$(sc).next().toggle();
	$(sc).find(".plusVerticalStroke").toggle();
	if($(sc).attr("data-loaded")=="0") {
		//load from View
		var stateCountry=$(sc).attr("data-stateCountry");
		$(sc).next().load(getBaseUrl() + "resources/listCitesAndAreasInStateCountry.asp",{stateCountry:stateCountry});
		$(sc).attr("data-loaded","1");
	}
}

function listCitiesInArea(a) {
	$(a).parent().toggleClass("dest-area-on")
	$(a).parent().next().toggle();
	$(a).find(".plusVerticalStroke").toggle();
	if($(a).attr("data-loaded")=="0") {
		//load from View
		var area=$(a).attr("data-area");
		//console.log(area)
		$(a).parent().next().load(getBaseUrl() + "resources/listCitiesInArea.asp",{area:area});
		$(a).attr("data-loaded","1");
	}

}

//http://www.karlgroves.com/2014/11/24/ridiculously-easy-trick-for-keyboard-accessibility/
function a11yClick(event){
    if(event.type === 'click'){
        return true;
    }
    else if(event.type === 'keypress'){
        var code = event.charCode || event.keyCode;
        if((code === 32)|| (code === 13)){
            return true;
        }
    }
    else{
        return false;
    }
}

//https://hackernoon.com/removing-that-ugly-focus-ring-and-keeping-it-too-6c8727fefcd2
function handleFirstTab(e) {
    if (e.keyCode === 9) { // the "I am a keyboard user" key
        $("body").addClass('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
    }
}

//https://www.geodatasource.com/developers/javascript
//used on property.asp where Google can't find driving distance
function crowFliesDistance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

//https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
function camelize(str) {
  return capitalizeFirstLetter(str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, ''));
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

window.addEventListener('keydown', handleFirstTab);

$(document).ready(function() {
	$(".hero-image-location").on("click",function() {
		sessionStorage["bc"]="";
		$.post(getBaseUrl() + "resources/clearBreadcrumbs.asp");
	});
	
});

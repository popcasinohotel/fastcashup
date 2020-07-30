//Autocomplete search
var hasChosen=false;

//https://github.com/pawelczak/EasyAutocomplete/issues/256 (allowing search on both the actual value (result) and the cleaned up value (result))
var searchOptions = {
	url: function(q) {
		return getBaseUrl() + "resources/search.asp?q=" + q;
	},
	getValue: function (element) {
    return element.result + '|' + element.resultName
		},
	minCharNumber: 2,
	template: {
		type: "custom",
		method: function(value, item) {
			if(item.type=="4") {
				var displayValue=item.resultName + ", " + item.tier2;
			} else {
				displayValue=item.resultName;
			}
			return "<div class='ac-item ac-" + item.icon + "'>" + displayValue + "</div>";
		}
	},
	list: {
		onLoadEvent: function() {
			hasChosen=false;
		},
		onSelectItemEvent: function() {
			var inputValue = $("#search").getSelectedItemData().resultName;
			$("#search").val( inputValue );
		},
		onChooseEvent: function() {
			hasChosen=true;
			sessionStorage["bc"]="";
			var resultType=$("#search").getSelectedItemData().type
			var resultValue=$("#search").getSelectedItemData().resultName
			$("#search").val( resultValue );
			if(resultType=='hotel') {
				var supplierNameURL=$("#search").getSelectedItemData().supplierNameURL
				location.href=getBaseUrl() + "property/" + supplierNameURL;
			} else if(resultType=='brand') {
				var ddBrandURL=$("#search").getSelectedItemData().ddBrandURL
				location.href=getBaseUrl() + "brand/" + ddBrandURL;
			} else {
				location.href=getBaseUrl() + "property-results/dt/" + resultType + "/d/" + $("#search").getSelectedItemData().resultNameEn.replace(' ', '%20');
			}
		},
		maxNumberOfElements: 12,
			match: {
			enabled: true
		},
		onHideListEvent: function() { 
			//https://github.com/pawelczak/EasyAutocomplete/issues/274
			var containerList = $('#search').next('.easy-autocomplete-container').find('ul'); if ($(containerList).children('li').length <= 0) { $(containerList).html('<li><div class="ac-item ac-city">No results found</div></li>').show(); }  
		}

	}
};

var searchOptionsHome = {
	url: function(q) {
		return getBaseUrl() + "resources/search.asp?q=" + q;
	},
	getValue: function (element) {
    return element.result + '|' + element.resultName
		},
	minCharNumber: 2,
	template: {
		type: "custom",
		method: function(value, item) {
			if(item.type=="4") {
				var displayValue=item.resultName + ", " + item.tier2;
			} else {
				displayValue=item.resultName;
			}
			return "<div class='ac-item ac-" + item.icon + "'>" + displayValue + "</div>";
		}
	},
	list: {
		onLoadEvent: function() {
			hasChosen=false;
		},
		onSelectItemEvent: function() {
			var inputValue = $("#homeSearch").getSelectedItemData().resultName;
			$("#homeSearch").val( inputValue );
		},
		onChooseEvent: function() {
			hasChosen=true;
			sessionStorage["bc"]="";
			var resultType=$("#homeSearch").getSelectedItemData().type
			var resultValue=$("#homeSearch").getSelectedItemData().resultName
			$("#homeSearch").val( resultValue );
			if(resultType=='hotel') {
				var supplierNameURL=$("#homeSearch").getSelectedItemData().supplierNameURL
				location.href=getBaseUrl() + "property/" + supplierNameURL;
			} else if(resultType=='brand') {
				var ddBrandURL=$("#homeSearch").getSelectedItemData().ddBrandURL
				location.href=getBaseUrl() + "brand/" + ddBrandURL;
			} else {
				location.href=getBaseUrl() + "property-results/dt/" + resultType + "/d/" + $("#homeSearch").getSelectedItemData().resultNameEn.replace(' ', '%20');
			}
		},
		maxNumberOfElements: 12,
			match: {
			enabled: true
		},
		onHideListEvent: function() { 
			//https://github.com/pawelczak/EasyAutocomplete/issues/274
			var containerList = $('#homeSearch').next('.easy-autocomplete-container').find('ul'); if ($(containerList).children('li').length <= 0) { $(containerList).html('<li><div class="ac-item ac-city">No results found</div></li>').show(); }  
		}

	}
};


$("#search").easyAutocomplete(searchOptions);

$(".search-box-icon").on("click",function() {
	$(".nav-top-links").toggleClass("hideMe");
	$(".search-box").toggleClass("showFlex");
	$(".search-or-close").toggleClass("hideMe");
	$(".globalSearch").focus().val('');
	
	if (window.matchMedia("(max-width: 759px)").matches) {
		$(".logo").toggleClass("hideMe");
		$(".globalSearch").attr("placeholder","")
	}
	
});

$(".burger").on("click",function() {
	$(".subnav").toggleClass("subnav-mobile");
	$(".easy-autocomplete input.globalSearch").val('');
});
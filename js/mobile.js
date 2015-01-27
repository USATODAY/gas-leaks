var mobile = mobile || {};

mobile.panelHead = jQuery("#panel-head");
mobile.panelSub = jQuery("#panel-sub");
mobile.arrPanelData = jQuery(".panel-data");

mobile.arrDataTagButtons = jQuery(".compare-tag");
mobile.arrDataPopovers = jQuery(".data-popover");
mobile.arrPopoverCloseButtons = jQuery(".popover-close-button");

mobile.arrDataColumns = jQuery(".data-column");

mobile.companyAverages = {
  percent_metal_pipe: 0.07,
  percent_old_pipe: 0.379,
  percent_gas_lost: 0.0229,
  leaks_per_1k: 35.18
};

mobile.currentCompany = null;

mobile.setPanelInfo = function(company, isUserSet) {
  var arrCompareTags =  $(".data-charts").find(".compare-tag");
  
  if (company === null) {
    mobile.panelHead.empty();
    mobile.panelSub.empty();
    $(".data-charts").removeClass("show");
    arrCompareTags.removeClass("above");
    arrCompareTags.removeClass("below");
    arrCompareTags.removeClass("average");
    arrCompareTags.empty();
    mobile.arrPanelData.eq(0).addClass("hidden");
  }
  
  else {
    mobile.arrPanelData.eq(0).removeClass("hidden");
    $(".data-charts").addClass("show");
    if (isUserSet) {
      mobile.panelHead.text("You selected " + company.name);
    }
    else {
      mobile.panelHead.text(company.name);
    }
    
    mobile.panelSub.text(company.office_city + ", " + company.office_state);
    mobile.panelSub.show();

    mobile.drawChart("#data-column1", company.pct_totalbaremetal);
    mobile.drawChart("#data-column2", company.pct_pre1970miles);
    mobile.drawChart("#data-column3", company.percent_lostgas);
    $(".metal-miles").remove();

    arrCompareTags.removeClass("above");
    arrCompareTags.removeClass("below");
    arrCompareTags.removeClass("average");
    arrCompareTags.empty();

    if(company.hazleaks_per1000miles){
      var dataHTMLStr = "<div class='metal-miles'>" + Math.round(company.hazleaks_per1000miles * 10) / 10 + "</div>";
      $("#data-column4").prepend(dataHTMLStr);
      $("#data-column4").find(".data-decription").show();
      $("#data-column4").find(".compare-tag").show();
    }
    else {
      $("#data-column4").find(".data-decription").hide();
      $("#data-column4").find(".compare-tag").hide();
    }
    
    mobile.compareAverages(company.pct_totalbaremetal, mobile.companyAverages.percent_metal_pipe, 1);
    mobile.compareAverages(company.pct_pre1970miles, mobile.companyAverages.percent_old_pipe, 2);
    mobile.compareAverages(company.percent_lostgas, mobile.companyAverages.percent_gas_lost, 3);
    mobile.compareAverages(company.totalbaremetal_miles, mobile.companyAverages.leaks_per_1k, 4);
    
  }
};

mobile.drawChart = function(el, prop) {
  
  $el = $(el);
  $el.find("svg").remove();
  

  var w = $el.width() * 0.75;
  var radius = w/2;
  var barWidth = 10;
  var textPosition;

  if ($(window).width() > 600) {
    textPosition = "translate(-20, 5)";
  }

  else if ($(window).width() >= 1000) {
    textPosition = "translate(-25, 5)";
  }

  else {
    textPosition = "translate(-15, 5)";
  }



  var data = [Math.round(prop * 100) / 100, Math.round((1 - prop) * 100) / 100];
  

  var arc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius - barWidth);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d; });

  var svg = d3.select(el).insert("svg", ".data-decription")
      .attr("width", w)
      .attr("height", w)
      .append("g")
      .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")");

  var innerCircle = svg.append("circle")
      .attr("r", radius - barWidth)
      .attr("cx", 0)
      .attr("cy", 0)
      .style("fill", "#E6E6E6");

  var g = svg.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d, i) {
        if (i === 0) {
          return "#1B9CFA";
        }
        else {
          return "rgba(255, 255, 255, 0)";
        }
      });

  var percentText = svg.append("text")
      .data(data)
      .text(function(d) {
        
        return Math.round(d * 100) + "%";
      })
      .attr("transform", textPosition)
      .attr("class", "chart-percent-text");

};

mobile.compareAverages = function(companyData, averageData, columnNumber) {
  var result;
  var column = "#data-column" + columnNumber;
  var tag =  $(column).find(".compare-tag");
  if (companyData > averageData) {
    tag.text("Above Average");
    tag.addClass("above");
  }
  else if (companyData == averageData ) {
    tag.text("Average");
    tag.addClass("average");
  }

  else if (companyData < averageData) {
    tag.text("Below Average");
    tag.addClass("below");
  }
};

mobile.listen = function() {
  mobile.arrDataTagButtons.on("click", function(e) {
    var $this = $(this);
    var dataIndex = mobile.arrDataTagButtons.index($this);
    
    mobile.arrDataPopovers.eq(dataIndex).fadeIn(250);
   });

  mobile.arrPopoverCloseButtons.on("click", function(e) {
    var $this = $(this);
    var dataIndex = mobile.arrPopoverCloseButtons.index($this);
    mobile.arrDataPopovers.eq(dataIndex).fadeOut(250);
  });



  $(window).on("resize", function() {
    mobile.setDataColumnSize();
    mobile.setPanelInfo(mobile.currentCompany);
  });

};

mobile.setDataColumnSize = function() {
  var windowWidth = $(window).width();
  var width = mobile.arrDataColumns.width();
  

  if (windowWidth > 640){
    
    mobile.arrDataColumns.height(width);
  }

  else if ( windowWidth > 475 && windowWidth <= 640) {
    mobile.arrDataColumns.height(190);
  }

  else {
    mobile.arrDataColumns.height(160);
  }
  
};

$(document).ready(function() {

    var blnIframeEmbed = window != window.parent;



  mobile.listen();

  if (blnIframeEmbed) {
    $(".mobile-back-bar").empty().css("height", "2em");

    $(".mobile-footer").hide();
    $(".mobile-company-info-box").css("font-size", "2em");
  }

  mobile.setDataColumnSize();
  mobile.arrPanelData.eq(0).addClass("hidden");
});

(function() {

  var searchApp = angular.module('gasSearch', []);
  searchApp.controller('SearchController', function($http, $scope, $filter) {

    $scope.companies = [];

    $http.get("js/companies.json").then(function(data) {
      $scope.companies = data.data;
      window.setTimeout(function(){
        $(".preloader-mobile").eq(0).fadeOut(500);
      }, 1000);
    });

    this.blur = function() {
      $scope.filterTerm = "";
    };

    this.setComanyFocus = function(company) {
      mobile.currentCompany = company;
      mobile.setPanelInfo(company);
      $scope.isFormOpen = false;

      
      
      //set the filter term to be the full company name of the company selected
      // $scope.filterTerm = company.name;
      $scope.filterTerm = "";



       jQuery(window).on("resetSearch", function() {
        $scope.filterTerm = "";
        
        mobile.searchCont.find("input").val("");
       });

      
    };


    this.clear = function() {
      $scope.filterTerm = "";
      mobile.setPanelInfo(null);
    };

    this.mobileSearch = function() {
      mobile.arrPanelData.eq(0).addClass("hidden");

      // var numberResults = $(".list-group-item").length;

      var filteredArray = $filter("filter")($scope.companies, $scope.filterTerm, false);
      if (filteredArray.length === 0) {
        $(".mobile-company-info-box").show();
      }

      else {
        $(".mobile-company-info-box").hide();
      }

      if ($scope.filterTerm !== "") {
        mobile.currentCompany = null;
        $scope.isFormOpen = true;
      }
      else {
        $scope.isFormOpen = false;
      }
    };

  });


})();
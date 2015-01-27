var app = app || {};
app.data = [];
app.markerArray = [];
app.markerLayer = {};
app.currentLocation = 1;
app.currentPanel = 0;
app.currentCompany = null;



app.init = function() {

  // initialize mapbox map
  // custom map: usatoday.map-hrkcjaxs
  // main map: usatodaygraphics.basemap

  

  L.mapbox.accessToken = "pk.eyJ1IjoidXNhdG9kYXlncmFwaGljcyIsImEiOiJ0S3BGdndrIn0.5juF5LWz_GRcndian32tZA";
  app.map = L.mapbox.map('map', 'usatodaygraphics.basemap', {
    // dragging: false,
    // scrollWheelZoom: false,
    zoomAnimationThreshold: 8,
    zoomControl: false
  });

  if (Modernizr.touch && window.outerWidth <= 1024){
    
     app.map.tileLayer.setFormat("png32");
  }
  

 
  new L.Control.Zoom({ position: 'bottomright' }).addTo(app.map);


 app.baseURL = "http://www.gannett-cdn.com/experiments/usatoday/2014/gas-leaks/";

  app.markerLayer = L.mapbox.featureLayer(null).addTo(app.map);
  app.geocoder = L.mapbox.geocoder('mapbox.places');
  app.geocoderAll = L.mapbox.geocoder('mapbox.places');
  
  
  app.window = jQuery(window);


  

  //set up arrays to store data
  app.companyData = [];
  app.transmissionCompanyData = [];


  //get incident data and add markers to the map
  $.getJSON("js/incidents.json", function(data) {
    $.each(data, function(index, value) {
      if ((value.latitude !== "") && (value.longitude !== "")) {
        app.data.push(value);
      }
    });

    app.addMarkers2(app.data);

  });

  //ajax company data
  app.getCompanies();


  //audio elements
  app.arrAudios = jQuery("audio");
  app.audioSource = $("#audio-source");
  app.audioDotContainer = jQuery(".audio-dot-container");
  app.arrSeekDot = jQuery(".audio-dot");
  app.arrAudioInner = jQuery(".audio-inner");
  app.arrAudioBar = jQuery(".audio-bar");
  app.seekBar = jQuery(".audio-box");
  app.arrAudioPlayButtons = jQuery(".js-audio-play-pause");
  app.arrAudioForwardButtons = jQuery(".js-audio-forward");
  app.arrAudioBackButtons = jQuery(".js-audio-back");
  app.arrAudioTimeText = jQuery(".audio-time-text");
  app.arrUnmuteButtons = jQuery(".intro-unmute");

  //video elements
  app.arrVideos = jQuery("video");
  app.videoPlayButton = jQuery("#play-pause");

  //video container
  app.videoContainer = jQuery(".video-container");
  // Controls
  app.videoControls = jQuery("#video-controls");

  //Fallback video controls
  app.touchVideoControls = jQuery(".touch-video-controls");
  app.videoPlayFallback = jQuery("#video-play-fallback");
  app.videoCloseButton = jQuery(".video-close-button");

  // Buttons
  app.playButton = jQuery("#play-pause");

  // Sliders
  app.videoSeekBar = jQuery("#seek-bar");
  app.videoSeekDot = jQuery("#video-dot");
  app.chapterHead = jQuery("#chapter-header");
  app.descriptionHead = jQuery("#description-header");

  //panel elements
  app.panelHead = jQuery("#panel-head");
  app.panelSub = jQuery("#panel-sub");
  app.arrPanelData = jQuery(".panel-data");
  app.arrAudioCredit = jQuery(".audio-credit-inner");
  app.searchCont = jQuery("#search_cont");
  app.searchContEnd = jQuery("#search_cont_end");
  app.panelExtraInfo = jQuery("#panel-extra-info");

  //nav elements
  app.arrNavItems = jQuery(".nav-item");
  app.arrChapterDots = jQuery(".chapter-dot");


  app.arrDataTagButtons = jQuery(".compare-tag");
  app.arrDataPopovers = jQuery(".data-popover");
  app.arrPopoverCloseButtons = jQuery(".popover-close-button");

  app.arrIntroPopover = jQuery(".intro-popover");

  app.arrMapInfoBox = jQuery(".js-no-incidents-box");

  app.arrTextInputs = jQuery("input[type='text']");
  app.introSubmit = jQuery("#intro-submit");


  //current state info
  app.userZip = "";
  app.currentBeat = 1;

  //company averages for comparison
  app.companyAverages = {
    percent_metal_pipe: 0.07,
    percent_old_pipe: 0.379,
    percent_gas_lost: 0.0229,
    leaks_per_1k: 35.18
  };

  if (Modernizr.touch && app.window.width() <= 1024) {
    app.videoControls.show();
  }

  var blnIframeEmbed = window != window.parent;

  if (blnIframeEmbed) {
    app.descriptionHead.css("font-size", "1.5em");
  } 

  //start listening
  app.listen();

};

app.setBeat = function(beat) {

//if beat is not beat 1, make sure the intro is hidden and correct info is shown

  if (beat > 1) {
    app.arrAudios[0].pause();
    app.arrTextInputs.eq(0).blur();
   
    app.panelHead.show();
    app.arrVideos[0].pause();
    app.currentPanel = 1;
    $("#open-menu").show();
      if (!$("#intro").hasClass("inactive")){
        $("#intro").addClass("inactive");
      }
      if (!$("#map").hasClass("active")) {
        $("#map").addClass("active");
      }
      if ( !$("#map-ui").hasClass("active")) {
         $("#map-ui").addClass("active");
      }
      if(app.searchCont.hasClass("active")) {
        app.searchCont.removeClass('active');
      }

      if (app.map.hasLayer(app.hotSpotLayer)) {
        app.map.removeLayer(app.hotSpotLayer);
      }
  }

  if (beat < 9) {
    jQuery("#search_cont_end").hide();
  }

  //update the nav menu to reflect new active beat
  $(".nav-list").find(".active").removeClass("active");
  $(".chapter-nav-list").find(".active").removeClass("active");


  jQuery(".continue-button").hide();
 
  app.arrMapInfoBox.hide();
  app.searchCont.find("input").val('');
  app.searchContEnd.find("input").val('');
  app.arrAudios.eq(1).off("ended");
  app.arrAudios.eq(1).off("timeupdate");
  app.currentBeat = beat;
  jQuery(window).trigger("resetSearch");

  var company;


  switch (beat) {
    case 1 :
      app.currentPanel = 0;
      app.arrVideos[0].play();

      $("#open-menu").hide();

      var $intro = $("#intro");
      var $map = $("#map");
      var $mapUi = $("#map-ui");
      if ($intro.hasClass("inactive")){
        $intro.removeClass("inactive");
      }
      if ($map.hasClass("active")) {
        $map.removeClass("active");
      }
      if ( $mapUi.hasClass("active")) {
         $mapUi.removeClass("active");
      }

      app.arrAudios[1].pause();
      app.arrNavItems.eq(beat - 1).addClass("active");
      app.arrChapterDots.eq(beat - 1).addClass("active");

      Analytics.click("viewed chapter 1");
      
      break;

    case 2 :
      Analytics.click("viewed chapter 2");
      app.panelSub.hide();
      app.arrAudioCredit.eq(1).text("Chapter 2");
      app.setPanelInfo(null);
      
      app.chapterHead.text("Chapter 2: " + app.userStateReadable);
      app.descriptionHead.text("Listen to a summary of " + app.userStateReadable +"'s gas infrastructure");

      app.map.setView(app.userLatLong, 7);
      app.setAudio(app.userState, 1);



      

      app.arrAudios.eq(1).on("ended", function() {
        app.arrAudios.eq(1).off("ended");
        app.setBeat(3);
      });

      


      
      app.arrNavItems.eq(beat - 1).addClass("active");
      app.arrChapterDots.eq(beat - 1).addClass("active");
      break;

    case 3 :


      app.searchCont.addClass("active");
      app.chapterHead.text("Chapter 2: " + app.userStateReadable);
      app.descriptionHead.text("Select your gas company from the search box");

      app.panelHead.hide();

      app.setPanelInfo(null);
      

      app.arrNavItems.eq(beat - 2).addClass("active");
      app.arrChapterDots.eq(beat - 2).addClass("active");
      app.setAudio("beat3", 1);

      break;

    case 4 :
      Analytics.click("viewed chapter 2");
      app.setAudio("beat8", 1);


      app.chapterHead.text("Chapter 3: What's going on?");
      app.descriptionHead.text("Many causes but one is preventable – old vulnerable gas pipe");

      app.setPanelInfo(null);
      app.arrAudioCredit.eq(1).text("Chapter 7");
      app.map.setView([39.642624, -98.169883], 4);

      app.arrAudios.eq(1).on("ended", function() {
        app.arrAudios.eq(1).off("ended");
        
        app.showVideo(1);

        if (app.arrVideos[1].readyState === 0 || app.arrVideos[1].paused) {
          app.touchVideoControls.eq(0).show();
        }
        
      });

      app.arrVideos.eq(1).on("ended", function() {
        app.arrVideos.eq(1).off("ended");
        app.videoContainer.eq(0).fadeOut(250);
        app.videoContainer.eq(0).removeClass('active');
        app.setBeat(5);
      });
      app.arrNavItems.eq(beat - 2).addClass("active");
      app.arrChapterDots.eq(beat - 2).addClass("active");
      break;
        
    case 5 :

     Analytics.click("viewed chapter 4");
     app.arrAudioCredit.eq(1).text("Chapter 4");
      app.map.setView([39.642624, -98.169883], 4);
      app.setAudio("beat4", 1);

      app.setPanelInfo(null);

      app.chapterHead.text("Chapter 4: Hotspots");
      app.descriptionHead.text("A closer look at some of the most worrisome places revealed by USA TODAY's analysis");

      app.hotSpotLayer = L.mapbox.featureLayer(null).addTo(app.map);
      app.addHotSpots(app.hotSpots);

      app.arrAudios.eq(1).on("ended", function() {
        app.arrAudios.eq(1).off("ended");

        app.setBeat(6);
        
      });

      app.arrNavItems.eq(beat - 2).addClass("active");
      app.arrChapterDots.eq(beat - 2).addClass("active");
      break;
    case 6 :
      app.setPanelInfo(null);
      Analytics.click("viewed chapter 5");
      app.chapterHead.text("Chapter 5: New York: Old Pipe");
      app.descriptionHead.text("A closer look at some of the most worrisome places revealed by USA TODAY's analysis");

      app.arrAudioCredit.eq(1).text("Chapter 4");
      app.setAudio("beat5", 1);

      app.map.setView([41.327, -74.498], 8);
    
      company1 = app.lookupCompany("operator_id", 1800, app.companyData);
      company2 = app.lookupCompany("operator_id", 2704, app.companyData);

      app.arrAudios.eq(1).on("timeupdate", function() {
        var thisAudio = app.arrAudios[1];
        if (thisAudio.currentTime >= 9 && thisAudio.currentTime < 18) {
          
          app.descriptionHead.text("The companies that serve New York City are above the national average in every measure");
          app.map.setView([40.811540, -73.946887], 10);
        }

        if (thisAudio.currentTime >= 18 && thisAudio.currentTime < 33) {
           app.setPanelInfo(company1);
        }

        if (thisAudio.currentTime >= 33 && thisAudio.currentTime < thisAudio.duration) {
           app.setPanelInfo(company2);

        }
      });

     

      app.panelHead.show();
      app.panelSub.show();

      app.arrAudios.eq(1).on("ended", function() {
        app.arrAudios.eq(1).off("ended");
        app.setBeat(7);
       
      });

      app.arrNavItems.eq(beat - 2).addClass("active");
      app.arrChapterDots.eq(beat - 2).addClass("active");
      break;

    case 7 :

      Analytics.click("viewed chapter 6");
      app.setAudio("beat6", 1);


      app.chapterHead.text("Chapter 6: Washington, DC: Missing Gas");
      app.descriptionHead.text("A Washington Gas company can’t account for about 4% of its gas over the last two years");

      company = app.lookupCompany("operator_id", 22182, app.companyData);

      app.setPanelInfo(company);
      app.arrAudioCredit.eq(1).text("Chapter 5");
      app.map.setView([38.889988, -77.007771], 8);

      app.arrAudios.eq(1).on("ended", function() {
        app.arrAudios.eq(1).off("ended");
        app.setBeat(8);
       
      });
      app.arrNavItems.eq(beat - 2).addClass("active");
      app.arrChapterDots.eq(beat - 2).addClass("active");
      break;
    case 8 :
      Analytics.click("viewed chapter 7");
      app.setAudio("beat7", 1);

      company = app.lookupCompany("operator_id", 4475, app.companyData);

      app.chapterHead.text("Chapter 7: Pensacola, FL");
      app.descriptionHead.text("In Pensacola, bare-metal pipe is four times the U.S. average");

      app.setPanelInfo(company);
      app.arrAudioCredit.eq(1).text("Chapter 6");
      app.map.setView([30.418999, -87.216812], 8);

      app.arrAudios.eq(1).on("ended", function() {
        app.arrAudios.eq(1).off("ended");
        app.setBeat(9);
        
      });
      app.arrNavItems.eq(beat - 2).addClass("active");
      app.arrChapterDots.eq(beat - 2).addClass("active");
      break;
    
    case 9 :

      Analytics.click("viewed chapter 8");

      app.setPanelInfo(null);
      app.map.setView([39.642624, -98.169883], 4);
      app.arrAudioCredit.eq(1).text("Chapter 8");
      app.setAudio("beat9", 1);

      app.chapterHead.text("Chapter 8: Explore");
      app.descriptionHead.text("You can explore this map to learn more about the most serious gas leaks since 2004");
      jQuery("#search_cont_end").show();
     
      
      app.arrNavItems.eq(beat - 2).addClass("active");
      app.arrChapterDots.eq(beat - 2).addClass("active");
      break;

      
  }
};


app.audioPlayPause = function(intAudio) {


 
  if (app.arrAudios[intAudio].paused) {
    Analytics.click("played audio track");
    app.arrAudios[intAudio].play();
    app.arrAudios[intAudio].volume = 0.6;
    app.intPlayId = setInterval(function() {
      app.adjustProgress(intAudio, false);
    }, 950);
    
  } 
  else {
    app.arrAudios[intAudio].pause();
    clearInterval(app.intPlayId);
  }

  
};

app.videoPlayPause = function(intVideo) {
  if (app.arrVideos[intVideo].paused) {
    Analytics.click("played video");
    app.arrVideos[intVideo].volume = 0.6;
    app.arrVideos[intVideo].play();

    
  } else {
      app.arrVideos[intVideo].pause();
    
  } 
};

app.audioForward = function(intAudio) {
  app.arrAudios[intAudio].currentTime = app.arrAudios[intAudio].duration;
  app.adjustProgress(app.currentPanel, false);
};

app.audioBack = function(intAudio) {
  if (app.arrAudios[intAudio].currentTime <= 3) {
    app.setBeat(app.currentBeat - 1);
  }
  else {
    app.arrAudios[intAudio].currentTime = 0;
    app.adjustProgress(app.currentPanel, false);
  }
  
};


app.adjustProgress = function(intAudio, blnSeek) {
  var strLeft, intLeft, intPercent, numProgress, numDuration, strCurrentTime, strTotalTime;
  numDuration = Math.round(app.arrAudios[intAudio].duration);
  if (blnSeek) {
    strLeft = app.arrSeekDot.eq(intAudio).css("left");
    strLeft = strLeft.substr(0, strLeft.indexOf("px"));
    intLeft = parseInt(strLeft);
    intPercent = Math.round((intLeft/( app.seekBar.eq(intAudio).width() - app.arrSeekDot.eq(intAudio).width())) * 100);
    if (intPercent > 100) {
      intPercent = 100;
    }
    numProgress = intPercent / 100;
    if (numProgress < 0) {
      numProgress = 0;
    }
    app.arrAudios[intAudio].currentTime = numProgress * numDuration;
    app.blnAudioDrag = false;
  } else if (!app.blnAudioDrag) {
    intPercent = Math.round((app.arrAudios[intAudio].currentTime / numDuration) * 100);
    numProgress = intPercent / 100;
    app.arrAudioBar.eq(intAudio).css({"width" : intPercent.toString() + "%"});
  }
  strCurrentTime = app.renderTime(Math.round(app.arrAudios[intAudio].currentTime));
  strTotalTime = app.renderTime(numDuration);
  app.arrAudioTimeText.eq(intAudio).html(strCurrentTime + "/" + strTotalTime);
};

app.showVideo = function(intVideo) {
  app.videoContainer.eq(0).fadeIn(250);
  app.videoContainer.eq(0).addClass('active');
  app.videoPlayPause(1);

};

app.addMarkers2 = function(array) {
  $(".leaflet-marker-pane").empty();
  $(".leaflet-popup-pane").empty();
  app.data = [];

  function findData(e){
    var companyId = this.options.company_id;
    var company;


    Analytics.click("marker clicked");
    
    

    if (this.options.system == "Transmission") {
      
      if (companyId === "") {
        app.setPanelInfo(null, true);
      }

      else {
        company = app.lookupCompany("operator_ID", companyId, app.transmissionCompanyData);
        app.setPanelInfo(company);
      }      
    }

    else {
      companyId = this.options.usatid;
      company = app.lookupCompany("usatid", companyId, app.companyData);
      app.setPanelInfo(company);
    }
    
  }

  for (i = 0; i < array.length; i++) {
    var item = array[i];
    var lat = item.latitude;
    var lng = item.longitude;
    var className = 'main-marker';
    var zIndexOffset = 0;
    var size = 15;

    if (item.number_dead > 0) {
      className = 'dead-marker';
      zIndexOffset = 950;
      size = 20;
    }

    if (item.number_dead === 0 & item.number_injured > 0) {
      className = 'injured-marker';
      zIndexOffset = 900;
      size = 20;
    }


    var myIcon = L.divIcon({
      className: className + " marker-alt",
      iconSize: size
    });
    if ((!isNaN(item.latitude)) && (!isNaN(item.longitude))) {
      var marker = L.marker([lat, lng], {
        icon: myIcon,
        incident_year: item.incident_year,
        company: item.company,
        company_city: item.company_city,
        company_state: item.company_state,
        company_id: item.company_id,
        system: item.system,
        incident_date: item.incident_date,
        offshore: item.offshore,
        incident_location: item.incident_location,
        incident_city: item.incident_city,
        incident_county: item.incident_county,
        incident_state: item.incident_state,
        number_dead: item.number_dead,
        number_injured: item.number_injured,
        ignited: item.ignited,
        exploded: item.exploded,
        people_evacuated: item.people_evacuated,
        total_damages: item.total_damages,
        cause_category: item.cause_category,
        cause: item.cause,
        narrative: item.narrative,
        reportid: item.reportid,
        latitude: item.latitude,
        longitude: item.longitude,
        usatid: item.usatid,
        zIndexOffset: zIndexOffset
      });

      var popupContent; 

      var location = "";

      if (item.incident_location !== "") {
        location += item.incident_location +", ";
      }

      if (item.incident_city !== "") {
        location += item.incident_city + ", ";
      }

      if (item.incident_state !== "") {
        location += item.incident_state;
      }

      if (item.total_damages && item.cause && location !== "") {

        popupContent = "<h5 class='popover-title'>" + item.company + "</h5>" +
        "<div class='popup-line'><strong>Location: </strong>" + location + "</div>" +
        "<div class='popup-line'><strong>Year: </strong>" + item.incident_year + "</div>" +
        "<div class='popup-line'><strong>Dead: </strong>" + item.number_dead + "</div>" +
        "<div class='popup-line'><strong>Injured: </strong>" + item.number_injured + "</div>" +
        "<div class='popup-line'><strong>Total Damages: </strong>$" + app.numberWithCommas(item.total_damages) + "</div>" +
        "<div class='popup-line'><strong>Cause reported: </strong>" + item.cause + "</div>";
        
      }
      else if (item.total_damages && location !== "") {
        popupContent = "<h5 class='popover-title'>" + item.company + "</h5>" +
        "<div class='popup-line'><strong>Location: </strong>" + location + "</div>" +
        "<div class='popup-line'><strong>Year: </strong>" + item.incident_year + "</div>" +
        "<div class='popup-line'><strong>Dead: </strong>" + item.number_dead + "</div>" +
        "<div class='popup-line'><strong>Injured: </strong>" + item.number_injured + "</div>" +
        "<div class='popup-line'><strong>Total Damages: </strong>$" + app.numberWithCommas(item.total_damages) + "</div>";
      }
      else if (item.cause && location !== "") {
        popupContent = "<h5 class='popover-title'>" + item.company + "</h5>" +
        "<div class='popup-line'><strong>Location: </strong>" + location + "</div>" +
        "<div class='popup-line'><strong>Year: </strong>" + item.incident_year + "</div>" +
        "<div class='popup-line'><strong>Dead: </strong>" + item.number_dead + "</div>" +
        "<div class='popup-line'><strong>Injured: </strong>" + item.number_injured + "</div>" +
        "<div class='popup-line'><strong>Cause reported: </strong>" + item.cause + "</div>";
      }
      else if (location !== "") {
        popupContent = "<h5 class='popover-title'>" + item.company + "</h5>" +
        "<div class='popup-line'><strong>Location: </strong>" + location + "</div>" +
        "<div class='popup-line'><strong>Year: </strong>" + item.incident_year + "</div>" +
        "<div class='popup-line'><strong>Dead: </strong>" + item.number_dead + "</div>" +
        "<div class='popup-line'><strong>Injured: </strong>" + item.number_injured + "</div>";
      }

      else {
        popupContent = "<h5 class='popover-title'>" + item.company + "</h5>" +
        "<div class='popup-line'><strong>Year: </strong>" + item.incident_year + "</div>" +
        "<div class='popup-line'><strong>Dead: </strong>" + item.number_dead + "</div>" +
        "<div class='popup-line'><strong>Injured: </strong>" + item.number_injured + "</div>" +
        "<div class='popup-line'><strong>Total Damages: </strong>$" + app.numberWithCommas(item.total_damages) + "</div>" +
        "<div class='popup-line'><strong>Cause reported: </strong>" + item.cause + "</div>";
      }

      var popup = L.popup().setLatLng([lat, lng])
        .setContent(popupContent);

      marker.addTo(app.markerLayer);
      marker.bindPopup(popup);
      
      marker.on("click", findData);
      

      app.markerArray.push(marker);
    }

  }
};

app.addHotSpots = function(hotspots) {
  jQuery.each(hotspots, function(index, value) {
     var myIcon = L.divIcon({
      className: "hotspot-marker",
      iconSize: 100
    });
     var marker = L.marker(value.latlng, {
      icon: myIcon,
      zIndexOffset: 1000
    });

     marker.addTo(app.hotSpotLayer);
  });
};

app.hotSpots = [
  {
    latlng: [40.811540, -73.946887]
  },
  {
    latlng: [38.889988, -77.007771]
  },
  {
    latlng: [30.418999, -87.216812]
  }
];

app.reformatPage = function() {
  app.numWindowWidth = window.innerWidth;
  if (window.innerWidth / window.innerHeight < 1920 / 1080) {
    var numWidth = 100 * ((1920 / 1080) / (window.innerWidth / window.innerHeight));
    app.arrVideos.css({"width" : numWidth.toString() + "%", "left" : ((100 - numWidth) / 2).toString() + "%"});
  } else {
    app.arrVideos.css({"width" : "100%", "left" : "0%"});
  }
};

app.numberWithCommas = function(x) {
  if (!x) {
    return "";
  }
  else {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
};

app.listen = function() {

  app.window.on("resize", function() {
    app.setPanelInfo(app.currentCompany);

    
  });

  app.window.on("keypress", function(e) {
    
    if (e.which == 32 && !app.arrTextInputs.is(":focus") && !app.videoContainer.eq(0).hasClass('active') ) {
      app.audioPlayPause(app.currentPanel);

      if (app.currentPanel === 0) {
        app.arrAudioInner.eq(0).toggleClass("playing");
        app.arrAudioInner.eq(0).toggleClass("not-playing");
      }
    }

    else if (e.which == 32 && !app.arrTextInputs.is(":focus") && app.videoContainer.eq(0).hasClass('active')) {
      app.videoPlayPause(1);
      
      
    }
  });

  app.window.on("dataReady", function(){
    $(".preloader").find("img").fadeOut(500);
    window.setTimeout(function() {
      $(".preloader").eq(0).fadeOut(2000);
      app.arrVideos[0].play();
    }, 1000);
  });

  app.arrUnmuteButtons.click(function(e) {
    Analytics.click("intro unmute button clicked");
     var _this = jQuery(this);
    var intIndex = app.arrUnmuteButtons.index(this);
     app.audioPlayPause(intIndex);
     app.arrUnmuteButtons.eq(0).find("img").toggleClass("no-show");
     app.arrAudioInner.eq(0).toggleClass("playing");
     app.arrAudioInner.eq(0).toggleClass("not-playing");
    
  });

  app.arrAudios.eq(0).on("ended", function() {
    app.arrAudioInner.eq(0).toggleClass("playing");
    app.arrAudioInner.eq(0).toggleClass("not-playing");
  });

  app.arrAudioPlayButtons.click(function(e) {
    var _this = jQuery(this);
    var intIndex = app.arrAudioPlayButtons.index(this);
    app.audioPlayPause(app.currentPanel);
    
  });


  app.arrAudioForwardButtons.click(function(e) {
    var _this = jQuery(this);
    var intIndex = app.arrAudioForwardButtons.index(this);
    
    app.audioForward(app.currentPanel);
  });


  app.arrAudioBackButtons.click(function(e) {
    var _this = jQuery(this);
    var intIndex = app.arrAudioBackButtons.index(this);
    
    app.audioBack(app.currentPanel);
  });


  app.arrAudios.on("playing", function(e) {
    app.arrAudioPlayButtons.find("div").removeClass("play");
    app.arrAudioPlayButtons.find("div").addClass("pause");
  });

  app.arrAudios.on("pause", function(e) {
    app.arrAudioPlayButtons.find("div").removeClass("pause");
    app.arrAudioPlayButtons.find("div").addClass("play");
  });


  
  app.arrSeekDot.draggable({ containment: "parent", start: function ( event, ui) {
    app.blnAudioDrag = true;

  }, stop: function( event, ui ) {
      
      app.adjustProgress(app.currentPanel, true);
      
      
    }
  });

  app.seekBar.on("click", function(e) {
    var newPosition = 0;
    if (e.offsetX !== undefined) {
      newPosition = e.offsetX;
    }
    else {
      newPosition = e.originalEvent.layerX;
    }



    range = $(this).width();

    newPercent = newPosition/range;
    newTime = newPercent * app.arrAudios[app.currentPanel].duration;
    app.arrAudios[app.currentPanel].currentTime = newTime;
    app.adjustProgress(app.currentPanel, false);
  });

  window.addEventListener("orientationchange", function() {
    objImmerse.reformatPage();
  }, false);
  onresize=onload=function(){
    app.reformatPage();
  };

  // app.arrAudios.eq(0).on("ended", function() {
  //   app.setBeat(2);
  // });

  $("#open-menu").on("click", function() {
    Analytics.click("panel menu opened");
    var $body = $("body");
    if (!$body.hasClass("sidebar-active")) {
      $("body").addClass("sidebar-active");
    }
    
  });

  $("#close-menu").on("click", function() {
    var $body = $("body");
    if ($body.hasClass("sidebar-active")) {
      $("body").removeClass("sidebar-active");
    }
    
  });

  app.arrNavItems.on("click", function() {
    Analytics.click("panel navigation clicked");
    var intChapterNum = parseInt($(this).attr("data-chapter"));
    $("body").removeClass("sidebar-active");
    app.setBeat(intChapterNum);
  });

  app.arrChapterDots.on("click", function() {
    Analytics.click("chapter dot navigation clicked");
    var intChapterNum = parseInt($(this).attr("data-chapter"));
    app.setBeat(intChapterNum);
  });

  //video listeners

  // Event listener for the play/pause button
  app.videoPlayButton.on("click", function() {
    if (app.arrVideos[1].paused === true) {
      // Play the video
      app.arrVideos[1].play();

    } else {
      // Pause the video
     app.arrVideos[1].pause();

    }
  });

  //enable seeking with control dot
  app.videoSeekDot.draggable({ 
    containment: "parent",
    axis: "x",
    stop: function( event, ui ) {
      dotWidth = app.videoSeekDot.outerWidth();
      range = app.videoSeekBar.outerWidth() - dotWidth;
      position = ui.position.left;
      currentPercent = position / range;
      newTime = currentPercent * app.arrVideos[1].duration;
      app.arrVideos[1].currentTime = newTime;
    }
  });

  //updates position of video control dot
  app.arrVideos[1].addEventListener("timeupdate", function(e) {
    dotWidth = app.videoSeekDot.outerWidth();
    range = app.videoSeekBar.outerWidth() - dotWidth;
    currentProgress = app.arrVideos[1].currentTime / app.arrVideos[1].duration;
    newPosition = range * currentProgress;
    app.videoSeekDot.css("left", newPosition + "px");
  });

  app.videoSeekBar.on("click", function(e) {
    var newPosition = 0;
    if (e.offsetX !== undefined) {
      newPosition = e.offsetX;
    }
    else {
      newPosition = e.originalEvent.layerX;
    }

    range = app.videoSeekBar.outerWidth() - dotWidth;
    newPercent = newPosition/range;
    newTime = newPercent * app.arrVideos[1].duration;
    app.arrVideos[1].currentTime = newTime;
  });

  //keep the controls updated to whether or not video is playing
  app.arrVideos[1].addEventListener("playing", function(e) {
    app.videoPlayButton.addClass("pause");
    app.videoPlayButton.removeClass("play");
  });

  app.arrVideos[1].addEventListener("pause", function(e) {
    app.videoPlayButton.removeClass("pause");
    app.videoPlayButton.addClass("play");
  });

 app.videoContainer.on("mouseover", function(e) {
    app.videoControls.fadeIn();
  });

 app.videoContainer.on("mouseleave", function(e) {
    app.videoControls.fadeOut();
  });

 app.arrDataTagButtons.on("click", function(e) {
  var $this = $(this);
  var dataIndex = app.arrDataTagButtons.index($this);
  
  app.arrDataPopovers.eq(dataIndex).fadeIn(250);
 });

app.arrPopoverCloseButtons.on("click", function(e) {
  var $this = $(this);
  var dataIndex = app.arrPopoverCloseButtons.index($this);
  app.arrDataPopovers.eq(dataIndex).fadeOut(250);
});


app.introSubmit.on("click", function() {
  
  app.zipSubmit();
});

app.videoCloseButton.on("click", function() {
  app.videoContainer.eq(0).fadeOut(250);
  app.videoContainer.eq(0).removeClass('active');
  app.arrVideos[1].pause();
  app.arrVideos[1].currentTime = 0;
  app.setBeat(5);
});

};

app.setPanelInfo = function(company, missingData) {
  app.currentCompany = company;
  var arrCompareTags =  $(".data-charts").find(".compare-tag");
  app.panelExtraInfo.hide();

  
  if (company === null && missingData === true) {
    app.panelHead.text("No data available for this gas company");
    app.panelSub.empty();
    $(".data-charts").removeClass("show");
    arrCompareTags.removeClass("above");
    arrCompareTags.removeClass("below");
    arrCompareTags.removeClass("average");
    arrCompareTags.empty();
    
  }

  else if (company === null) {
    app.panelHead.empty();
    app.panelSub.empty();
    $(".data-charts").removeClass("show");
    arrCompareTags.removeClass("above");
    arrCompareTags.removeClass("below");
    arrCompareTags.removeClass("average");
    arrCompareTags.empty();
    app.arrPanelData.eq(0).addClass("hidden");
  }

  else if (!company) {
    app.panelHead.text("No data available for this gas company");
    app.panelSub.empty();
    $(".data-charts").removeClass("show");
    arrCompareTags.removeClass("above");
    arrCompareTags.removeClass("below");
    arrCompareTags.removeClass("average");
    arrCompareTags.empty();
  }


  
  else {
    app.panelHead.show();

    app.arrPanelData.eq(0).removeClass("hidden");

    if (!company.name && company.operator_name) {
      $(".data-charts").removeClass("show");
      app.panelHead.text(company.operator_name);
      app.panelSub.text(company.operator_city + ", " + company.operator_state);
      app.panelSub.show();
      
      var strDetailInfo = "Natural gas transmission pipeline operator with " + app.numberWithCommas(Math.round(company.total_miles_of_pipe)) + " miles of pipe. In addition to this location, this company also operates transmission pipelines in the following states: " + company.states_with_pipe + ".";

      app.panelExtraInfo.text(strDetailInfo);
      app.panelExtraInfo.show();
    }

    else {
      $(".data-charts").addClass("show");
     
      app.panelHead.text(company.name);
      app.panelSub.text(company.office_city + ", " + company.office_state);
      app.panelSub.show();

      app.drawChart("#data-column1", company.pct_totalbaremetal);
      app.drawChart("#data-column2", company.pct_pre1970miles);
      app.drawChart("#data-column3", company.percent_lostgas);
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
      
      app.compareAverages(company.pct_totalbaremetal, app.companyAverages.percent_metal_pipe, 1);
      app.compareAverages(company.pct_pre1970miles, app.companyAverages.percent_old_pipe, 2);
      app.compareAverages(company.percent_lostgas, app.companyAverages.percent_gas_lost, 3);
      app.compareAverages(company.hazleaks_per1000miles, app.companyAverages.leaks_per_1k, 4);
      
    }
  }    
};

app.compareAverages = function(companyData, averageData, columnNumber) {
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

app.lookupCompany = function(key, value, searchArray) {

  for (var i = 0, iLen = searchArray.length; i < iLen; i++) {

    if (searchArray[i][key] == value) return searchArray[i];
  }
};


app.startAudio = function(id) {
  var audio = document.getElementById(id);
  audio.play();
};

app.setLocation = function(err, data) {
console.log(data);

function callback(err, data) {
    
    app.userStateReadable = data.features[2].text;
    app.userState = data.features[2].text.toLowerCase();
    app.userState = app.userState.replace(/\s+/g, '');
    app.userPlace = data.features[0].text + ", " + data.features[2].text;


    app.setBeat(2);

  }
  
  if (!data.latlng) {
      app.arrIntroPopover.eq(0).fadeIn();

  }

  else if (data.results.features[0].id.substring(0, 8) !== "postcode") {
    app.arrIntroPopover.eq(0).fadeIn();
  }


  else {
     app.arrIntroPopover.eq(0).fadeOut();
     app.userLatLong = data.latlng;
     app.geocoderAll.reverseQuery([data.latlng[1], data.latlng[0]], callback); 

  }
};

app.zipSubmit = function(e) {
  var zip = $("#zip-input").val();
  app.userZip = zip;

  Analytics.click("zip code submitted: " + zip);

  //TODO add zip code validation
  if (app.userZip === "") {
    app.arrIntroPopover.eq(0).fadeIn();
    return false;
  }

  else if (app.userZip.split("").length !== 5) {
    app.arrIntroPopover.eq(0).fadeIn();
    return false;
  }


  else{
    var query = app.userZip + ", US"; 
    app.geocoder.query(query, app.setLocation);
   
    
  }
  
};

app.setAudio = function(fileName, intAudio) {
  var html ='<source src="audio/' + fileName + '.mp3" type="audio/mpeg"><source src="audio/' + fileName + '.ogg" type="audio/ogg">';
  var arrSources = app.arrAudios.eq(intAudio).find("source");
  jQuery.each(arrSources, function(sourceIndex) {
    if (sourceIndex === 0) {
      arrSources.eq(sourceIndex).attr({"src": "audio/" + fileName + ".mp3", "type": "audio/mpeg"}).detach().appendTo(app.arrAudios.eq(intAudio));
    } else {
      arrSources.eq(sourceIndex).attr({"src": "audio/" + fileName + ".ogg", "type": "audio/ogg"}).detach().appendTo(app.arrAudios.eq(intAudio));           
    }
  });
    app.arrAudios[intAudio].load();
    
    app.audioPlayPause(intAudio);
    
        
};

app.showMap = function(err, data) {
        // The geocoder can return an area, like a city, or a
        // point, like an address. Here we handle both cases,
        // by fitting the map bounds to an area or zooming to a point.


      

      if (!data.latlng) {

      }
      
      
      else {
        app.map.setView(data.latlng, 7);
      }
      



  };


app.getCompanies = function() {


  $.getJSON("js/companies.json", function(data) {
    app.companyData = data;
    app.window.trigger("dataReady");
  });

  $.getJSON("js/transmission.json", function(data) {
    app.transmissionCompanyData = data;
  });
};



app.drawChart = function(el, prop) {
  
  $el = $(el);
  $el.find("svg").remove();
  

  var w = $el.width() * 0.75;
  var radius = w/2;
  var barWidth = 10;

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
      .style("fill", "white");

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
      .attr("transform", "translate(-15, 5)")
      .attr("class", "chart-percent-text");

};

app.renderTime = function (numTotalSeconds) {
  var strTime, numHour, numMinute, numSecond;
  if ( isNaN(numTotalSeconds) ) {
    strTime = "0:00";
  }
  else if (numTotalSeconds >= 3600) {
      numHour = Math.floor(numTotalSeconds / 3600);
      numMinute = Math.floor((numTotalSeconds % 3600) / 60);
      numSecond = (numTotalSeconds % 3600) % 60;
      strTime = numHour.toString() + ":";
      if (numMinute < 10) {
        strTime += "0" + numMinute.toString() + ":";
      } else {
        strTime += numMinute.toString() + ":";
      }
      if (numSecond < 10) {
        strTime += "0" + numSecond.toString();
      } else {
        strTime += numSecond.toString();
      }
  } else if (numTotalSeconds >= 60) {
      numMinute = Math.floor(numTotalSeconds / 60);
      numSecond = numTotalSeconds % 60;
      strTime = numMinute.toString() + ":";   
      if (numSecond < 10) {
        strTime += "0" + numSecond.toString();
      } else {
        strTime += numSecond.toString();
      }
  } else {
      strTime = "0:";
      numSecond = numTotalSeconds;
      if (numSecond < 10) {
        strTime += "0" + numSecond.toString();
      } else {
        strTime += numSecond.toString();
      }   
  }
  return (strTime);
};




$(document).ready(function() {
  app.init();
});

(function() {

  var searchApp = angular.module('gasSearch', []);
  searchApp.controller('SearchController', function($http, $scope, $filter) {

    $scope.incidents = [];
    $scope.companies = [];
    $scope.filteredIncidents = [];

    $http.get("js/incidents.json").then(function(data) {
      $.each(data.data, function(index, value) {
        if ((value.latitude !== "") && (value.longitude !== "")) {
          $scope.incidents.push(value);
        }
      });
    });


    $http.get("js/companies.json").then(function(data) {
      $.each(data.data, function(index, value) {
        $scope.companies.push(value);
      });
    });

    this.blur = function() {

      window.setTimeout(function(){

         $scope.isFormOpen = false;

      }, 5);
    };

    this.openMarker = function(company, isFormOpen) {
      var resolved_map = app.map;
      var search_markers = app.markerArray;
      var new_lat;
      $scope.company = company;
      $scope.isFormOpen = false;
      angular.forEach(search_markers, function(value, key) {
        if (value.options.company == company) {
          var this_lat = value.getLatLng();
          if (resolved_map._zoom == 4) {
            new_lat = this_lat.lat + 8;
            resolved_map.panTo([new_lat, this_lat.lng]);
          } else if (resolved_map._zoom == 5) {
            new_lat = this_lat.lat + 5;
            resolved_map.panTo([new_lat, this_lat.lng]);
          } else if (resolved_map._zoom == 6) {
            new_lat = this_lat.lat + 4;
            resolved_map.panTo([new_lat, this_lat.lng]);
          } else {
            new_lat = this_lat.lat;
            resolved_map.panTo([new_lat, this_lat.lng]);
          }

          value.openPopup();
        }
      });

    };


    this.updateMap = function(strFilterTerm, arrSearch) {


      var search_markers = app.markerArray;
      var arrClean = [];
      angular.forEach(search_markers, function(value, key) {
        value.options.show_marker = false;
        value.options.marker_index = key;
        search_markers[key].options.show_marker = false;
        arrClean.push(value.options);
      });

      var filteredArray = [];

      if (strFilterTerm === "") {
        filteredArray = $filter('filter')(arrClean, strFilterTerm, false);
      }

      else {
        angular.forEach(arrClean, function(value, key) {
          if (value.company_id == strFilterTerm) {
            filteredArray.push(value);
          }
        });
      }
      
      angular.forEach(filteredArray, function(value, key) {
        search_markers[filteredArray[key].marker_index].options.show_marker = true;
      });
      
      angular.forEach(search_markers, function(value, key) {
        if (search_markers[key].options.show_marker === true) {
          app.map.addLayer(search_markers[key]);
        } else {
          app.map.removeLayer(search_markers[key]);
        }
      });

      $scope.filteredIncidents = filteredArray;
      
    };

    this.setComanyFocus = function(company) {
      app.setPanelInfo(company);
      app.panelHead.show();
      app.panelSub.show();
      $scope.isFormOpen = false;

      
      //set the map to show location of the selected company
      var location = company.hq_city + ", " + company.hq_state;
      var query = company.office_zip + ", US";
      app.geocoder.query(query, app.showMap);
      
      //set the filter term to be the full company name of the company selected
      $scope.filterTerm = company.name;

      //set the map to show only incidents with the company ID of the selected company
      this.updateMap(company.operator_id, $scope.incidents);

      if ($scope.filteredIncidents.length === 0) {
        app.arrMapInfoBox.hide().show();
      }

      else {
       app.arrMapInfoBox.hide().hide();
      }

      jQuery(".continue-button").show();
     
     
      
      jQuery(".continue-button").on("click", function() {
        app.searchCont.find("input").val("");
        $scope.filterTerm = "";
        $scope.search.updateMap("", $scope.incidents);
        app.setBeat(4);
      });

       jQuery(".select-new-button").on("click", function() {
        app.searchCont.find("input").val('');
        $scope.filterTerm = "";
        $scope.search.updateMap("", $scope.incidents);
         app.searchCont.addClass("active");
         jQuery(".continue-button").hide();
        jQuery(".select-new-button").hide();
        app.setPanelInfo(null);
       });

       jQuery(window).on("resetSearch", function() {
        $scope.filterTerm = "";
        $scope.search.updateMap("", $scope.incidents);
        app.searchCont.find("input").val("");
       });

      function showMap(err, data) {
        // The geocoder can return an area, like a city, or a
        // point, like an address. Here we handle both cases,
        // by fitting the map bounds to an area or zooming to a point.
        
        
            app.map.setView(data.latlng, 7);
        
      }
    };

    this.endComanyFocus = function(company) {
      app.setPanelInfo(company);
      app.panelHead.show();
      app.panelSub.show();
      $scope.isFormOpen = false;
      jQuery(window).on("resetSearch", function() {
        $scope.filterTerm = "";
        $scope.search.updateMap("", $scope.incidents);
        app.searchCont.find("input").val("");
       });

      if(company !== null) {
        //set the map to show location of the selected company
        var location = company.hq_city + ", " + company.hq_state;
        var query = company.office_zip + ", US";
        app.geocoder.query(query, app.showMap);
        
        //set the filter term to be the full company name of the company selected
        $scope.filterTerm = company.name;

        //set the map to show only incidents with the company ID of the selected company
        this.updateMap(company.operator_id, $scope.incidents);

        if ($scope.filteredIncidents.length === 0) {
          app.arrMapInfoBox.hide().show();
        }

        else {
          app.arrMapInfoBox.hide().hide();
        }
      }
      

     
      else {
        app.map.setView([39.642624, -98.169883], 5);
        app.arrMapInfoBox.hide().hide();
      }



      function showMap(err, data) {
        // The geocoder can return an area, like a city, or a
        // point, like an address. Here we handle both cases,
        // by fitting the map bounds to an area or zooming to a point.
        
        
            app.map.setView(data.latlng, 7);
        
      }
    };

    this.clear = function() {
      $scope.filterTerm = "";
      app.searchContEnd.find("input").val($scope.filterTerm);
      $scope.search.endComanyFocus(null);
      $scope.search.updateMap($scope.filterTerm, $scope.incidents);

    };

    this.search = function() {
      Analytics.click("typed in company search box");
      app.arrPanelData.eq(0).addClass("hidden");
      if ($scope.filterTerm !== "") {
        
        $scope.isFormOpen = true;
      }
      else {
        $scope.isFormOpen = false;
        $scope.filterTerm = "";
        $scope.search.updateMap("", $scope.incidents);
      }
    };

  });


})();
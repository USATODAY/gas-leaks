var app = app || {};
app.data = [];
app.markerArray = [];
app.markerLayer = {};
app.currentLocation = 1;
app.currentPanel = 0;



app.init = function() {

 
  app.window = jQuery(window);


  

  

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

  // Buttons
  app.playButton = jQuery("#play-pause");

  // Sliders
  app.videoSeekBar = jQuery("#seek-bar");
  app.videoSeekDot = jQuery("#video-dot");
  app.chapterHead = jQuery("#chapter-header");
  app.descriptionHead = jQuery("#description-header");



  app.arrIntroPopover = jQuery(".intro-popover");

  app.arrMapInfoBox = jQuery(".js-no-incidents-box");



  //start listening
  app.listen();

};


app.reformatPage = function() {
  app.numWindowWidth = window.innerWidth;
  if (window.innerWidth / window.innerHeight < 1920 / 1080) {
    var numWidth = 100 * ((1920 / 1080) / (window.innerWidth / window.innerHeight));
    app.arrVideos.css({"width" : numWidth.toString() + "%", "left" : ((100 - numWidth) / 2).toString() + "%"});
  } else {
    app.arrVideos.css({"width" : "100%", "left" : "0%"});
  }
};

app.audioPlayPause = function(intAudio) {

  if (app.arrAudios[intAudio].paused) {
    app.arrAudios[intAudio].play();
    app.arrAudios[intAudio].volume = 1;
    app.intPlayId = setInterval(function() {
      app.adjustProgress(intAudio, false);
    }, 950);
    
  } 
  else {
    app.arrAudios[intAudio].pause();
    clearInterval(app.intPlayId);
  }
  // app.arrAudioInner.eq(intAudio).toggleClass('not-playing');
  
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

app.listen = function() {



  app.arrUnmuteButtons.click(function(e) {
     var _this = jQuery(this);
    var intIndex = app.arrUnmuteButtons.index(this);
     app.audioPlayPause(intIndex);
     app.arrUnmuteButtons.eq(0).find("img").toggleClass("no-show");
    
  });


  




  window.addEventListener("orientationchange", function() {
    objImmerse.reformatPage();
  }, false);
  onresize=onload=function(){
    app.reformatPage();
  };





};

$(document).ready(function() {
  app.init();
});
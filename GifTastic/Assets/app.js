var q;
var limit = 10;
var apiKey = "96q4xCDQ26HgzN3CHLgjM7oJuSUnYffu"
var topicTitle;
var header = $("#header")
var sticky = header.offsetTop;
var colorSwitch = false;
var topics = ["Batman", "Spiderman", "Wonder Woman", "Iron man", "The Incredible Hulk", "Scarlet Witch"];
var favorites = [];
var firstAdd = false;
var heroFavs = false;


$(document).ready(function(){
   
toggleFavPanel();

loadTopics();


$('body').on('click', '.btnTopic', function(){
        var thisBtn = $(this)
        btnTopicClick(thisBtn);   
    })


$('body').on('click', '.gif', function(){
        var state = $(this).attr("dataState")
        if(state === "still"){
            $(this).attr('src', $(this).attr("animate-url"));
            $(this).attr('dataState', "animate");
        } else {
            $(this).attr('src', $(this).attr("still-url"));
            $(this).attr('dataState', "still")
        }
   })



$("#add-topic").on('click', function(){
        addTopic();
    })

$('#topic-input').keypress(function(e){
        var key = e.which;
        if(key === 13){
            addTopic();
        }
    })

$('body').on('click', '.btnFavorite', function(){
        var thisBtn = $(this);
        addToFav(thisBtn)
        
    })

$('body').on('click', '.toggle-favs', function(){
        if($(this).attr('id') === 'hero-favs'){
        heroFavs = true;
        }else{
            heroFavs = false;
        }
        toggleFavPanel();
    })

$('body').on('click', '.btnRemove', function(){
        var Id = $(this).attr("id")
        Id = Id.substr(3)
        var btn = $('#' + Id)
        console.log(btn.length)
        if(btn.length > 0){
            addToFav(btn)
        } else {
            var idx = favorites.indexOf(Id)
            favorites.splice(idx, 1)
            updateLocalStorage("storedFavorites", favorites)
            processFavorites()
            if(favorites.length === 0){
                heroFavs = false;
                toggleFavPanel();
            }
        }
        
    })
    
})




function loadTopics(){
    for(i = 0; i < topics.length; i++){
        $("<button>")
        .attr({
            "class": "btn btn-primary btnTopic", 
            "dataTopic": topics[i], 
            "btnState": "inactive"
            })
        .text(topics[i])
        .appendTo("#categories")
    }
}

function updateLocalStorage(key, value){
    if(localStorage[key]){
        localStorage.removeItem(key);
    }
        localStorage.setItem(key, JSON.stringify(value));  
}
    


function addTopic(){

    var topicToAdd = $("#topic-input").val().trim();
    
    if(topicToAdd.length > 0){
        $("<button>")
        .attr({"class": "btn btn-primary btnTopic", "dataTopic": topicToAdd, "btnState": "inactive"})
        .text(topicToAdd)
        .appendTo("#categories")
        
        topics.push(topicToAdd)

        updateLocalStorage("storedTopics", topics)

        $("#topic-input").val("")
    }
}


function btnTopicClick(thisBtn){

    topicTitle = $(thisBtn).attr("dataTopic");
    
    q = topicTitle.replace(/\s/g, "-");
    q = q.replace(/'/g, "");
 
     var state = $(thisBtn).attr("btnState");

    if(state === "inactive"){
        $(thisBtn)
        .addClass("clicked")
        .attr({"btnState": "active"})
        .prepend("&#10003; ");

        queryAPI()

    } else {

        var topicID = "#" + q

        $(".topicPanel").remove(topicID);

        $(thisBtn)
            .removeClass("clicked")
            .blur()
            .attr('btnState', "inactive")
            .text(topicTitle);
    }
}
 
     

function queryAPI(){

    var queryURL = "https://api.giphy.com/v1/gifs/search?api_key=" + apiKey + "&limit=" + limit
    queryURL += "&q=" + q

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response){

        var results = response.data;
        console.log(results)
        
        var topicPanel = $('<div>').attr({
                                    'class': "panel panel-default topicPanel",
                                    'id': q
                                    })

        var panelHeading = $('<div class="panel-heading">')
                            .attr({
                                'data-toggle': "collapse",
                                'href': "#collapse-" + q
                            })
                            .text(topicTitle)
                            .appendTo(topicPanel)
            
            if(colorSwitch){
                panelHeading.css({
                    'background': '#a63a50',
                    'border-color': '#a63a50'
                    })
                colorSwitch = false;
            } else {
                colorSwitch = true;
            }

        var glyphSpan = $('<span>')
                        .html("<p>")
                        .appendTo(panelHeading)

        var glyph = $('<i class="glyphicon glyphicon-chevron-up">')
                    .appendTo(glyphSpan)
        

        var collapseDiv = $('<div class="panel-collapse collapse in">')
                        .attr('id', "collapse-" + q)
                        .appendTo(topicPanel)
                        .on('shown.bs.collapse', function() {
                            glyph.addClass('glyphicon-chevron-up').removeClass('glyphicon-chevron-down')})
                        .on('hidden.bs.collapse', function() {
                            glyph.addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-up')});

        var panelBody = $('<div class="panel-body">')
                        .appendTo(collapseDiv)

        for(var i = 0; i < results.length; i++){
            var gifID = results[i].id
            var labelDiv = $('<div>')
            var label = "<b> Rating: " + results[i].rating.toUpperCase() + "</b>"
            var btnFavorite = $('<button class="btn btn-default btnFavorite">')
                            .attr('id', gifID)
                labelDiv.html(label)
                updateFavBtn(btnFavorite) 
                labelDiv.prepend(btnFavorite) 
          
            var resultImage = $("<img>");

            resultImage.attr({
                'src': results[i].images.fixed_height_still.url, 
                'dataState': "still",
                'animate-url': results[i].images.fixed_height.url,
                'still-url': results[i].images.fixed_height_still.url,
                'class': "gif",
                'alt': results[i].title,
                'id': "#gif-" + gifID
                });
            
            var resultDiv = $('<div class="resultDiv">')
                            .append(labelDiv, resultImage)
        
                panelBody.prepend(resultDiv)
        }

        $("#results").prepend(topicPanel);
    })
}


function processFavorites(){
    $('#favBody').empty();

    
    if(heroFavs && favorites.length > 0){  
        var queryURL = "https://api.giphy.com/v1/gifs?api_key=" + apiKey + "&ids=" + favorites
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).done(function(response){
            var results = response.data
            
            for(i=0; i < results.length; i++){
                var resultImage = $("<img>");

                resultImage.attr({
                    'src': results[i].images.fixed_height_still.url, 
                    'dataState': "still",
                    'animate-url': results[i].images.fixed_height.url,
                    'still-url': results[i].images.fixed_height_still.url,
                    'class': "gif",
                    'alt': results[i].title,
                    'id': "#fav-" + results[i].id
                });
                var Id = 'rmv' + results[i].id
                var resultDiv = $('<div class="resultDiv">')
                var favRemove = $('<span class="glyphicon glyphicon-remove">')
                var btnRemove = $('<button class="btn btn-default btnRemove">')
                                .attr("id", Id)
                                .append(favRemove)
                resultDiv.append(btnRemove, resultImage)
                $('#favBody').prepend(resultDiv)
            }   
        })
    }
}

function updateFavBtn(thisBtn){
    thisBtn.empty();
    var Id = $(thisBtn).attr("id");
    var btnState = $(thisBtn).attr("btnState")
    var favStar = $('<span class="glyphicon">')
    if(favorites.indexOf(Id) < 0){
        $(thisBtn).attr("btnState", "inactive")
        favStar.removeClass("glyphicon-star").addClass("glyphicon-star-empty")
       
    } else {
        $(thisBtn).attr("btnState", "active")
        favStar.removeClass("glyphicon-star-empty").addClass("glyphicon-star")  
    }
        $(thisBtn).append(favStar)
}


function addToFav(thisBtn){
    var btnID = $(thisBtn).attr("id")
    var favStar = $('<span class="glyphicon glyphicon-star">')
        if(favorites.indexOf(btnID) < 0){
            $(thisBtn).attr("btnState", "active")
            favorites.push(btnID)
        } else {
            $(thisBtn).attr("btnState", "inactive")
            var idx = favorites.indexOf(btnID)
            favorites.splice(idx, 1)
        }
        var favCount = favorites.length;
        $('#hero-favs')
        .html(" (" + favCount + ")")
        .prepend(favStar)
        updateFavBtn(thisBtn)
        updateLocalStorage("storedFavorites", favorites)
        processFavorites()
        if(favCount === 0){
            heroFavs = false;
            toggleFavPanel()
        }
        if(!firstAdd){
            firstAdd = true;
            heroFavs = true;
            toggleFavPanel();
        }
}

function toggleFavPanel(){
    var favCount = favorites.length;
    var favStar = $('<span class="glyphicon glyphicon-star">')
    if(heroFavs && favCount > 0){
        $('#hero-favs').hide()
        $('#results').addClass('col-md-8')
        $('#favorites').removeClass('col-xs-0').addClass('col-xs-12 col-md-4')
        
        var favPanel = $('<div>')
            .attr({
            'class': "panel panel-default",
            'id': "favPanel"
            })
        
        var favHeading = $('<div class="panel-heading">').appendTo(favPanel)
        var favTitle = $('<h3 class="panel-title">').html("Favorites<br>").appendTo(favHeading)
        var hideFavs = $('<button class="btn btn-default toggle-favs">')
                        .text(" Hide")
                        .attr("id", "hide-favs")
                        .appendTo(favTitle);
        
        hideFavs.prepend(favStar)
        var favBody = $('<div class="panel-body" id="favBody">').appendTo(favPanel)
        favPanel.appendTo("#favorites")
        firstAdd = true;
        processFavorites();
        } else {
            
            $('#hero-favs')
        .html(" (" + favCount + ")")
        .prepend(favStar)
        .show()
            $('#favorites').empty();
            $('#results').removeClass('col-md-8')
            $('#favorites').removeClass('col-xs-12 col-md-4').addClass('col-xs-0')
        }
    }
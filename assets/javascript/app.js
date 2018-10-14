var lat;
var long;
var trailLocations;

var currentHikeArray;
var currentHike; //This is the object that has the trail data

$(document).ready(function () {
    $('#trails').hide()
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAZqzebB-sUFbmJ3RlEJzm_QZWP_FQwNbI",
        authDomain: "zero-mark-project-1.firebaseapp.com",
        databaseURL: "https://zero-mark-project-1.firebaseio.com",
        projectId: "zero-mark-project-1",
        storageBucket: "",
        messagingSenderId: "1001665569926"
    };
    firebase.initializeApp(config);

    var database = firebase.database();


    // END FIREBASE INITIALIZATION




    $("#searchForm").on("submit", function (event) {
        event.preventDefault();
        $('#trails').show()
        var location = $("#UserSearchInput").val();
        //console.log("User Inputted Location: " + location);

        var googleMapsQueryURL = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCZHm522MDtZTsy5gXFX2ni9rsUYdKXCh4&address=" + location;

        $.ajax(
            {
                url: googleMapsQueryURL,
                method: "GET"
            }).then(function (response) {
                var googleMapsResults = response.results[0];
                //console.log("Google Maps API Return: " + googleMapsResults);

                lat = googleMapsResults.geometry.location.lat;
                long = googleMapsResults.geometry.location.lng;
                //console.log("Latitude from User Input: " + lat);
                //console.log("Longitude from user Input: " + long);

                var hikingProjectQueryURL = "https://www.hikingproject.com/data/get-trails?key=200337065-b63aa83fc2f455dc1c697f8710938ca8&sort=distance&lat=" + lat + "&lon=" + long;

                //console.log(hikingProjectQueryURL);

                $.ajax(
                    {
                        url: hikingProjectQueryURL,
                        method: "GET"
                    }).then(function (response) {
                        currentHikeArray = response.trails;

                        //console.log(response.trails[0]);

                        var trailNumber =
                        {
                            0: "A",
                            1: "B",
                            2: "C",
                            3: "D",
                            4: "E",
                            5: "F",
                            6: "G",
                            7: "H",
                            8: "I",
                            9: "J"
                        };

                        trailLocations = [];

                        $("#trails").html("<h3>Pick a Hike!</h3>");

                        for (var i = 0; i < response.trails.length; i++) {
                            trailLocations.push(
                                {
                                    lat: response.trails[i].latitude,
                                    lng: response.trails[i].longitude,
                                    name: response.trails[i].name,
                                    summary: response.trails[i].summary,
                                    image: response.trails[i].imgSmallMed,
                                    length: response.trails[i].length,
                                    ascent: response.trails[i].ascent,
                                    difficulty: response.trails[i].difficulty,
                                    stars: response.trails[i].stars,
                                    id: i
                                })


                            var trailDiv = $("<div>");
                            var trailList = $("<ul>");
                            var trailName = $("<p data-toggle='modal' data-target='#hikeInformation' class='clickedHike'>").html("<a href='#'>" + trailNumber[i] + ": " + response.trails[i].name + "</a>");
                            trailName.attr("id", i);
                            var trailSummary = $("<li>").text(response.trails[i].summary);
                            var trailLocation = $("<li>").text(response.trails[i].location);

                            trailList.append(trailSummary);
                            trailList.append(trailLocation);

                            trailDiv.append(trailName);
                            trailDiv.append(trailList);


                            $("#trails").append(trailName);
                            $("#trails").append(trailList);
                        }
                        //console.log("Array of trails returned by Trail API: " + trailLocations);

                        $(document).on("click", ".clickedHike", function () {
                            var id = $(this).attr("id");
                            //console.log("ID: " + id);
                            currentHike = currentHikeArray[id];
                            console.log(currentHike);

                            $("#trailInfo button").prop("disabled", false);

                            $(".hikeName").text(response.trails[id].name);
                            $(".card-text").text(response.trails[id].summary);
                            $("#trailInfoImage").attr("src", response.trails[id].imgSmallMed);
                            $(".card-img-top").attr("src", response.trails[id].imgSmall);
                            $("#mileage").text("Miles: " + response.trails[id].length);
                            $("#elevationGain").text("Elevation Gain: " + response.trails[id].ascent + "'");
                            $("#difficulty").text("Difficulty: " + response.trails[id].difficulty);
                            $("#stars").text("Stars: " + response.trails[id].stars);

                            var googleDirections = $("<iframe allowfullscreen>");
                            googleDirections.attr
                                (
                                {
                                    "width": "490",
                                    "height": "300",
                                    "frameborder": "0",
                                    "style": "border: 0",
                                    "src": "https://www.google.com/maps/embed/v1/directions?key=AIzaSyCZHm522MDtZTsy5gXFX2ni9rsUYdKXCh4&origin=" + lat + "," + long + "&destination=" + response.trails[id].latitude + "," + response.trails[id].longitude,
                                }
                                )
                            //console.log(googleDirections);
                            $("#directions").html(googleDirections);

                            getWeather(response.trails[id].latitude, response.trails[id].longitude);

                        });

                        $("#UserSearchInput").val("");


                        $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCZHm522MDtZTsy5gXFX2ni9rsUYdKXCh4&callback=initMap');

                    });
            });
    });



    // SHARE YOUR HIKE SUBMISSION

    // HIKE SHARE SUBMIT BUTTON
    $("#submitHike-btn").on("click", function (event) {
        event.preventDefault();

        // Grabs user input
        var hikerName = $("#hiker-name").val().trim();
        var startTime = $("#start-time").val();
        var endTime = $("#end-time").val();



        // Table Calculations
        var hikeTime = moment(endTime, "HH:mm").diff(moment(startTime, "HH:mm"), "minutes");
        var hikeHours = Math.floor(hikeTime / 60);
        var hikeMinutes = (hikeTime % 60);
        var formattedHikeTime = (hikeHours + " hrs " + hikeMinutes + " min");
        var avgSpeed = ((currentHike.length / hikeTime) * 60);
        var formattedSpeed = avgSpeed.toFixed(2);
        var timestamp = firebase.database.ServerValue.TIMESTAMP;

        var formattedDate = moment(timestamp).format("MMM Do YYYY");


        // Store everything into a variable. I don't know why I need this...
        // var hikerName = childSnapshot.val().name;
        // var startTime = childSnapshot.val().start;
        // var endTime = childSnapshot.val().end;
        // var hikeDate = childSnapshot.val().timestamp;

        // Create object to push to firebase
        var logHike = {
            name: hikerName,
            start: startTime,
            end: endTime,
            timestamp: timestamp,
            currenthike: currentHike.name,
            hiketimeformatted: formattedHikeTime,
            dateformatted: formattedDate,
            hikelength: currentHike.length,
            speedformatted: formattedSpeed
        };

        // Uploads object data to the database
        database.ref().push(logHike);


    })

    // Create Firebase event for adding hike to the database and a row in the html when a user adds an entry
    database.ref().on("child_added", function (childSnapshot) {
        console.log(childSnapshot.val());


        // Create the new row
        var newRow = $("<tr>").prepend(
            $("<td>").text(childSnapshot.val().name),
            $("<td>").text(childSnapshot.val().currenthike),
            $("<td>").text(moment(database.dateformatted).format("MMM Do YYYY")),
            $("<td>").text(childSnapshot.val().hikelength),
            $("<td>").text(childSnapshot.val().hiketimeformatted),
            $("<td>").text(childSnapshot.val().speedformatted)
        );

        // Prepend the new row to the table
        $("#user-hike-table > tbody").prepend(newRow);

        $("#hiker-name, #start-time, #end-time").val("");


    })

})

function getWeather(lat, long) {
    var openWeatherURL = "https://api.openweathermap.org/data/2.5/weather?APPID=8d9034659152ad4acebd9a50878badc9&units=imperial&lat=" + lat + "&lon=" + long;

    //console.log("OpenWeatherMap URL :" + openWeatherURL);

    $.ajax(
        {
            url: openWeatherURL,
            method: "GET"
        }).then(function (res) {
            //console.log(res.main.temp);
            //console.log("Inside Weather Function");
            $("#weather").html("Weather: " + res.main.temp + " &#176;F");
        });
}

function initMap() {
    //console.log("Lat for current Google Map: " + lat + " Long for current Google Map: " + long);

    var map = new google.maps.Map(document.getElementById('trailMap'), {
        zoom: 9,
        center: { lat: lat, lng: long }
    });

    // Create an array of alphabetical characters used to label the markers.
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Add some markers to the map.
    // Note: The code uses the JavaScript Array.prototype.map() method to
    // create an array of markers based on a given "locations" array.
    // The map() method here has nothing to do with the Google Maps API.
    var markers = trailLocations.map(function (location, i) {
        //console.log(location);
        var marker = new google.maps.Marker({
            position: location,
            label: labels[i % labels.length],
            name: location.name,
            summary: location.summary,
            image: location.image,
            length: location.length,
            ascent: location.ascent,
            difficulty: location.difficulty,
            stars: location.stars,
            id: location.id
        });

// REFRESH COMMENT

        google.maps.event.addListener(marker, 'click', function () {
            //console.log(location.lat);
            //console.log(this.id);

            currentHike = currentHikeArray[this.id];
            $("#trailInfo button").prop("disabled", false);
            console.log(currentHike);

            getWeather(location.lat, location.lng);

            $(".hikeName").text(this.name);
            $(".card-text").text(this.summary);
            $("#trailInfoImage").attr("src", this.image);
            $(".card-img-top").attr("src", this.image);
            $("#mileage").text("Miles: " + this.length);
            $("#elevationGain").text("Elevation Gain: " + this.ascent + "'");
            $("#difficulty").text("Difficulty: " + this.difficulty);
            $("#stars").text("Stars: " + this.stars);
        });

        var googleDirections = $("<iframe allowfullscreen>");
        googleDirections.attr
            (
            {
                "width": "600",
                "height": "450",
                "frameborder": "0",
                "style": "border: 0",
                "src": "https://www.google.com/maps/embed/v1/directions?key=AIzaSyCZHm522MDtZTsy5gXFX2ni9rsUYdKXCh4&origin=" + lat + "," + long + "&destination=" + location.lat + "," + location.lng
            }
            )
        $("#directions").html(googleDirections);

        return marker;
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers,
        { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
};
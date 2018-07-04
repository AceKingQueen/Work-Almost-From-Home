//declare global variables
var map;
var service;
var infowindow;

//initialize the map using Google's API
function initialize(location) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: location,
    zoom: 10,
  })

  //send map attributes through the Places service
  service = new google.maps.places.PlacesService(map);
}

//callback function taking results and status to make sure the service
//if ok, initialize the createMarker function for the results array values
function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    createMarker(results[0])

  }
}

//creates the markers based on the company names from our ziprecruiter API call
function createMarker(place) {
  infowindow = new google.maps.InfoWindow();
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  //provides a title for the marker that shows the company name upon click
  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

//clears the jobListing div and appends a new line in our table for campany name and open position
function drawDescriptions(jobs) {
  $('#jobListing ul').empty();

  //looping through the jobs and creating a new line item for each
  jobs.forEach(job => {
    $('#jobListing ul').append(
      `<li>${job.hiring_company.name}: ${job.name}</li>`
    )
  })
}

//on button click, show the input fields
$("#searchBtn").click(function () {
  $("#searchDiv").show(300);
});

//clicking the go button takes the input values and runs them through both the google and ziprecruiter APIs
$("#goBtn").click(function () {
  var address = $("#address").val().trim().replace(/\s/g, "+");
  var title = $("#title").val().trim().replace(/\s/g, "+");
  var mapUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${address}&search=${title}&key=AIzaSyAQ8pKhLCXAwbt00iqGb_Mg5ZN6ZY-6138`;
  var zipQueryURL = `https://api.ziprecruiter.com/jobs/v1?search=${title}%20Job&location=${address}&radius_miles=25&days_ago=10&jobs_per_page=10&page=1&api_key=gjetj6yzdta73384442bezn9sp8tfwbe`;

  //placing the GET call to the maps API and returning a lat and lng that are entered into the location
  $.ajax({
    url: mapUrl,
    method: 'GET'
  }).then((res) => {
    var lng = res.results["0"].geometry.location.lng;
    var lat = res.results["0"].geometry.location.lat;

    var locate = new google.maps.LatLng(lat, lng);
    initialize(locate);

    //placing the GET call to ziprecruiter API and returning the company name for the listing
    $.ajax({
      url: zipQueryURL,
      method: 'GET',
    }).then((zipData) => {
      var companies = zipData.jobs.map(job => {
        return job.hiring_company.name
      })

      console.log(zipData);

      drawDescriptions(zipData.jobs);

      //loops through the returned company names and populates the request object
      //this feeds back to the createMarkers function
      companies.forEach(company => {
        var request = {
          location: locate,
          radius: '3500',
          query: company
        }
        service.textSearch(request, callback);
      });

    });
  })
})
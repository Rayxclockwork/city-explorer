'use strict';

//all required
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');

const app = express();
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  // intercept OPTIONS method
  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3001; //reading port 3000 from .env

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);

let locales = {};

function handleLocation (request, response){
  const city = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`;

  if( locales[url] ){
    console.log('using cache');
    response.send(locales[url]);
  } else {
    console.log('getting data from api');
    superagent.get(url)
      .then(resultsFromSuperagent => {
        // console.log(resultsFromSuperagent.body.results[0].geometry);
        const locationObj = new Location(city, resultsFromSuperagent.body.results[0]);

        // store location in the in-memory location object cache
        locales[url] = locationObj;

        response.status(200).send(locationObj);
      })
      .catch ((error) => {
        console.error(error);
        response.status(500).send('Our bad, yo.');
      })
  }
}



function handleWeather(request, response){
  const locObj = request.query.data;

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${locObj.latitude},${locObj.longitude}`;

  superagent.get(url)
    .then(resultsFromSuperagent => {
      // console.log(resultsFromSuperagent.body);

      const weeklyWeather = resultsFromSuperagent.body.daily.data.map(day => {
        return new Weather(day);
      })

      response.status(200).send(weeklyWeather);
    })
    .catch ((error) => {
      console.error(error);
      response.status(500).send('Not happening. Sorry.');
    })
}

function handleTrails(request, response){
  const locObj = request.query.data;

  const url = `https://www.hikingproject.com/data/get-trails?lat=${locObj.latitude}&lon=${locObj.longitude}&key=${process.env.TRAIL_API_KEY}`;

  superagent.get(url)
    .then(resultsFromSuperagent => {
      // console.log(resultsFromSuperagent.body);

      const trailsData = resultsFromSuperagent.body.trails.map(prop => {
        return new Trail(prop);
      })

      response.status(200).send(trailsData);
    })
    .catch ((error) => {
      console.error(error);
      response.status(500).send('Not happening. Sorry.');
    })
}

//app.get('/', (request, response) => response.send('Hello World!'))

//error msg handling for status 404
app.get('*',(request, response) => {
  //response.status(404).send('not found');
  const Error = {
    status: 500,
    responseText: 'Sorry, something went wrong'
  };
  response.send(Error);
})

//this function takes location data submitted from user query and instantiate a series of objects.
// function fetchLocation(location){
//   const geoData = require('./data/geo.json');
//   const locationObj = new Location(location, geoData);
//   return locationObj;
// }


function Location(city, geoData){
  this.search_query = city;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

function Weather(weaData){
  this.forecast = weaData.summary;
  let dateData = new Date(weaData.time * 1000);
  this.time = dateData.toDateString();
}

function Trail(trailData){
  // "name": "Rattlesnake Ledge",
  // "location": "Riverbend, Washington",
  // "length": "4.3",
  // "stars": "4.4",
  // "star_votes": "84",
  // "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
  // "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
  // "conditions": "Dry: The trail is clearly marked and well maintained.",
  // "condition_date": "2018-07-21",
  // "condition_time": "0:00:00 "
  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.url;
  this.conditions = trailData.conditionStatus;
  this.condition_date = trailData.conditionDate;
  this.condition_time = trailData.conditionDate;
}

app.listen(PORT, () => console.log(`app is listening on port ${PORT}!`))


/*
app.get('/location', handleLocation)
function handleLocation(request, response){
  //code block
}
*/

/*
  superagent.get('absolute url')
  .then(response from superagent => {
    responseFromSuperAgent.body
  })
  .catch(console.error)
*/

/*in-memeory-cache
//if locations doesn't have it, fetch it, and store it.
let locations = {};
/////////////////*/

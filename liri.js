// Set variables from Dotenv
require("dotenv").config();

// Initialize all Keys
let keys = require('./keys.js'),
    request = require('request'),
    fs = require('fs'),
    Spotify = require('node-spotify-api'),
    axios = require("axios"),
    moment = require("moment"),
    omdb = require("omdb"),
    method = process.argv[2],
    search = process.argv.slice(3).join(' ');

let liriBot = function () {
    if (method === 'concert-this') {
        console.log('Loading results! Enjoy the show!')
        bandsSearch(search);
    }
    else if (method === 'spotify-this-song') {
        console.log("Loading results! Prepare to jam out.");
        if (search === undefined) {
            search = 'The Sign Ace of Base';
        }
        songSearch(search);
    }
    else if (method === 'movie-this') {
        console.log("Loading results! Pass the popcorn?")
        if (search === undefined) {
            search = 'Mr. Nobody';
        }
        movieSearch(search);
    }
    else if (method === 'do-what-it-says') {
        doWhatevSearch();
    }
}

let doWhatevSearch = function () {
    fs.readFile('random.txt', 'utf-8', (err, data) => {
        if (err) {
            return console.log('Error occurred: ' + err)
        }
        else {
            let feedArray = data.split(",");
            method = feedArray[0];
            search = feedArray[1];
            liriBot();
        }
    });
}

let bandsSearch = function () {
    axios.get('https://rest.bandsintown.com/artists/' + search + '/events?app_id=codingbootcamp')
        .then(function (response) {
            let drillDown    = response.data[0],
                venueName    = drillDown.venue.name,
                venueLocale  = drillDown.venue.city + ", " + drillDown.venue.country,
                rawEventDate = drillDown.datetime,
                eventDate    = moment(rawEventDate).format('L');
            console.log(venueName, venueLocale, eventDate);
        })
        .catch(function (error) {
            console.log("error");
        });

}

let songSearch = function () {
    let spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret
    });

    spotify.search({ type: 'track', query: search }, function (err, data) {
        if (err) {
            return console.log('Error: ' + err);
        }

        let drillDown = data.tracks.items[0],
            artist = drillDown.artists[0].name,
            songName = drillDown.name,
            album = drillDown.album.name;
        let previewLink = drillDown.preview_url ? drillDown.preview_url : '[No preview link]';
        console.log(artist, songName, previewLink, album);
    });
}

let movieSearch = function() {
    axios.get('http://www.omdbapi.com/?apikey='+keys.omdb.id+'&t='+search)
        .then(function (response) {
            let drillDown            = response.data;
                title                = drillDown.Title,
                releaseYear          = drillDown.Year,
                imdbRating           = drillDown.imdbRating,
                rottentomatoesRating = drillDown.Ratings[1].Value,
                country              = drillDown.Country,
                language             = drillDown.Language,
                plot                 = drillDown.Plot,
                actors               = drillDown.Actors;
            console.log(title, "\n"+releaseYear, "\n"+imdbRating, "\n"+rottentomatoesRating, "\n"+country, "\n"+language, "\n"+plot, "\n"+actors, "\n----------------\n");
        })
        .catch(function (error) {
            console.log("error");
        });

}

liriBot();
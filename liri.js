// NPM Packages
require('dotenv').config();
var inquirer = require('inquirer');
var axios = require('axios');
var Spotify = require('node-spotify-api');
var keys = require('./keys.js');
var moment = require('moment');
var fs = require('fs');
var spotify = new Spotify(keys.spotify);

// Menu for the App
inquirer.prompt([
    // Main Menu options
    {
        type: 'list',
        name: 'menuChoice',
        message: 'What would you like to do with Liri Bot?',
        choices: [{
                name: 'Search for a song`s info!'
            },
            {
                name: 'Search for a movie`s info!'
            },
            {
                name: 'Search for a concert`s info!'
            },
            {
                name: 'I want it THAT way!'
            },
        ]
    }
]).then(answers => {

    // Switch statement based on selected answer
    switch (answers.menuChoice) {
        case 'Search for a song`s info!':
            inquirer.prompt([
                // Get info for the song to be searched for
                {
                    type: 'input',
                    name: 'spotifySong',
                    message: 'Search for a song`s info! What song?'
                }
            ]).then(response => {
                spotifySearch(response.spotifySong)
            })
            break;
        case 'Search for a movie`s info!':
            inquirer.prompt([
                // Get info for the movie to be searched for
                {
                    type: 'input',
                    name: 'movieName',
                    message: 'Search for a movie`s info! What Movie?'
                }
            ]).then(response => {
                movieSearch(response.movieName)
            })

            break;
        case 'Search for a concert`s info!':
            inquirer.prompt([
                // Get info for the movie to be searched for
                {
                    type: 'input',
                    name: 'artistName',
                    message: 'Search for a concert`s info! What artist?'
                }
            ]).then(response => {
                eventSearch(response.movieName)
            })
            break;
        case 'Do what it says':
            doCommand();
            break;
    }
}).catch(error => {
    console.log(error)
})

function spotifySearch(song) {

    if (!song || song == '') {
        song = 'Go DJ'
    }

    spotify
        .search({
            type: 'track',
            query: song,
            limit: 5
        })
        .then(function (response) {
            // console.log(response.tracks);
            let tracks = response.tracks.items;
            // console.log(tracks)
            tracks.forEach(element => {
                songInfo = {}

                // Traverse artist array
                element.artists.forEach(element => {
                    songInfo.artists = element.name
                });

                songInfo.album_name = element.album.name
                songInfo.songtitle = element.name
                songInfo.urlpreview = element.external_urls.spotify

                // Do something with the object
                console.log(songInfo)
            });
        })
}

function movieSearch(movie) {
    if (!movie || movie == '') {
        movie = 'Gladiator'
    }

    let movieUrl = `http://www.omdbapi.com/?apikey=trilogy&t=${movie}&type=movie`;
    let movieInfo = {};

    axios.get(movieUrl)
        .then(response => {
            if (response.data.Response === 'False') {
                console.log(response.data.Error)
            } else {
                console.log(response.data)
                movieInfo.title = response.data.Title;
                movieInfo.year = response.data.Year;
                movieInfo.imdbRating = response.data.imdbRating;

                // Rotten Tomatoes
                response.data.Ratings.forEach(element => {
                    // Grab Rotten Tomatoes rating
                    if (element.Source === 'Rotten Tomatoes') {
                        movieInfo.rtRating = element.Value;
                    }
                });

                movieInfo.country = response.data.Country;
                movieInfo.language = response.data.Language;
                movieInfo.plot = response.data.Plot;
                movieInfo.actors = response.data.Actors;

                // Do something with movie object
                console.log(movieInfo)
            }
        })
}

function eventSearch(artist) {
    if (!artist || artist == '') {
        artist = 'Nirvana';
    }

    artistUrl = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp&date=upcoming`;
    eventInfo = {};

    axios.get(artistUrl)
        .then(response => {
            if (response.data.includes('error')) {
                console.log('There was an error while searching for this concert event')
            } else {

                console.log(response.data);
                response.data.forEach(element => {
                    // console.log(element.venue)
                    eventInfo.artist = element.lineup[0];
                    eventInfo.venueName = element.venue.name;

                    // If out of USA region will be blank.
                    if (element.venue.region === '') {
                        delete eventInfo.region;
                    } else eventInfo.region = element.venue.region;

                    eventInfo.city = element.venue.city;
                    eventInfo.date = moment(element.venue.datetime).format('L')
                    console.log(eventInfo);
                })
            };
        })

}

function doCommand() {
    fs.readFile('random.txt', 'utf8', (err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.log(data);
            newData = data.split(',');

            for (let count = 0; count <= newData.length - 1; count++) {
                if (newData[count].includes('spotify')) {
                    console.log('Looks like we will search for a song')
                    spotifySearch(newData[count + 1]);
                    count++;
                } else if (newData[count].includes('movie')) {
                    movieSearch(newData[count + 1]);
                    count++;
                } else if (newData[count].includes('concert')) {
                    eventSearch(newData[count + 1]);
                    count++;
                }
            }
        }
    })
}
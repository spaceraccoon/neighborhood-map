# New Haven Pizza Map
Neighborhood map project for Udacity Full Stack Web Developer Nanodegree. Shows pizza places in New Haven with live search and additional Zomato information. Uses the Google Maps Javascript API, Zomato API, and Knockout JS.

![Screenshot](screenshot.png)

## Installation
1. Clone the project and `cd` into it.
2. [Install bower](https://bower.io/#install-bower) if necessary.
3. (Already installed for you) Install the dependencies via bower `bower install`.
4. Generate a [Zomato API key](https://developers.zomato.com/api) and add it to `user-key` in `js/app.js`.
5. Generate a [Google Maps JavaScript API key](https://developers.google.com/maps/documentation/javascript/) add add it to `<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&v=3"></script>` in `index.html`.
6. Run `index.html` and enjoy! Note that as Jquery ajax rejects local paths, it must be run on a server and not opened directly.

## Credits
* The dashboard was built off Bootstrap 4's [Dashboard example](https://v4-alpha.getbootstrap.com/examples/).
* Pizza icon from [IconArchive](http://www.iconarchive.com/show/swarm-icons-by-sonya/Pizza-icon.html).

## Possible improvements
* Better presentation of Zomato data
* Photos
* Automatically toggle navbar on click
* Filter by price and rating
* Filter by location
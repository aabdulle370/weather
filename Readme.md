# ⚠️ Extreme Weather Alert

A responsive web app that shows live extreme-weather alerts for any city. It is built with plain HTML, CSS, and JavaScript (no frameworks) as a Gabi School project.

## What it does

- Search for any city, or press **Detect** to use your device location
- Gets live current weather and a 5-day forecast from the free [Open-Meteo](https://open-meteo.com) API (no API key needed)
- Shows the current temperature, humidity, and wind speed
- Checks the forecast for dangerous conditions (extreme heat or cold, thunderstorms, ice, heavy snow, heavy rain, strong wind) and shows colour-coded alerts: red = severe, orange = warning, yellow = watch
- Shows an "All Clear" message when there are no alerts
- The page background changes to match the weather (clear, cloudy, rain, snow, storm)
- Works on desktop and phone screens

## Files

- `index.html` - page structure
- `style.css` - colours and layout
- `script.js` - gets the weather data and builds the alerts

## How to run

Open `index.html` in a browser (Chrome recommended). No build step is needed.

## Coming next

- Safety tips for each type of weather
- Dark mode / light mode
- Share alerts on social media
- Browser notifications for new alerts

## Notes

The alert rules are a simple model built for this project. They are not an official warning system. In a real emergency, always follow your local weather authority.
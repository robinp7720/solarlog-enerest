# SolarLog-Enerest
This is a node.js module to read data from the online enerest portal of SolarLog devices.


## Usage
```javascript
import SolarLogEnerest from 'solarlog-enerest';

const solarlog = new SolarLogEnerest(PORTAL, {
  baseURL = "https://api.enerest.world",
  authURL = "https://auth.enerest.world",
});

await solarlog.login(CLIENT_ID, CLIENT_SECRET);
```

baseURL is the base URL for the enerest API, default is `https://api.enerest.world`.

authURL is the base URL for the enerest authentication, default is `https://auth.enerest.world`.

These options are only needed if you want to use a different enerest instance.


### Get all registered components of a team

```
const components = await solarlog.components(PLANT_ID, DATE)
```


### Get data from specific components

```
const data = await solarlog.crossEpochChannels(PLANT_ID, xComponentIds, channelNames, dateFrom, dateTo);
```

xComponentIds is an array of component IDs, channelNames is an array of channel names, dateFrom and dateTo are the start and end dates for the data you want to retrieve.
dateFrom and dateTo can also be "today" to get data for the current day. Dates are formated as `YYYY-MM-DD`.


### Get all data (non cross-epoch) for a specific component
```
const data = channels(plantId, dateFrom, dateTo, channelNames, mppTrackerIds)
```

###  Get all inverters
This is a helper function to get all inverters for a specific plant. It returns an array of inverters with their IDs and names.
```
const inverters = await solarlog.inverters(PLANT_ID, DATE);
```

### Get channel data for a specific month

```
const data = await solarlog.get_channel_data_month(PLANT_ID, year, month, channelNames);
```


### Get channel data for a specific year

```
const data = await solarlog.get_channel_data_year(PLANT_ID, year, channelNames);
```


### Get lifetime data for selected channels

```
const data = await solarlog.get_channel_data_lifetime(PLANT_ID, channelNames);
```

### Get combine power and energy data for specific components

```
const data = await solarlog.get_combined_power_energy(PLANT_ID, xComponentIds, dateFrom, dateTo);
```

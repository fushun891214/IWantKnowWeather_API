import mongoose from "mongoose";

const ElementValue = new mongoose.Schema(
  {
    Temperature: {
      type: String,
    },
  },
  { _id: false, strict: false }
);

const Time = new mongoose.Schema(
  {
    StartTime: { type: String },
    EndTime: { type: String },
    ElementValue: [ElementValue],
  },
  { _id: false }
);

const WeatherElement = new mongoose.Schema(
  {
    ElementName: {
      type: String,
    },
    Time: [Time],
  },
  { _id: false }
);

const Location = new mongoose.Schema(
  {
    LocationName: {
      type: String,
    },
    Geocode: {
      type: String,
    },
    Latitude: {
      type: String,
    },
    Longitude: {
      type: String,
    },
    WeatherElement: [WeatherElement],
  },
  { _id: false }
);

const forecastsSchema = new mongoose.Schema(
  {
    DatasetDescription: {
      type: String,
    },
    LocationsName: {
      type: String,
    },
    Dataid: {
      type: String,
    },
    Location: [Location],
  },
  {
    timestamps: true,
    collection: "forecasts",
  }
);

const Forecast = mongoose.model("forecasts", forecastsSchema);

export default Forecast;

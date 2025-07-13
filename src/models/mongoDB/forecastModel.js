const mongoose = require("mongoose");

const ElementValue = new mongoose.Schema(
  {
    Temperature: {
      type: String,
    },
  },
  // 允許其他可能的值，包括 null
  { _id: false, strict: false }
);

const Time = new mongoose.Schema(
  {
    StartTime: { type: String }, // CWA API 格式
    EndTime: { type: String }, // CWA API 格式
    ElementValue: [ElementValue], // 移除 DataTime
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

module.exports = mongoose.model("forecasts", forecastsSchema);

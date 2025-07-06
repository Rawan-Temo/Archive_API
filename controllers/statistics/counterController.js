const City = require("../../models/Address/city");
const Country = require("../../models/Address/country");
const Governorate = require("../../models/Address/governorate");
const County = require("../../models/Address/county");
const Street = require("../../models/Address/street");
const Region = require("../../models/Address/region");
const Village = require("../../models/Address/village");
const Source = require("../../models/details/source");
const Field = require("../../models/details/field");
const Event = require("../../models/details/event");
const Party = require("../../models/details/party");
const Section = require("../../models/details/section");
const Person = require("../../models/information/person");
const Information = require("../../models/information/information");
const Coordinate = require("../../models/information/coordinate");

const countDocuments = async (req, res) => {
  try {
    const [
      cityCount,
      countryCount,
      governorateCount,
      countyCount,
      streetCount,
      regionCount,
      villageCount,
      sourceCount,
      fieldCount,
      eventCount,
      partyCount,
      sectionCount,
      personCount,
      informationCount,
      coordinateCount,
    ] = await Promise.all([
      City.countDocuments({ active: true }),
      Country.countDocuments({ active: true }),
      Governorate.countDocuments({ active: true }),
      County.countDocuments({ active: true }),
      Street.countDocuments({ active: true }),
      Region.countDocuments({ active: true }),
      Village.countDocuments({ active: true }),
      Source.countDocuments({ active: true }),
      Field.countDocuments({ active: true }),
      Event.countDocuments({ active: true }),
      Party.countDocuments({ active: true }),
      Section.countDocuments({ active: true }),
      Person.countDocuments({ active: true }),
      Information.countDocuments({ active: true }),
      Coordinate.countDocuments({ active: true }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        cityCount,
        countryCount,
        governorateCount,
        countyCount,
        streetCount,
        regionCount,
        villageCount,
        sourceCount,
        fieldCount,
        eventCount,
        partyCount,
        sectionCount,
        personCount,
        informationCount,
        coordinateCount,
      },
    });
  } catch (error) {
    console.error("Error counting documents:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { countDocuments };

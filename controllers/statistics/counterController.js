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
const APIFeatures = require("../../utils/apiFeatures");

const countDocuments = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);
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
      City.countDocuments({ active: true, ...parsedQuery }),
      Country.countDocuments({ active: true, ...parsedQuery }),
      Governorate.countDocuments({ active: true, ...parsedQuery }),
      County.countDocuments({ active: true, ...parsedQuery }),
      Street.countDocuments({ active: true, ...parsedQuery }),
      Region.countDocuments({ active: true, ...parsedQuery }),
      Village.countDocuments({ active: true, ...parsedQuery }),
      Source.countDocuments({ active: true, ...parsedQuery }),
      Field.countDocuments({ active: true, ...parsedQuery }),
      Event.countDocuments({ active: true, ...parsedQuery }),
      Party.countDocuments({ active: true, ...parsedQuery }),
      Section.countDocuments({ active: true, ...parsedQuery }),
      Person.countDocuments({ active: true, ...parsedQuery }),
      Information.countDocuments({ active: true, ...parsedQuery }),
      Coordinate.countDocuments({ active: true, ...parsedQuery }),
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
const countInformation = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const userRole = req.user.role;
    const excludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "categoryStatistics",
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);
    const category = req.query.categoryStatistics;
    let Model;
    let infoField; // The field to match inside Information

    if (userRole === "user" && category === "section") {
      return res.status(403).json({ message: "Access denied." });
    }
    switch (category) {
      case "section":
        Model = Section;
        infoField = "sectionId";
        break;
      case "city":
        Model = City;
        infoField = "cityId";
        break;
      case "country":
        Model = Country;
        infoField = "countryId";
        break;
      case "governorate":
        Model = Governorate;
        infoField = "governorateId";
        break;
      case "county":
        Model = County;
        infoField = "countyId";
        break;
      case "region":
        Model = Region;
        infoField = "regionId";
        break;
      case "street":
        Model = Street;
        infoField = "streetId";
        break;
      case "village":
        Model = Village;
        infoField = "villageId";
        break;
      case "event":
        Model = Event;
        infoField = "events";
        break;
      case "party":
        Model = Party;
        infoField = "parties";
        break;
      case "source":
        Model = Source;
        infoField = "sources";
        break;
      default:
        return res.status(400).json({
          status: "fail",
          message: "Invalid category",
        });
    }

    // Get all items in the category
    // Apply the parsed filter to count active documents
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // Get paginated students
    const items = await features.query.lean();
    // For each item, count Information documents
    const counts = await Promise.all(
      items.map(async (item) => {
        let count;
        if (["events", "parties", "sources"].includes(infoField)) {
          // If array field, use $in
          if (userRole === "user") {
            count = await Information.countDocuments({
              [infoField]: item._id,
              sectionId: req.user.sectionId,
              active: true,
              ...parsedQuery,
            });
          } else {
            count = await Information.countDocuments({
              [infoField]: item._id,
              active: true,
              ...parsedQuery,
            });
          }
        } else {
          if (userRole === "user") {
            count = await Information.countDocuments({
              [infoField]: item._id,
              sectionId: req.user.sectionId,
              active: true,
              ...parsedQuery,
            });
          } else {
            count = await Information.countDocuments({
              [infoField]: item._id,
              active: true,
              ...parsedQuery,
            });
          }
        }

        return {
          _id: item._id,
          name: item.name || item.source_name,
          infoCount: count,
        };
      })
    );

    res.status(200).json({
      status: "success",
      numberOfItems: items.length,
      category,
      data: counts,
    });
  } catch (error) {
    console.error("Error counting information:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { countDocuments, countInformation };

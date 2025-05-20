class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  //1) FILTER

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "month"];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1) FILTER2
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  //new filter
  // filter() {
  //   const queryObj = { ...this.queryString };
  //   const excludedFields = ["page", "sort", "limit", "fields", "month"];
  //   excludedFields.forEach((el) => delete queryObj[el]);

  //   const mongoQuery = {};

  //   for (let key in queryObj) {
  //     if (/\b(gte|gt|lte|lt)\b/.test(key)) continue;

  //     if (key.endsWith("_starts_with")) {
  //       const field = key.replace("_starts_with", "");
  //       mongoQuery[field] = { $regex: `^${queryObj[key]}`, $options: "i" };
  //     } else if (key.endsWith("_ends_with")) {
  //       const field = key.replace("_ends_with", "");
  //       mongoQuery[field] = { $regex: `${queryObj[key]}$`, $options: "i" };
  //     } else if (key.endsWith("_contains")) {
  //       const field = key.replace("_contains", "");
  //       mongoQuery[field] = { $regex: queryObj[key], $options: "i" };
  //     } else {
  //       mongoQuery[key] = queryObj[key];
  //     }
  //   }

  //   // Handle operators like gte, gt, lte, lt
  //   let queryStr = JSON.stringify(mongoQuery);
  //   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  //   this.query = this.query.find(JSON.parse(queryStr));
  //   return this;
  // }

  //2) SORT
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("_id");
    }
    return this;
  }
  // //3) FIELD LIMITING

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  //4) PAGE
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

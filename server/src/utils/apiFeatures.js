class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(fields = ["name", "description", "tags"]) {
    const { keyword } = this.queryString;
    if (keyword) {
      const searchRegex = {
        $or: fields.map((field) => ({ [field]: { $regex: keyword, $options: "i" } })),
      };
      this.query = this.query.find(searchRegex);
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "limit", "sort", "keyword", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort(defaultSort = "-createdAt") {
    if (this.queryString.sort) {
      const sortBy = String(this.queryString.sort).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(defaultSort);
    }

    return this;
  }

  limitFields(defaultFields = "") {
    if (this.queryString.fields) {
      const fields = String(this.queryString.fields).split(",").join(" ");
      this.query = this.query.select(fields);
    } else if (defaultFields) {
      this.query = this.query.select(defaultFields);
    }

    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    this.pagination = { page, limit, skip };
    return this;
  }
}

module.exports = ApiFeatures;
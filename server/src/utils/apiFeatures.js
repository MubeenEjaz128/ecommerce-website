class PrismaApiFeatures {
  constructor(queryString) {
    this.queryString = queryString;
    this.args = {
      where: {},
      orderBy: [],
    };
  }

  search(fields = ["name", "description", "tags"]) {
    const { keyword } = this.queryString;
    if (keyword) {
      this.args.where.OR = fields.map((field) => ({
        [field]: { contains: keyword }
      }));
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "limit", "sort", "keyword", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    Object.keys(queryObj).forEach((key) => {
      let value = queryObj[key];
      if (typeof value === 'object') {
        const prismaFilter = {};
        if (value.gt !== undefined) prismaFilter.gt = !isNaN(value.gt) ? Number(value.gt) : value.gt;
        if (value.gte !== undefined) prismaFilter.gte = !isNaN(value.gte) ? Number(value.gte) : value.gte;
        if (value.lt !== undefined) prismaFilter.lt = !isNaN(value.lt) ? Number(value.lt) : value.lt;
        if (value.lte !== undefined) prismaFilter.lte = !isNaN(value.lte) ? Number(value.lte) : value.lte;
        if (value.in !== undefined) prismaFilter.in = value.in.split(',');
        this.args.where[key] = prismaFilter;
      } else {
        // Boolean conversion if needed, or numeric conversion
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value)) value = Number(value);
        this.args.where[key] = value;
      }
    });

    return this;
  }

  sort(defaultSort = "createdAt:desc") {
    if (this.queryString.sort) {
      const sortBy = String(this.queryString.sort).split(",");
      this.args.orderBy = sortBy.map(s => {
        if (s.startsWith('-')) return { [s.substring(1)]: 'desc' };
        return { [s]: 'asc' };
      });
    } else {
      const parts = defaultSort.split(':');
      if (parts.length === 2) {
        this.args.orderBy = [{ [parts[0]]: parts[1] }];
      } else if (defaultSort.startsWith('-')) {
        this.args.orderBy = [{ [defaultSort.substring(1)]: 'desc' }];
      } else {
        this.args.orderBy = [{ [defaultSort]: 'asc' }];
      }
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 12;
    const skip = (page - 1) * limit;

    this.args.skip = skip;
    this.args.take = limit;
    return this;
  }
}

module.exports = PrismaApiFeatures;
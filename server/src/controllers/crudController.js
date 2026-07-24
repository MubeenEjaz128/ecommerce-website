const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiFeatures = require("../utils/apiFeatures");

function buildCrudController(Model, options = {}) {
  const { populate = [], searchFields = [], defaultSort = "-createdAt", transformCreate, transformUpdate } = options;
  const paramName = options.paramName || (options.slugField ? "slug" : "id");

  const getQuery = (docId) => {
    if (options.slugField) {
      return { [options.slugField]: docId };
    }

    return { _id: docId };
  };

  return {
    list: asyncHandler(async (req, res) => {
      let query = Model.find(options.baseFilter || {});

      if (searchFields.length > 0) {
        query = new ApiFeatures(query, req.query).search(searchFields).filter().sort(defaultSort).limitFields().paginate().query;
      } else {
        query = new ApiFeatures(query, req.query).filter().sort(defaultSort).limitFields().paginate().query;
      }

      if (populate.length > 0) {
        populate.forEach((entry) => {
          query = query.populate(entry);
        });
      }

      const [items, total] = await Promise.all([query, Model.countDocuments(query.getFilter())]);
      return res.status(200).json(
        new ApiResponse(200, `${Model.modelName} list fetched`, items, {
          total,
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 12,
        }),
      );
    }),

    getById: asyncHandler(async (req, res) => {
      const query = Model.findOne(getQuery(req.params[paramName]));
      if (populate.length > 0) {
        populate.forEach((entry) => query.populate(entry));
      }

      const item = await query;
      if (!item) {
        throw new ApiError(404, `${Model.modelName} not found`);
      }

      return res.status(200).json(new ApiResponse(200, `${Model.modelName} fetched`, item));
    }),

    create: asyncHandler(async (req, res) => {
      const payload = transformCreate ? await transformCreate(req) : req.body;
      const item = await Model.create(payload);
      return res.status(201).json(new ApiResponse(201, `${Model.modelName} created`, item));
    }),

    update: asyncHandler(async (req, res) => {
      const payload = transformUpdate ? await transformUpdate(req) : req.body;
      const item = await Model.findOneAndUpdate(getQuery(req.params[paramName]), payload, {
        new: true,
        runValidators: true,
      });

      if (!item) {
        throw new ApiError(404, `${Model.modelName} not found`);
      }

      return res.status(200).json(new ApiResponse(200, `${Model.modelName} updated`, item));
    }),

    remove: asyncHandler(async (req, res) => {
      const item = await Model.findOneAndDelete(getQuery(req.params[paramName]));
      if (!item) {
        throw new ApiError(404, `${Model.modelName} not found`);
      }

      return res.status(200).json(new ApiResponse(200, `${Model.modelName} deleted`, item));
    }),
  };
}

module.exports = buildCrudController;
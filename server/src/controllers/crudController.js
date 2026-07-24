const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const PrismaApiFeatures = require("../utils/apiFeatures");

function buildCrudController(prismaModel, modelName, options = {}) {
  const { include = {}, searchFields = [], defaultSort = "createdAt:desc", transformCreate, transformUpdate } = options;
  const paramName = options.paramName || (options.slugField ? "slug" : "id");

  const getWhere = (docId) => {
    if (options.slugField) {
      return { [options.slugField]: docId };
    }
    return { id: docId };
  };

  return {
    list: asyncHandler(async (req, res) => {
      const features = new PrismaApiFeatures(req.query)
        .search(searchFields)
        .filter()
        .sort(defaultSort)
        .paginate();

      const queryArgs = {
        ...features.args,
        include: Object.keys(include).length > 0 ? include : undefined,
      };

      // Add baseFilter if any
      if (options.baseFilter) {
        queryArgs.where = { ...queryArgs.where, ...options.baseFilter };
      }

      const countArgs = { where: queryArgs.where };

      const [items, total] = await Promise.all([
        prismaModel.findMany(queryArgs),
        prismaModel.count(countArgs),
      ]);

      return res.status(200).json(
        new ApiResponse(200, `${modelName} list fetched`, items, {
          total,
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 12,
        }),
      );
    }),

    getById: asyncHandler(async (req, res) => {
      const queryArgs = {
        where: getWhere(req.params[paramName]),
        include: Object.keys(include).length > 0 ? include : undefined,
      };

      const item = await prismaModel.findFirst(queryArgs);

      if (!item) {
        throw new ApiError(404, `${modelName} not found`);
      }

      return res.status(200).json(new ApiResponse(200, `${modelName} fetched`, item));
    }),

    create: asyncHandler(async (req, res) => {
      const payload = transformCreate ? await transformCreate(req) : req.body;
      const item = await prismaModel.create({ data: payload });
      return res.status(201).json(new ApiResponse(201, `${modelName} created`, item));
    }),

    update: asyncHandler(async (req, res) => {
      const payload = transformUpdate ? await transformUpdate(req) : req.body;

      // Check if exists
      const existing = await prismaModel.findFirst({ where: getWhere(req.params[paramName]) });
      if (!existing) {
        throw new ApiError(404, `${modelName} not found`);
      }

      const item = await prismaModel.update({
        where: { id: existing.id },
        data: payload,
      });

      return res.status(200).json(new ApiResponse(200, `${modelName} updated`, item));
    }),

    remove: asyncHandler(async (req, res) => {
      const existing = await prismaModel.findFirst({ where: getWhere(req.params[paramName]) });
      if (!existing) {
        throw new ApiError(404, `${modelName} not found`);
      }

      const item = await prismaModel.delete({
        where: { id: existing.id },
      });

      return res.status(200).json(new ApiResponse(200, `${modelName} deleted`, item));
    }),
  };
}

module.exports = buildCrudController;
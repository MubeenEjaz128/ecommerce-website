class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.success = `${statusCode}`.startsWith("2");
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}

module.exports = ApiResponse;
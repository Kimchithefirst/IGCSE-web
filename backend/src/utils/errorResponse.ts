/**
 * Custom Error Response class for standardized API error handling
 * Extends the standard Error class with additional properties for HTTP responses
 */
class ErrorResponse extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    
    // This ensures the correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }
}

export default ErrorResponse; 
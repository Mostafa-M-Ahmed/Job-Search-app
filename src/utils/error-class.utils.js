export class ErrorClass {
  constructor(message, status, data, location) {
    this.message = message;
    this.status = status;
    this.data = data;
    this.location = location;
  }
}

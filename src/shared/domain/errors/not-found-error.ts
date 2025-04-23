export class NotFoundError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'Not Found Error';
  }
}

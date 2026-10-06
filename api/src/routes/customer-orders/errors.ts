export class CustomerOrderRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerOrderRejected";
  }
}

export class CustomerOrderConflict extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerOrderConflict";
  }
}

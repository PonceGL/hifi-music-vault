interface ErrorResponse {
  success: boolean;
  message: string;
  data: null;
}

export class NextResponse {
  private responseInit: ResponseInit;
  private responseData: ErrorResponse;

  constructor(data: ErrorResponse, init?: ResponseInit) {
    this.responseData = data;
    this.responseInit = init || {};
  }

  static json(data: ErrorResponse, init?: ResponseInit) {
    return new NextResponse(data, init);
  }

  get status() {
    return this.responseInit.status || 200;
  }

  async json() {
    return this.responseData;
  }
}

export class NextRequest {
  headers: Headers;
  url: string;

  constructor(input: string | URL, init?: RequestInit) {
    this.url = typeof input === "string" ? input : input.toString();
    this.headers = new Headers(init?.headers);
  }
}

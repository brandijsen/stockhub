export function mockResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    headersSent: false,
    cookies: [] as { name: string; value: string }[],
    cleared: [] as string[],
    redirectUrl: undefined as string | undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    cookie(name: string, value: string) {
      this.cookies.push({ name, value });
      return this;
    },
    clearCookie(name: string) {
      this.cleared.push(name);
      return this;
    },
    redirect(url: string) {
      this.redirectUrl = url;
      this.headersSent = true;
      return this;
    },
  };
}

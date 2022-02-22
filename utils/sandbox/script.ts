const noop = () => {};

export type ScriptOptions = {
  code: string;
  context: unknown;
  timeout: number;
};

export type ScriptResult = string | number | boolean | Record<string, unknown>;

export class Script {
  code: string;
  context: unknown;
  #timeout: number;
  #timer: number | undefined;

  defer: Promise<ScriptResult>;
  resolve: (value: ScriptResult) => void = noop;
  reject: (reason: unknown) => void = noop;

  constructor(options: ScriptOptions) {
    this.code = options.code;
    this.context = options.context;
    this.#timeout = options.timeout;

    this.defer = new Promise<ScriptResult>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  start(callback: () => void) {
    this.#timer = setTimeout(callback, this.#timeout);
  }

  stop() {
    clearTimeout(this.#timer);
    this.#timer = undefined;
  }
}

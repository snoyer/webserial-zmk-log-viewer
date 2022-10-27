import { LogPresenter } from "./log";
import { known_zmk_filters, ZmkLogEntry, make_annotators } from "./zmk";

declare class Mark {
  constructor(context: Element);
  mark(term: string, options?: {}): void;
  unmark(options?: {}): void;
}

export class WebserialZmkLogger {
  log_container: Element;
  presenter: LogPresenter;

  highlight_color_count: number = 8;
  highlight_opts = {
    wildcards: "enabled",
  };
  highlight_keywords: string[] = [];

  constructor(log_container: Element) {
    this.log_container = log_container;
    this.presenter = new LogPresenter(
      log_container,
      ZmkLogEntry.Parse,
      make_annotators()
    );
  }

  async init() {
    const app = this;

    this.log_container.addEventListener("log-entry-added", (event) => {
      const line = (event.target as Element).lastElementChild;
      add_inline_annotations(line);

      this.do_highlight(line);

      line.scrollIntoView({ behavior: "auto" });
    });

    try {
      navigator.serial.addEventListener("connect", (event) => {
        const port = event.target as SerialPort;
        console.log("connected", port);
        this.add_dummy_log("dbg", "webserial: connected");
        open_and_read(port, (l) => this.presenter.add_line(l));
      });

      navigator.serial.addEventListener("disconnect", (event) => {
        const port = event.target as SerialPort;
        console.log("disconnected", port);
        this.add_dummy_log("wrn", "webserial: disconnected");
        port.close();
      });
    } catch (error) {
      console.error(error);
    }
  }

  select_and_read(filtered: boolean) {
    navigator.serial
      .requestPort({
        filters: filtered ? known_zmk_filters : [],
      })
      .then((port) => open_and_read(port, (l) => this.presenter.add_line(l)));
  }

  update_highlight_options(keywords: string[]) {
    this.highlight_keywords = keywords;
  }

  do_highlight(e: Element) {
    const app = this;
    const markInstance = new Mark(e);
    markInstance.unmark({
      done: function () {
        if (app.highlight_keywords) {
          for (let i = 0; i < app.highlight_keywords.length; ++i) {
            const opts: { [key: string]: any } = { ...app.highlight_opts };
            opts["className"] = `m${(i % app.highlight_color_count) + 1}`;
            markInstance.mark(app.highlight_keywords[i], opts);
          }
        }
      },
    });
  }

  add_dummy_log(level: string, message: string) {
    this.presenter.add_line(
      `[00:00:00:000,000] <${level}> webserial: ${message}`
    );
  }
}

export async function open_and_read(
  port: SerialPort,
  line_callback: (line: string) => void
) {
  await port.open({
    baudRate: 115200,
  });

  while (port.readable) {
    const reader = port.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TransformStream(new LineBreakTransformer()))
      .getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        line_callback(value);
        if (done) break;
      }
    } catch (error) {
      console.error(error);
    } finally {
      reader.releaseLock();
    }
  }
}

function add_inline_annotations(e: Element) {
  e.querySelectorAll("span.m abbr").forEach((abbr) => {
    const next = abbr.nextElementSibling;
    if (!next || !next.classList.contains("annot")) {
      const annot = document.createElement("i");
      annot.className = "annot";
      annot.innerText = ` (${abbr.getAttribute("title")})`;
      abbr.insertAdjacentElement("afterend", annot);
    }
  });
}

class LineBreakTransformer {
  container: string;

  constructor() {
    this.container = "";
  }

  transform(chunk: string, controller: TransformStreamDefaultController) {
    this.container += chunk;
    const lines = this.container.split("\r\n");
    this.container = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller: TransformStreamDefaultController) {
    controller.enqueue(this.container);
  }
}

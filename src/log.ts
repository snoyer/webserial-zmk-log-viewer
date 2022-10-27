const ANSI_ESCAPE = /(\x9b|\x1b\[)[0-?]*[ -\/]*[@-~]/g;

export class LogPresenter {
  container: Element;
  factory: (s: string) => LogEntry;
  annotators: Annotator[];

  last_t: number;
  repeat_count: number;
  last_entry: LogEntry;
  last_entry_div: HTMLDivElement;

  constructor(
    container: Element,
    factory: (s: string) => LogEntry,
    annotators: Iterable<Annotator>
  ) {
    this.factory = factory;
    this.container = container;
    this.annotators = Array.from(annotators);
    this.reset();
  }

  reset() {
    this.last_t = -1;
    this.repeat_count = 0;
    this.last_entry = undefined;
    this.last_entry_div = undefined;
  }

  add_line(line: string) {
    const cleaned_line = line.replace(ANSI_ESCAPE, "");

    const div = document.createElement("div");
    this.container.appendChild(div);

    let entry;
    try {
      entry = this.factory(cleaned_line);
      div.classList.add(entry.level);
    } catch (e) {
      if (e instanceof SyntaxError) {
        entry = new DummyEntry(cleaned_line);
        div.classList.add("unknown");
      } else {
        throw e;
      }
    }

    const t = entry.parsed_timestamp;
    if (this.last_t >= 0 && Math.abs(t - this.last_t) > 1) {
      const hr = document.createElement("hr");
      div.insertAdjacentElement("beforebegin", hr);
    } else if (
      this.last_entry &&
      this.last_entry.level == entry.level &&
      this.last_entry.source == entry.source &&
      this.last_entry.message == entry.message
    ) {
      this.last_entry_div.classList.add(
        this.repeat_count == 0 ? "first-dup" : "dup"
      );

      div.classList.add("last-dup");
      if (this.last_entry_div) {
        this.last_entry_div.classList.remove("last-dup");
      }

      ++this.repeat_count;
    } else {
      this.repeat_count = 0;
    }

    this.last_t = t;
    this.last_entry = entry;
    this.last_entry_div = div;

    entry.message = annotate(entry.message, this.annotators);
    div.innerHTML = entry.to_html();

    const event = new CustomEvent("log-entry-added", { detail: entry });
    this.container.dispatchEvent(event);
  }
}

export interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  message: string;
  parsed_timestamp: number;
  to_html(): string;
}

class DummyEntry implements LogEntry {
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  get timestamp() {
    return "";
  }
  get level() {
    return "";
  }
  get source() {
    return "";
  }
  get parsed_timestamp() {
    return 0;
  }

  to_html(): string {
    return `<span class="m">${this.message}</span>`;
  }
}

export type Annotator = [RegExp, ...((m: RegExpMatchArray) => string)[]];

export function annotate(text: string, annotators: Array<Annotator>) {
  const matches = match_annotators(text, annotators);
  matches.sort((a, b) => b[0] - a[0]);

  const html = text.split("");
  for (const [s, e, m] of matches) {
    html.splice(s, e - s, `<abbr title="${m}">${text.substring(s, e)}</abbr>`);
  }
  return html.join("");
}

function match_annotators(text: string, annotators: Annotator[]) {
  const matches: [number, number, string][] = [];
  const matched_spans: [number, number][] = [];
  for (const [re, ...fs] of annotators) {
    re.lastIndex = 0;
    var m = undefined;
    while ((m = re.exec(text))) {
      for (const i in fs) {
        const group = `_${i}`;
        // prettier-ignore
        // @ts-expect-error `indices` is there from the `d` flag
        const [a,b] = (group in m.indices.groups ? m.indices.groups[group] : m.indices[0]) as [number,number];
        if (
          !matched_spans.some(
            ([s, e]) => (s <= a && a <= e) || (s <= b && b <= e)
          )
        ) {
          matched_spans.push([a, b]);
          matches.push([a, b, fs[i](m)]);
        }
      }
      re.lastIndex = m.index + m[0].length;
    }
  }
  return matches;
}

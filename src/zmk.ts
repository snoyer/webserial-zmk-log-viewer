import { CONSTANTS_LOOKUP } from "./constants-lookup";
import { Annotator, LogEntry } from "./log";

export const known_zmk_filters = [{ usbVendorId: 0x1d50 }];

export function* make_annotators(): Iterable<Annotator> {
  yield [
    /(?<_0>usage[_ ]page[\s=:](?<page>0x[0-9a-f]{2,})) (?<_1>keycode[\s=:](?<key>0x[0-9a-f]{2,}))/dgi,
    (m) => usage_page_to_str(m.groups["page"]),
    (m) => keycode_to_str(m.groups["key"], m.groups["page"]),
  ];

  yield [
    /keycode[\s=:](?<keycode>0x[0-9a-f]{2,})/dgi,
    (m) => keycode_to_str(m.groups["keycode"]),
  ];

  yield [
    /usage[ _]page[\s=:](?<page>0x[0-9a-f]{2,})/dgi,
    (m) => usage_page_to_str(m.groups["page"]),
  ];

  yield [
    /Invoking KEY_PRESS: (?<_0>(?<keycode>0x[0-9a-f]+)) (?<_1>(?<mods>0x[0-9a-f]{2,}))/dgi,
    (m) => keycode_to_str(m.groups["keycode"]),
    (m) => mods_to_str(m.groups["mods"]),
  ];

  yield [
    /(((\w+mods)[\s=:])|(Modifiers set to ))(?<mods>0x[0-9a-f]{2,})/dgi,
    (m) => mods_to_str(m.groups["mods"]),
  ];

  yield [/endpoint[\s=:](?<e>\d+)/dgi, (m) => enddpoint_to_str(m.groups["e"])];
  yield [
    /Endpoint changed: (?<e>\d+)/dgi,
    (m) => enddpoint_to_str(m.groups["e"]),
  ];

  yield [
    /led_indicators[\s=:](?<led>0x[0-9a-f]+)/dgi,
    (m) => led_indicators_to_str(m.groups["led"]),
  ];
}

export class ZmkLogEntry implements LogEntry {
  timestamp: string;
  level: string;
  source: string;
  message: string;
  parsed_timestamp: number;

  constructor(
    timestamp: string,
    level: string,
    tag: string,
    message: string,
    parsed_timestamp: number
  ) {
    this.timestamp = timestamp;
    this.level = level;
    this.source = tag;
    this.message = message;
    const m = this.timestamp.match(/(\d+):(\d\d):(\d\d).(\d\d\d),(\d\d\d)/);
    this.parsed_timestamp = parsed_timestamp;
  }

  to_html(): string {
    return `<span class="t">[${this.timestamp}]</span> <span class="l">&lt;${this.level}&gt;</span> <span class="s">${this.source}:</span> <span class="m">${this.message}</span>`;
  }

  static Parse(text: string) {
    const match = text.match(
      /\[((\d+):(\d\d):(\d\d.\d\d\d),\d\d\d)\]\s+<(\w+)>\s+(\w+):\s*(.+)/
    );
    if (match) {
      const parsed_timestamp =
        parseInt(match[2]) * 3600 +
        parseInt(match[3]) * 60 +
        parseFloat(match[4]);
      return new ZmkLogEntry(
        match[1],
        match[5],
        match[6],
        match[7],
        parsed_timestamp
      );
    } else {
      throw new SyntaxError(`"could not parse \`${text}\`"`);
    }
  }
}

function mods_to_str(mods: number | string) {
  const _mods = _int(mods);
  const names = bitmask_lookup(CONSTANTS_LOOKUP.modifiers, _mods);
  return names.join("+") || "&varnothing;";
}

function keycode_to_str(keycode: number | string, page: number | string = 0) {
  const _keycode = _int(keycode) | (_int(page) << 16);
  const mods = _keycode >> 24;
  const kc = _keycode & ~(0xff << 24);

  const key_str = CONSTANTS_LOOKUP.keys[kc] || "???";
  if (mods) return mods_to_str(mods) + "+" + key_str;
  else return key_str;
}

function usage_page_to_str(page: number | string) {
  return CONSTANTS_LOOKUP.hid_usage_pages[_int(page)] || "???";
}

function enddpoint_to_str(endpoint: number | string) {
  return CONSTANTS_LOOKUP.endpoints[_int(endpoint)] || "???";
}

function led_indicators_to_str(leds: number | string) {
  const names = bitmask_lookup(CONSTANTS_LOOKUP.led_indicators, _int(leds));
  return names.join("+") || "&varnothing;";
}

function bitmask_lookup(lookup: { [bit: number]: string }, value: number) {
  return Object.entries(lookup)
    .filter(([k, _]) => value & (k as unknown as number))
    .map(([_, v]) => v);
}

function _int(i: number | string): number {
  if ((i as any) instanceof Number) return i as number;
  else return parseInt(i as string);
}

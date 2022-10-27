var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
System.register("log", [], function (exports_1, context_1) {
    "use strict";
    var ANSI_ESCAPE, LogPresenter, DummyEntry;
    var __moduleName = context_1 && context_1.id;
    function annotate(text, annotators) {
        const matches = match_annotators(text, annotators);
        matches.sort((a, b) => b[0] - a[0]);
        const html = text.split("");
        for (const [s, e, m] of matches) {
            html.splice(s, e - s, `<abbr title="${m}">${text.substring(s, e)}</abbr>`);
        }
        return html.join("");
    }
    exports_1("annotate", annotate);
    function match_annotators(text, annotators) {
        const matches = [];
        const matched_spans = [];
        for (const [re, ...fs] of annotators) {
            re.lastIndex = 0;
            var m = undefined;
            while ((m = re.exec(text))) {
                for (const i in fs) {
                    const group = `_${i}`;
                    // prettier-ignore
                    // @ts-expect-error `indices` is there from the `d` flag
                    const [a, b] = (group in m.indices.groups ? m.indices.groups[group] : m.indices[0]);
                    if (!matched_spans.some(([s, e]) => (s <= a && a <= e) || (s <= b && b <= e))) {
                        matched_spans.push([a, b]);
                        matches.push([a, b, fs[i](m)]);
                    }
                }
                re.lastIndex = m.index + m[0].length;
            }
        }
        return matches;
    }
    return {
        setters: [],
        execute: function () {
            ANSI_ESCAPE = /(\x9b|\x1b\[)[0-?]*[ -\/]*[@-~]/g;
            LogPresenter = class LogPresenter {
                constructor(container, factory, annotators) {
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
                add_line(line) {
                    const cleaned_line = line.replace(ANSI_ESCAPE, "");
                    const div = document.createElement("div");
                    this.container.appendChild(div);
                    let entry;
                    try {
                        entry = this.factory(cleaned_line);
                        div.classList.add(entry.level);
                    }
                    catch (e) {
                        if (e instanceof SyntaxError) {
                            entry = new DummyEntry(cleaned_line);
                            div.classList.add("unknown");
                        }
                        else {
                            throw e;
                        }
                    }
                    const t = entry.parsed_timestamp;
                    if (this.last_t >= 0 && Math.abs(t - this.last_t) > 1) {
                        const hr = document.createElement("hr");
                        div.insertAdjacentElement("beforebegin", hr);
                    }
                    else if (this.last_entry &&
                        this.last_entry.level == entry.level &&
                        this.last_entry.source == entry.source &&
                        this.last_entry.message == entry.message) {
                        this.last_entry_div.classList.add(this.repeat_count == 0 ? "first-dup" : "dup");
                        div.classList.add("last-dup");
                        if (this.last_entry_div) {
                            this.last_entry_div.classList.remove("last-dup");
                        }
                        ++this.repeat_count;
                    }
                    else {
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
            };
            exports_1("LogPresenter", LogPresenter);
            DummyEntry = class DummyEntry {
                constructor(message) {
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
                to_html() {
                    return `<span class="m">${this.message}</span>`;
                }
            };
        }
    };
});
System.register("constants-lookup", [], function (exports_2, context_2) {
    "use strict";
    var CONSTANTS_LOOKUP;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            exports_2("CONSTANTS_LOOKUP", CONSTANTS_LOOKUP = {
                hid_usage_pages: {
                    0x1: "GD",
                    0x2: "SIM",
                    0x3: "VR",
                    0x4: "SPORT",
                    0x5: "GAME",
                    0x6: "GDV",
                    0x7: "KEY",
                    0x8: "LED",
                    0xb: "TELEPHONY",
                    0xc: "CONSUMER",
                    0xd: "DIGITIZERS",
                    0xe: "HAPTICS",
                    0xf: "PID",
                    0x12: "EHT",
                    0x14: "AUXDISP",
                    0x20: "SENSORS",
                    0x40: "MEDICAL",
                    0x41: "BRAILLE",
                    0x59: "LIGHT",
                    0x80: "MONITOR",
                    0x81: "MONITOR_VALUES",
                    0x82: "MONITOR_VESA",
                    0x84: "POWER",
                    0x8c: "POS_BARCODE",
                    0x8d: "POS_SCALE",
                    0x8e: "POS_MSR",
                    0x8f: "POS_RESV",
                    0x90: "CAMERA",
                    0x91: "ARCADE",
                    0x92: "GAMING",
                    0xf1d0: "FIDO",
                },
                keys: {
                    0x10081: "SYS_PWR",
                    0x10082: "SYS_SLEEP",
                    0x10083: "SYS_WAKE",
                    0x70004: "A",
                    0x70005: "B",
                    0x70006: "C",
                    0x70007: "D",
                    0x70008: "E",
                    0x70009: "F",
                    0x7000a: "G",
                    0x7000b: "H",
                    0x7000c: "I",
                    0x7000d: "J",
                    0x7000e: "K",
                    0x7000f: "L",
                    0x70010: "M",
                    0x70011: "N",
                    0x70012: "O",
                    0x70013: "P",
                    0x70014: "Q",
                    0x70015: "R",
                    0x70016: "S",
                    0x70017: "T",
                    0x70018: "U",
                    0x70019: "V",
                    0x7001a: "W",
                    0x7001b: "X",
                    0x7001c: "Y",
                    0x7001d: "Z",
                    0x7001e: "N1",
                    0x207001e: "EXCL",
                    0x7001f: "N2",
                    0x207001f: "AT",
                    0x70020: "N3",
                    0x2070020: "HASH",
                    0x70021: "N4",
                    0x2070021: "DLLR",
                    0x70022: "N5",
                    0x2070022: "PRCNT",
                    0x70023: "N6",
                    0x2070023: "CARET",
                    0x70024: "N7",
                    0x2070024: "AMPS",
                    0x70025: "N8",
                    0x2070025: "STAR",
                    0x70026: "N9",
                    0x2070026: "LPAR",
                    0x70027: "N0",
                    0x2070027: "RPAR",
                    0x70028: "RET",
                    0x70029: "ESC",
                    0x7002a: "BSPC",
                    0x7002b: "TAB",
                    0x7002c: "SPACE",
                    0x7002d: "MINUS",
                    0x207002d: "UNDER",
                    0x7002e: "EQUAL",
                    0x207002e: "PLUS",
                    0x7002f: "LBKT",
                    0x207002f: "LBRC",
                    0x70030: "RBKT",
                    0x2070030: "RBRC",
                    0x70031: "BSLH",
                    0x2070031: "PIPE",
                    0x70032: "NON_US_HASH",
                    0x2070032: "TILDE2",
                    0x70033: "SEMI",
                    0x2070033: "COLON",
                    0x70034: "SQT",
                    0x2070034: "DQT",
                    0x70035: "GRAVE",
                    0x2070035: "TILDE",
                    0x70036: "COMMA",
                    0x2070036: "LT",
                    0x70037: "DOT",
                    0x2070037: "GT",
                    0x70038: "FSLH",
                    0x2070038: "QMARK",
                    0x70039: "CAPS",
                    0x7003a: "F1",
                    0x7003b: "F2",
                    0x7003c: "F3",
                    0x7003d: "F4",
                    0x7003e: "F5",
                    0x7003f: "F6",
                    0x70040: "F7",
                    0x70041: "F8",
                    0x70042: "F9",
                    0x70043: "F10",
                    0x70044: "F11",
                    0x70045: "F12",
                    0x70046: "PSCRN",
                    0x70047: "SLCK",
                    0x70048: "PAUSE_BREAK",
                    0x70049: "INS",
                    0x7004a: "HOME",
                    0x7004b: "PG_UP",
                    0x7004c: "DEL",
                    0x7004d: "END",
                    0x7004e: "PG_DN",
                    0x7004f: "RIGHT",
                    0x70050: "LEFT",
                    0x70051: "DOWN",
                    0x70052: "UP",
                    0x70053: "KP_NUM",
                    0x2070053: "CLEAR2",
                    0x70054: "KP_SLASH",
                    0x70055: "KP_MULTIPLY",
                    0x70056: "KP_MINUS",
                    0x70057: "KP_PLUS",
                    0x70058: "KP_ENTER",
                    0x70059: "KP_N1",
                    0x7005a: "KP_N2",
                    0x7005b: "KP_N3",
                    0x7005c: "KP_N4",
                    0x7005d: "KP_N5",
                    0x7005e: "KP_N6",
                    0x7005f: "KP_N7",
                    0x70060: "KP_N8",
                    0x70061: "KP_N9",
                    0x70062: "KP_N0",
                    0x70063: "KP_DOT",
                    0x70064: "NON_US_BSLH",
                    0x2070064: "PIPE2",
                    0x70065: "K_APP",
                    0x70066: "K_PWR",
                    0x70067: "KP_EQUAL",
                    0x70068: "F13",
                    0x70069: "F14",
                    0x7006a: "F15",
                    0x7006b: "F16",
                    0x7006c: "F17",
                    0x7006d: "F18",
                    0x7006e: "F19",
                    0x7006f: "F20",
                    0x70070: "F21",
                    0x70071: "F22",
                    0x70072: "F23",
                    0x70073: "F24",
                    0x70074: "K_EXEC",
                    0x70075: "K_HELP",
                    0x70076: "K_MENU",
                    0x70077: "K_SELECT",
                    0x70078: "K_STOP",
                    0x70079: "K_REDO",
                    0x7007a: "K_UNDO",
                    0x7007b: "K_CUT",
                    0x7007c: "K_COPY",
                    0x7007d: "K_PASTE",
                    0x7007e: "K_FIND",
                    0x7007f: "K_MUTE",
                    0x70080: "K_VOL_UP",
                    0x70081: "K_VOL_DN",
                    0x70082: "LCAPS",
                    0x70083: "LNLCK",
                    0x70084: "LSLCK",
                    0x70085: "KP_COMMA",
                    0x70086: "KP_EQUAL_AS400",
                    0x70087: "INT1",
                    0x70088: "INT2",
                    0x70089: "INT3",
                    0x7008a: "INT4",
                    0x7008b: "INT5",
                    0x7008c: "INT6",
                    0x7008d: "INT7",
                    0x7008e: "INT8",
                    0x7008f: "INT9",
                    0x70090: "LANG1",
                    0x70091: "LANG2",
                    0x70092: "LANG3",
                    0x70093: "LANG4",
                    0x70094: "LANG5",
                    0x70095: "LANG6",
                    0x70096: "LANG7",
                    0x70097: "LANG8",
                    0x70098: "LANG9",
                    0x70099: "ALT_ERASE",
                    0x7009a: "SYSREQ",
                    0x7009b: "K_CANCEL",
                    0x7009c: "CLEAR",
                    0x7009d: "PRIOR",
                    0x7009e: "RET2",
                    0x7009f: "SEPARATOR",
                    0x700a0: "OUT",
                    0x700a1: "OPER",
                    0x700a2: "CLEAR_AGAIN",
                    0x700a3: "CRSEL",
                    0x700a4: "EXSEL",
                    0x700b4: "CURU",
                    0x700b6: "KP_LPAR",
                    0x700b7: "KP_RPAR",
                    0x700cd: "KSPC",
                    0x700d8: "KP_CLEAR",
                    0x700e0: "LCTRL",
                    0x700e1: "LSHFT",
                    0x700e2: "LALT",
                    0x700e3: "LGUI",
                    0x700e4: "RCTRL",
                    0x700e5: "RSHFT",
                    0x700e6: "RALT",
                    0x700e7: "RGUI",
                    0x700e8: "K_PP",
                    0x700e9: "K_STOP2",
                    0x700ea: "K_PREV",
                    0x700eb: "K_NEXT",
                    0x700ec: "K_EJECT",
                    0x700ed: "K_VOL_UP2",
                    0x700ee: "K_VOL_DN2",
                    0x700ef: "K_MUTE2",
                    0x700f0: "K_WWW",
                    0x700f1: "K_BACK",
                    0x700f2: "K_FORWARD",
                    0x700f3: "K_STOP3",
                    0x700f4: "K_FIND2",
                    0x700f5: "K_SCROLL_UP",
                    0x700f6: "K_SCROLL_DOWN",
                    0x700f7: "K_EDIT",
                    0x700f8: "K_SLEEP",
                    0x700f9: "K_LOCK",
                    0x700fa: "K_REFRESH",
                    0x700fb: "K_CALC",
                    0xc0030: "C_PWR",
                    0xc0031: "C_RESET",
                    0xc0032: "C_SLEEP",
                    0xc0034: "C_SLEEP_MODE",
                    0xc0040: "C_MENU",
                    0xc0041: "C_MENU_PICK",
                    0xc0042: "C_MENU_UP",
                    0xc0043: "C_MENU_DOWN",
                    0xc0044: "C_MENU_LEFT",
                    0xc0045: "C_MENU_RIGHT",
                    0xc0046: "C_MENU_ESC",
                    0xc0047: "C_MENU_INC",
                    0xc0048: "C_MENU_DEC",
                    0xc0060: "C_DATA_ON_SCREEN",
                    0xc0061: "C_CAPTIONS",
                    0xc0065: "C_SNAPSHOT",
                    0xc0067: "C_PIP",
                    0xc0069: "C_RED",
                    0xc006a: "C_GREEN",
                    0xc006b: "C_BLUE",
                    0xc006c: "C_YELLOW",
                    0xc006d: "C_ASPECT",
                    0xc006f: "C_BRI_UP",
                    0xc0070: "C_BRI_DN",
                    0xc0072: "C_BKLT_TOG",
                    0xc0073: "C_BRI_MIN",
                    0xc0074: "C_BRI_MAX",
                    0xc0075: "C_BRI_AUTO",
                    0xc0082: "C_MODE_STEP",
                    0xc0083: "C_CHAN_LAST",
                    0xc0088: "C_MEDIA_COMPUTER",
                    0xc0089: "C_MEDIA_TV",
                    0xc008a: "C_MEDIA_WWW",
                    0xc008b: "C_MEDIA_DVD",
                    0xc008c: "C_MEDIA_PHONE",
                    0xc008d: "C_MEDIA_GUIDE",
                    0xc008e: "C_MEDIA_VIDEOPHONE",
                    0xc008f: "C_MEDIA_GAMES",
                    0xc0090: "C_MEDIA_MESSAGES",
                    0xc0091: "C_MEDIA_CD",
                    0xc0092: "C_MEDIA_VCR",
                    0xc0093: "C_MEDIA_TUNER",
                    0xc0094: "C_QUIT",
                    0xc0095: "C_HELP",
                    0xc0096: "C_MEDIA_TAPE",
                    0xc0097: "C_MEDIA_CABLE",
                    0xc0098: "C_MEDIA_SATELLITE",
                    0xc009a: "C_MEDIA_HOME",
                    0xc009c: "C_CHAN_INC",
                    0xc009d: "C_CHAN_DEC",
                    0xc00a0: "C_MEDIA_VCR_PLUS",
                    0xc00b0: "C_PLAY",
                    0xc00b1: "C_PAUSE",
                    0xc00b2: "C_REC",
                    0xc00b3: "C_FF",
                    0xc00b4: "C_RW",
                    0xc00b5: "C_NEXT",
                    0xc00b6: "C_PREV",
                    0xc00b7: "C_STOP",
                    0xc00b8: "C_EJECT",
                    0xc00b9: "C_SHUFFLE",
                    0xc00bc: "C_REPEAT",
                    0xc00bf: "C_SLOW2",
                    0xc00cc: "C_STOP_EJECT",
                    0xc00cd: "C_PP",
                    0xc00cf: "C_VOICE_COMMAND",
                    0xc00e2: "C_MUTE",
                    0xc00e5: "C_BASS_BOOST",
                    0xc00e9: "C_VOL_UP",
                    0xc00ea: "C_VOL_DN",
                    0xc00f5: "C_SLOW",
                    0xc0173: "C_ALT_AUDIO_INC",
                    0xc0183: "C_AL_CCC",
                    0xc0184: "C_AL_WORD",
                    0xc0185: "C_AL_TEXT_EDITOR",
                    0xc0186: "C_AL_SHEET",
                    0xc0187: "C_AL_GRAPHICS_EDITOR",
                    0xc0188: "C_AL_PRESENTATION",
                    0xc0189: "C_AL_DB",
                    0xc018a: "C_AL_MAIL",
                    0xc018b: "C_AL_NEWS",
                    0xc018c: "C_AL_VOICEMAIL",
                    0xc018d: "C_AL_CONTACTS",
                    0xc018e: "C_AL_CAL",
                    0xc018f: "C_AL_TASK_MANAGER",
                    0xc0190: "C_AL_JOURNAL",
                    0xc0191: "C_AL_FINANCE",
                    0xc0192: "C_AL_CALC",
                    0xc0193: "C_AL_AV_CAPTURE_PLAYBACK",
                    0xc0194: "C_AL_MY_COMPUTER",
                    0xc0196: "C_AL_WWW",
                    0xc0199: "C_AL_CHAT",
                    0xc019c: "C_AL_LOGOFF",
                    0xc019e: "C_AL_LOCK",
                    0xc019f: "C_AL_CONTROL_PANEL",
                    0xc01a2: "C_AL_SELECT_TASK",
                    0xc01a3: "C_AL_NEXT_TASK",
                    0xc01a4: "C_AL_PREV_TASK",
                    0xc01a6: "C_AL_HELP",
                    0xc01a7: "C_AL_DOCS",
                    0xc01ab: "C_AL_SPELL",
                    0xc01ae: "C_AL_KEYBOARD_LAYOUT",
                    0xc01b1: "C_AL_SCREEN_SAVER",
                    0xc01b4: "C_AL_FILES",
                    0xc01b6: "C_AL_IMAGES",
                    0xc01b7: "C_AL_AUDIO",
                    0xc01b8: "C_AL_MOVIES",
                    0xc01bc: "C_AL_IM",
                    0xc01bd: "C_AL_TIPS",
                    0xc0201: "C_AC_NEW",
                    0xc0202: "C_AC_OPEN",
                    0xc0203: "C_AC_CLOSE",
                    0xc0204: "C_AC_EXIT",
                    0xc0207: "C_AC_SAVE",
                    0xc0208: "C_AC_PRINT",
                    0xc0209: "C_AC_PROPS",
                    0xc021a: "C_AC_UNDO",
                    0xc021b: "C_AC_COPY",
                    0xc021c: "C_AC_CUT",
                    0xc021d: "C_AC_PASTE",
                    0xc021f: "C_AC_FIND",
                    0xc0221: "C_AC_SEARCH",
                    0xc0222: "C_AC_GOTO",
                    0xc0223: "C_AC_HOME",
                    0xc0224: "C_AC_BACK",
                    0xc0225: "C_AC_FORWARD",
                    0xc0226: "C_AC_STOP",
                    0xc0227: "C_AC_REFRESH",
                    0xc022a: "C_AC_BOOKMARKS",
                    0xc022d: "C_AC_ZOOM_IN",
                    0xc022e: "C_AC_ZOOM_OUT",
                    0xc022f: "C_AC_ZOOM",
                    0xc0232: "C_AC_VIEW_TOGGLE",
                    0xc0233: "C_AC_SCROLL_UP",
                    0xc0234: "C_AC_SCROLL_DOWN",
                    0xc023d: "C_AC_EDIT",
                    0xc025f: "C_AC_CANCEL",
                    0xc0269: "C_AC_INS",
                    0xc026a: "C_AC_DEL",
                    0xc0279: "C_AC_REDO",
                    0xc0289: "C_AC_REPLY",
                    0xc028b: "C_AC_FORWARD_MAIL",
                    0xc028c: "C_AC_SEND",
                    0xc029f: "C_AC_DESKTOP_SHOW_ALL_WINDOWS",
                    0xc02a2: "C_AC_DESKTOP_SHOW_ALL_APPLICATIONS",
                    0xc02c7: "C_KBIA_PREV",
                    0xc02c8: "C_KBIA_NEXT",
                    0xc02c9: "C_KBIA_PREV_GRP",
                    0xc02ca: "C_KBIA_NEXT_GRP",
                    0xc02cb: "C_KBIA_ACCEPT",
                    0xc02cc: "C_KBIA_CANCEL",
                },
                modifiers: {
                    0x1: "LCTL",
                    0x2: "LSFT",
                    0x4: "LALT",
                    0x8: "LGUI",
                    0x10: "RCTL",
                    0x20: "RSFT",
                    0x40: "RALT",
                    0x80: "RGUI",
                },
                endpoints: {
                    0x0: "USB",
                    0x1: "BLE",
                },
                activity: {
                    0x0: "ACTIVE",
                    0x1: "IDLE",
                    0x2: "SLEEP",
                },
                led_indicators: {
                    0x1: "NUMLOCK",
                    0x2: "CAPSLOCK",
                    0x4: "SCROLLLOCK",
                    0x8: "COMPOSE",
                    0x10: "KANA",
                },
            });
        }
    };
});
System.register("zmk", ["constants-lookup"], function (exports_3, context_3) {
    "use strict";
    var constants_lookup_1, known_zmk_filters, ZmkLogEntry;
    var __moduleName = context_3 && context_3.id;
    function* make_annotators() {
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
    exports_3("make_annotators", make_annotators);
    function mods_to_str(mods) {
        const _mods = _int(mods);
        const names = bitmask_lookup(constants_lookup_1.CONSTANTS_LOOKUP.modifiers, _mods);
        return names.join("+") || "&varnothing;";
    }
    function keycode_to_str(keycode, page = 0) {
        const _keycode = _int(keycode) | (_int(page) << 16);
        const mods = _keycode >> 24;
        const kc = _keycode & ~(0xff << 24);
        const key_str = constants_lookup_1.CONSTANTS_LOOKUP.keys[kc] || "???";
        if (mods)
            return mods_to_str(mods) + "+" + key_str;
        else
            return key_str;
    }
    function usage_page_to_str(page) {
        return constants_lookup_1.CONSTANTS_LOOKUP.hid_usage_pages[_int(page)] || "???";
    }
    function enddpoint_to_str(endpoint) {
        return constants_lookup_1.CONSTANTS_LOOKUP.endpoints[_int(endpoint)] || "???";
    }
    function led_indicators_to_str(leds) {
        const names = bitmask_lookup(constants_lookup_1.CONSTANTS_LOOKUP.led_indicators, _int(leds));
        return names.join("+") || "&varnothing;";
    }
    function bitmask_lookup(lookup, value) {
        return Object.entries(lookup)
            .filter(([k, _]) => value & k)
            .map(([_, v]) => v);
    }
    function _int(i) {
        if (i instanceof Number)
            return i;
        else
            return parseInt(i);
    }
    return {
        setters: [
            function (constants_lookup_1_1) {
                constants_lookup_1 = constants_lookup_1_1;
            }
        ],
        execute: function () {
            exports_3("known_zmk_filters", known_zmk_filters = [{ usbVendorId: 0x1d50 }]);
            ZmkLogEntry = class ZmkLogEntry {
                constructor(timestamp, level, tag, message, parsed_timestamp) {
                    this.timestamp = timestamp;
                    this.level = level;
                    this.source = tag;
                    this.message = message;
                    const m = this.timestamp.match(/(\d+):(\d\d):(\d\d).(\d\d\d),(\d\d\d)/);
                    this.parsed_timestamp = parsed_timestamp;
                }
                to_html() {
                    return `<span class="t">[${this.timestamp}]</span> <span class="l">&lt;${this.level}&gt;</span> <span class="s">${this.source}:</span> <span class="m">${this.message}</span>`;
                }
                static Parse(text) {
                    const match = text.match(/\[((\d+):(\d\d):(\d\d.\d\d\d),\d\d\d)\]\s+<(\w+)>\s+(\w+):\s*(.+)/);
                    if (match) {
                        const parsed_timestamp = parseInt(match[2]) * 3600 +
                            parseInt(match[3]) * 60 +
                            parseFloat(match[4]);
                        return new ZmkLogEntry(match[1], match[5], match[6], match[7], parsed_timestamp);
                    }
                    else {
                        throw new SyntaxError(`"could not parse \`${text}\`"`);
                    }
                }
            };
            exports_3("ZmkLogEntry", ZmkLogEntry);
        }
    };
});
System.register("app", ["log", "zmk"], function (exports_4, context_4) {
    "use strict";
    var log_1, zmk_1, WebserialZmkLogger, LineBreakTransformer;
    var __moduleName = context_4 && context_4.id;
    function open_and_read(port, line_callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield port.open({
                baudRate: 115200,
            });
            while (port.readable) {
                const reader = port.readable
                    .pipeThrough(new TextDecoderStream())
                    .pipeThrough(new TransformStream(new LineBreakTransformer()))
                    .getReader();
                try {
                    while (true) {
                        const { value, done } = yield reader.read();
                        line_callback(value);
                        if (done)
                            break;
                    }
                }
                catch (error) {
                    console.error(error);
                }
                finally {
                    reader.releaseLock();
                }
            }
        });
    }
    exports_4("open_and_read", open_and_read);
    function add_inline_annotations(e) {
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
    return {
        setters: [
            function (log_1_1) {
                log_1 = log_1_1;
            },
            function (zmk_1_1) {
                zmk_1 = zmk_1_1;
            }
        ],
        execute: function () {
            WebserialZmkLogger = class WebserialZmkLogger {
                constructor(log_container) {
                    this.highlight_color_count = 8;
                    this.highlight_opts = {
                        wildcards: "enabled",
                    };
                    this.highlight_keywords = [];
                    this.log_container = log_container;
                    this.presenter = new log_1.LogPresenter(log_container, zmk_1.ZmkLogEntry.Parse, zmk_1.make_annotators());
                }
                init() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const app = this;
                        this.log_container.addEventListener("log-entry-added", (event) => {
                            const line = event.target.lastElementChild;
                            add_inline_annotations(line);
                            this.do_highlight(line);
                            line.scrollIntoView({ behavior: "auto" });
                        });
                        try {
                            navigator.serial.addEventListener("connect", (event) => {
                                const port = event.target;
                                console.log("connected", port);
                                this.add_dummy_log("dbg", "webserial: connected");
                                open_and_read(port, (l) => this.presenter.add_line(l));
                            });
                            navigator.serial.addEventListener("disconnect", (event) => {
                                const port = event.target;
                                console.log("disconnected", port);
                                this.add_dummy_log("wrn", "webserial: disconnected");
                                port.close();
                            });
                        }
                        catch (error) {
                            console.error(error);
                        }
                    });
                }
                select_and_read(filtered) {
                    navigator.serial
                        .requestPort({
                        filters: filtered ? zmk_1.known_zmk_filters : [],
                    })
                        .then((port) => open_and_read(port, (l) => this.presenter.add_line(l)));
                }
                update_highlight_options(keywords) {
                    this.highlight_keywords = keywords;
                }
                do_highlight(e) {
                    const app = this;
                    const markInstance = new Mark(e);
                    markInstance.unmark({
                        done: function () {
                            if (app.highlight_keywords) {
                                for (let i = 0; i < app.highlight_keywords.length; ++i) {
                                    const opts = Object.assign({}, app.highlight_opts);
                                    opts["className"] = `m${(i % app.highlight_color_count) + 1}`;
                                    markInstance.mark(app.highlight_keywords[i], opts);
                                }
                            }
                        },
                    });
                }
                add_dummy_log(level, message) {
                    this.presenter.add_line(`[00:00:00:000,000] <${level}> webserial: ${message}`);
                }
            };
            exports_4("WebserialZmkLogger", WebserialZmkLogger);
            LineBreakTransformer = class LineBreakTransformer {
                constructor() {
                    this.container = "";
                }
                transform(chunk, controller) {
                    this.container += chunk;
                    const lines = this.container.split("\r\n");
                    this.container = lines.pop();
                    lines.forEach((line) => controller.enqueue(line));
                }
                flush(controller) {
                    controller.enqueue(this.container);
                }
            };
        }
    };
});
System.register("index", ["app"], function (exports_5, context_5) {
    "use strict";
    var app_1, log, sample;
    var __moduleName = context_5 && context_5.id;
    function init() {
        const log_container = document.getElementById("log");
        log = new app_1.WebserialZmkLogger(log_container);
        log.init();
        const intro = document
            .querySelectorAll(".intro")
            .forEach((e) => e.setAttribute("style", "display:none"));
        if ("serial" in navigator) {
            document.querySelectorAll("#intro-supported li").forEach((e) => {
                log.add_dummy_log(e.className || "dbg", e.innerHTML);
            });
        }
        else {
            document.querySelectorAll("#intro-unsupported li").forEach((e) => {
                log.add_dummy_log(e.className || "dbg", e.innerHTML);
            });
            document
                .querySelectorAll(".tools .connect")
                .forEach((e) => e.setAttribute("disabled", "true"));
        }
        document
            .querySelector(".tools .connect")
            .addEventListener("click", (event) => {
            const filtered = !event.shiftKey;
            log.select_and_read(filtered);
        });
        document.querySelectorAll(".tools .clear").forEach((clear) => {
            clear.addEventListener("click", (e) => {
                log.log_container.innerHTML = "";
                log.presenter.reset();
                return e.preventDefault();
            });
        });
        document
            .querySelectorAll("form.highlight")
            .forEach((form) => {
            form.addEventListener("submit", (e) => {
                update_highlight_options();
                log.do_highlight(log_container);
                return e.preventDefault();
            });
            form.querySelectorAll(".reset").forEach((reset) => {
                reset.addEventListener("click", (e) => {
                    form.reset();
                    update_highlight_options();
                    log.do_highlight(log_container);
                    return e.preventDefault();
                });
            });
        });
        update_highlight_options();
        log.do_highlight(log_container);
        window.addEventListener("hashchange", (event) => hashchanged());
        hashchanged();
    }
    function update_highlight_options() {
        const kw = document.querySelector("form.highlight .keywords");
        log.update_highlight_options(kw.value.split(/\s+/));
    }
    function hashchanged() {
        if (location.hash == "#sample") {
            const input = document.querySelector(".highlight .keywords");
            input.value = "keycode behavior layer binding";
            update_highlight_options();
            const lines = sample.trim().split("\n");
            for (const line of lines) {
                log.presenter.add_line(line);
            }
        }
    }
    return {
        setters: [
            function (app_1_1) {
                app_1 = app_1_1;
            }
        ],
        execute: function () {
            log = undefined;
            document.addEventListener("readystatechange", (e) => {
                init();
            });
            sample = `
[00:00:01.736,175] <dbg> zmk: zmk_usb_get_conn_state: state: 6
[00:00:01.736,206] <dbg> zmk: get_selected_endpoint: Only USB is ready.
[00:00:01.838,958] <inf> usb_hid: Device reset detected
[00:00:01.838,989] <dbg> zmk: zmk_usb_get_conn_state: state: 1
[00:00:01.838,989] <dbg> zmk: zmk_usb_get_conn_state: state: 1
[00:00:01.839,019] <dbg> zmk: get_selected_endpoint: No endpoints are ready.
[00:00:01.839,019] <dbg> zmk: zmk_endpoints_send_report: usage page 0x07
[00:00:01.839,050] <err> zmk: FAILED TO SEND OVER USB: -19
[00:00:01.839,050] <dbg> zmk: zmk_endpoints_send_report: usage page 0x0C
[00:00:01.839,050] <err> zmk: FAILED TO SEND OVER USB: -19
[00:00:01.839,080] <inf> zmk: Endpoint changed: 1
[00:00:01.095,062] <inf> usb_hid: Device configured
[00:00:01.095,092] <dbg> zmk: zmk_usb_get_conn_state: state: 3
[00:00:01.095,123] <dbg> zmk: zmk_usb_get_conn_state: state: 3
[00:00:01.095,123] <dbg> zmk: get_selected_endpoint: Only USB is ready.
[00:00:01.095,153] <dbg> zmk: zmk_endpoints_send_report: usage page 0x07
[00:00:01.095,153] <dbg> zmk: zmk_endpoints_send_report: usage page 0x0C
[00:00:01.095,184] <inf> zmk: Endpoint changed: 0
[00:00:01.095,458] <dbg> zmk: destination_connection: Address pointer 0x200098bb
[00:00:01.095,489] <wrn> zmk: Not sending, no active address for current profile
[00:00:01.095,489] <dbg> zmk: destination_connection: Address pointer 0x200098bb
[00:00:01.095,520] <wrn> zmk: Not sending, no active address for current profile
[00:00:01.229,370] <dbg> zmk: zmk_led_indicators_process_report: led_indicators=0x01 for endpoint=0, profile=0
[00:00:01.722,137] <dbg> zmk: kscan_matrix_read: Sending event at 1,1 state on
[00:00:01.722,229] <dbg> zmk: zmk_kscan_process_msgq: Row: 1, col: 1, position: 5, pressed: true
[00:00:01.722,290] <dbg> zmk: zmk_keymap_apply_position_state: layer: 0 position: 5, binding name: KEY_PRESS
[00:00:01.722,320] <dbg> zmk: on_keymap_binding_pressed: position 5 keycode 0x7001D
[00:00:01.722,351] <dbg> zmk: hid_listener_keycode_pressed: usage_page 0x07 keycode 0x1D implicit_mods 0x00 explicit_mods 0x00
[00:00:01.722,381] <dbg> zmk: zmk_hid_implicit_modifiers_press: Modifiers set to 0x00
[00:00:01.722,381] <dbg> zmk: zmk_endpoints_send_report: usage page 0x07
[00:00:02.868,133] <dbg> zmk: kscan_matrix_read: Sending event at 1,1 state off
[00:00:02.868,225] <dbg> zmk: zmk_kscan_process_msgq: Row: 1, col: 1, position: 5, pressed: false
[00:00:02.868,286] <dbg> zmk: zmk_keymap_apply_position_state: layer: 0 position: 5, binding name: KEY_PRESS
[00:00:02.868,316] <dbg> zmk: on_keymap_binding_released: position 5 keycode 0x7001D
[00:00:02.868,347] <dbg> zmk: hid_listener_keycode_released: usage_page 0x07 keycode 0x1D implicit_mods 0x00 explicit_mods 0x00
[00:00:02.868,377] <dbg> zmk: zmk_hid_implicit_modifiers_release: Modifiers set to 0x00
[00:00:02.868,377] <dbg> zmk: zmk_endpoints_send_report: usage page 0x07
[00:00:02.181,121] <dbg> zmk: kscan_matrix_read: Sending event at 2,2 state on
[00:00:02.181,213] <dbg> zmk: zmk_kscan_process_msgq: Row: 2, col: 2, position: 10, pressed: true
[00:00:02.181,274] <dbg> zmk: zmk_keymap_apply_position_state: layer: 0 position: 10, binding name: KEY_PRESS
[00:00:02.181,304] <dbg> zmk: on_keymap_binding_pressed: position 10 keycode 0x4070010
[00:00:02.181,335] <dbg> zmk: hid_listener_keycode_pressed: usage_page 0x07 keycode 0x10 implicit_mods 0x04 explicit_mods 0x00
[00:00:02.181,365] <dbg> zmk: zmk_hid_implicit_modifiers_press: Modifiers set to 0x04
[00:00:02.181,365] <dbg> zmk: zmk_endpoints_send_report: usage page 0x07
[00:00:02.307,098] <dbg> zmk: kscan_matrix_read: Sending event at 2,2 state off
[00:00:02.307,189] <dbg> zmk: zmk_kscan_process_msgq: Row: 2, col: 2, position: 10, pressed: false
[00:00:02.307,250] <dbg> zmk: zmk_keymap_apply_position_state: layer: 0 position: 10, binding name: KEY_PRESS
[00:00:02.307,281] <dbg> zmk: on_keymap_binding_released: position 10 keycode 0x4070010
[00:00:02.307,312] <dbg> zmk: hid_listener_keycode_released: usage_page 0x07 keycode 0x10 implicit_mods 0x04 explicit_mods 0x00
[00:00:02.307,342] <dbg> zmk: zmk_hid_implicit_modifiers_release: Modifiers set to 0x00
[00:00:02.307,342] <dbg> zmk: zmk_endpoints_send_report: usage page 0x07
[00:00:02.596,099] <dbg> zmk: kscan_matrix_read: Sending event at 2,3 state on
[00:00:02.596,191] <dbg> zmk: zmk_kscan_process_msgq: Row: 2, col: 3, position: 11, pressed: true
[00:00:02.596,252] <dbg> zmk: zmk_keymap_apply_position_state: layer: 0 position: 11, binding name: KEY_PRESS
[00:00:02.596,313] <dbg> zmk: on_keymap_binding_pressed: position 11 keycode 0x2007000E
[00:00:02.596,343] <dbg> zmk: hid_listener_keycode_pressed: usage_page 0x07 keycode 0x0E implicit_mods 0x20 explicit_mods 0x00
[00:00:02.596,343] <dbg> zmk: zmk_hid_implicit_modifiers_press: Modifiers set to 0x20
[00:00:02.596,343] <dbg> zmk: zmk_endpoints_send_report: usage page 0x07
[00:00:02.720,092] <dbg> zmk: kscan_matrix_read: Sending event at 2,3 state off
[00:00:02.720,184] <dbg> zmk: zmk_kscan_process_msgq: Row: 2, col: 3, position: 11, pressed: false
[00:00:02.720,245] <dbg> zmk: zmk_keymap_apply_position_state: layer: 0 position: 11, binding name: KEY_PRESS
[00:00:02.720,275] <dbg> zmk: on_keymap_binding_released: position 11 keycode 0x2007000E
[00:00:02.720,306] <dbg> zmk: hid_listener_keycode_released: usage_page 0x07 keycode 0x0E implicit_mods 0x20 explicit_mods 0x00
[00:00:02.720,336] <dbg> zmk: zmk_hid_implicit_modifiers_release: Modifiers set to 0x00
[00:00:02.720,336] <dbg> zmk: zmk_endpoints_send_report: usage page 0x07
`;
        }
    };
});
//# sourceMappingURL=bundle.js.map
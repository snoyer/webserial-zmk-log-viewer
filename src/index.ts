import { WebserialZmkLogger } from "./app";

let log: WebserialZmkLogger = undefined;

document.addEventListener("readystatechange", (e) => {
  init();
});

function init() {
  const log_container = document.getElementById("log");

  log = new WebserialZmkLogger(log_container);
  log.init();

  const intro = document
    .querySelectorAll(".intro")
    .forEach((e) => e.setAttribute("style", "display:none"));

  if ("serial" in navigator) {
    document.querySelectorAll("#intro-supported li").forEach((e) => {
      log.add_dummy_log(e.className || "dbg", e.innerHTML);
    });
  } else {
    document.querySelectorAll("#intro-unsupported li").forEach((e) => {
      log.add_dummy_log(e.className || "dbg", e.innerHTML);
    });
    document
      .querySelectorAll(".tools .connect")
      .forEach((e) => e.setAttribute("disabled", "true"));
  }

  document
    .querySelector(".tools .connect")
    .addEventListener("click", (event: KeyboardEvent) => {
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
    .forEach((form: HTMLFormElement) => {
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
  const kw = document.querySelector(
    "form.highlight .keywords"
  ) as HTMLInputElement;
  log.update_highlight_options(kw.value.split(/\s+/));
}

function hashchanged() {
  if (location.hash == "#sample") {
    const input = document.querySelector(
      ".highlight .keywords"
    ) as HTMLInputElement;
    input.value = "keycode behavior layer binding";
    update_highlight_options();
    const lines = sample.trim().split("\n");
    for (const line of lines) {
      log.presenter.add_line(line);
    }
  }
}

const sample = `
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

import { MODES } from "../navigation/navigationController.js";

const MODE_LABELS = {
  [MODES.ORBIT]: "Tryb: Orbita",
  [MODES.FLY]: "Tryb: Lot",
};

const HINTS = {
  [MODES.ORBIT]:
    "Lewy przycisk – obrót · Prawy – przybliżanie · " +
    "Środkowy – przesuwanie · Kółko – zoom",
  [MODES.FLY]:
    "<strong>Kliknij w scenę, aby sterować</strong><br />" +
    "WASD – ruch · Spacja – w górę · Shift – w dół · " +
    "Mysz – rozglądanie · Esc – wyjście",
};

export function bindNavigationPanel(controller, { modeButton, resetButton, hint }) {
  modeButton.addEventListener("click", function () {
    controller.toggle();
    modeButton.blur();
  });

  resetButton.addEventListener("click", function () {
    controller.reset();
    resetButton.blur();
  });

  controller.onChange(function ({ mode, locked }) {
    modeButton.textContent = MODE_LABELS[mode];
    hint.innerHTML = HINTS[mode];
    hint.classList.toggle("hidden", locked);
  });
}

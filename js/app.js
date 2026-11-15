import { NavigationController } from "./navigation/navigationController.js";
import { bindNavigationPanel } from "./ui/navigationPanel.js";

const navigation = new NavigationController({
  scene: document.getElementById("buildingScene"),
  camera: document.getElementById("mainCamera"),
  navInfo: document.getElementById("navInfo"),
});

bindNavigationPanel(navigation, {
  modeButton: document.getElementById("toggleMode"),
  resetButton: document.getElementById("resetCamera"),
  hint: document.getElementById("controlsHint"),
});

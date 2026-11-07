const resetButton = document.getElementById("resetCamera");

resetButton.addEventListener("click", function () {
  const camera = document.getElementById("mainCamera");

  camera.setAttribute("position", "0 18 55");
  camera.setAttribute("orientation", "1 0 0 -0.25");
});

/**
 * * Game Difficulty Selection
 * * Game Start
 */
const $difficulties = document.querySelectorAll("difficulty-card");
const $startButton = document.getElementById("start-button");

let selectedDifficulty = null;

$difficulties.forEach((difficulty) => {
  difficulty.addEventListener("click", (e) => {
    e.preventDefault();

    $difficulties.forEach((difficulty) => {
      difficulty.classList.remove("selected");
    });

    if (difficulty.classList.contains("selected")) {
      difficulty.classList.remove("selected");
      selectedDifficulty = null;
    } else {
      difficulty.classList.add("selected");
      selectedDifficulty = difficulty.getAttribute("difficulty");

      console.log(selectedDifficulty);
    }
  });
});

$startButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (!selectedDifficulty) {
    // ! This should be a toast
    alert("Select a difficulty before starting the game");
    return;
  }

  window.location.href = `../play/index.html?difficulty=${selectedDifficulty}`;
});

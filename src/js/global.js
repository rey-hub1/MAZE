// console.log = function () {};
const get = (id) => document.getElementById(id);

const welcomeScreen = get("welcomeScreen");
const welcomeStyle = window.getComputedStyle(welcomeScreen);
const userNameInput = get("userNameInput");
const playGameBtn = get("playGameBtn");

const gameScreen = get("gameScreen");
const gameInfo = get("gameInfo");
const userNameDisplay = get("userNameDisplay");
const livesDisplay = get("livesDisplay");
const stageDisplay = get("stageDisplay");
const timerDisplay = get("timerDisplay");
const mazeBoard = get("mazeBoard");
const hintBtn = get("hintBtn");

const goPopup = get("goPopUp");
const goUsername = get("goUsername");
const goStage = get("goStage");
const saveScoreBtn = get("saveScoreBtn");
const playAgainBtn = get("playAgainBtn");

const instructionBtn = get("instructionsBtn");
const instructionModal = get("instructionsModal");
const closeInstructionBtn = get("closeInstructionsBtn");

const leaderboardBtn = get("leaderboardBtn");
const leaderboardModal = get("leaderboardModal");
const closeLeaderboardBtn = get("closeLeaderboardBtn");
const leaderboardList = get("leaderboardList");

const alertSuccess = get("alertSuccess");
const alertDanger = get("alertDanger");

let playerUserName;
let gameTimer;
let currentLives;
let currentStage = 1;
let playerPosition = { row: 0, col: 0 };
let startPosition = { row: 0, col: 0 };
let finishPosition = { row: 0, col: 0 };
let mazeLayout = []; // (0=path, 1=wall)
let hintUsedThisStage;

let moveTimerId;
let memorizingTimerId;

let wallSound = new Audio("src/sounds/hurt.wav"),
bgm = new Audio("src/sounds/bgm.mp3"),
gameOverSound = new Audio("src/sounds/game-over.wav"),
xSound = new Audio("src/sounds/tap.wav"),
ySound = new Audio("src/sounds/jump.wav"),
nextSound = new Audio("src/sounds/power_up.wav")

bgm.loop = true
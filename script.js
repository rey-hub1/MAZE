document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const userNameInput = document.getElementById("userNameInput");
  const playGameBtn = document.getElementById("playGameBtn");

  const gameScreen = document.getElementById("gameScreen");
  const gameInfo = document.getElementById("gameInfo");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const livesDisplay = document.getElementById("livesDisplay");
  const stageDisplay = document.getElementById("stageDisplay");
  const timerDisplay = document.getElementById("timerDisplay");
  const mazeBoard = document.getElementById("mazeBoard");
  const hintBtn = document.getElementById("hintBtn");

  let playerUserName = "Guest";
  let currentLives = 5;
  let currentStage = 1;
  let gameTimer = 0;
  let playerPosition = { row: 0, col: 0 };
  let startPosition = { row: 0, col: 0 };
  let finishPosition = { row: 0, col: 0 };
  let mazeLayout = []; // Array 2D untuk simpan layout maze (0=path, 1=wall)
  hintUsedThisStage = 0;

  userNameInput.addEventListener("input", () => {
    if (userNameInput.value.trim() !== "") {
      playGameBtn.disabled = false;
    } else {
      playGameBtn.disabled = true;
    }
  });

  playGameBtn.addEventListener("click", () => {
    if (!playGameBtn.disabled) {
      const username = userNameInput.value;
      // Nanti: Sembunyikan welcome screen, tampilkan game board
      welcomeScreen.style.display = "none";
      initGameScreen();
      startGame();
      // initGameScreen(); // Panggil fungsi untuk setup layar game (buat nanti)
      // startGame(username); // Panggil fungsi untuk mulai game (buat nanti)
    }
  });
  function initGameScreen() {
    userNameDisplay.textContent = `Username ${playerUserName}`;
    livesDisplay.textContent = currentLives;
    stageDisplay.textContent = currentStage;
    timerDisplay.textContent = `${gameTimer}s`;
    gameScreen.style.display = "flex";
    createMazeGrid();
  }

  function createMazeGrid() {
    mazeBoard.innerHTML = "";
    mazeLayout = [];
    for (let r = 0; r < 10; r++) {
      const rowArray = [];
      for (let c = 0; c < 10; c++) {
        const cell = document.createElement("div");
        cell.classList.add("mazeCell");
        cell.id = `cell-${r}-${c}`;
        // console.log(`cell-${r}-${c}`);
        mazeBoard.appendChild(cell);
        rowArray.push(0);
      }
      mazeLayout.push(rowArray);
    }
    console.log("Maze Layout:", mazeLayout);
  }

  function startGame() {
    currentLives = 5;
    currentStage = 1;
    gameTimer = 0;
    hintUsedThisStage = 0;
    updateGameInfoDisplay();
    generateNewStage();
  }

  function updateGameInfoDisplay() {
    livesDisplay.textContent = currentLives;
    stageDisplay.textContent = currentStage;
    // Timer akan di update oleh fungsi timer nya sendiri
  }

  function generateNewStage() {
    console.log("Generating New Stage", currentStage);
    hintUsedThisStage = 1;
    hintBtn.disabled = false;
    hintBtn.textContent = `(${hintUsedThisStage})`;

    // Reset Grid tampilan (hapus class player, start, finish, wall lama)
    const cells = document.querySelectorAll(".mazeCell");
    cells.forEach((cell) => {
      cell.classList.remove("player", "start","finish", "wall", "wall-memorizing");
    });

    // Tentukan Start
    startPosition.row = Math.floor(Math.random() * 10);
    startPosition.col = 0;

    // Tentukan Finish
    finishPosition.row = Math.floor(Math.random() * 10);
    finishPosition.col = 9;

    // Pastikan start dan finish tidak di tempat yang sama jika cuma ada 1 baris (tidak relevan untuk 10x10)

    //  Set Player

    // Tanda Grid
    // if (startPosition.row === finishPosition.row) {
    //   if (startPosition.row + 2 >= 9) {
    //     startPosition.row += 2;
    //   } else {
    //     startPosition.row -= 2;
    //   }
    // }
    playerPosition = { ...startPosition };
    console.log("Player Position Row:", playerPosition.row);
    canPlayerMove = true;

    document
      .getElementById(`cell-${startPosition.row}-${startPosition.col}`)
      .classList.add("start");
    document
      .getElementById(`cell-${finishPosition.row}-${finishPosition.col}`)
      .classList.add("finish");
    updatePlayerPositionOnGrid();

    // Generate Walls
    generateRandomWalls();

    // Fase hapal
    // startMemorizingPhase();
  }

  function updatePlayerPositionOnGrid() {
    // hapus class player
    const oldPlayerCell = document.querySelector(".player");
    console.log('old',oldPlayerCell)
    if (oldPlayerCell) {
      oldPlayerCell.classList.remove("player");
    }
    // Tambah Class ke player cell baru

    const currentPlayerCell = document.getElementById(
      `cell-${playerPosition.row}-${playerPosition.col}`
    );
    console.log('--Update Player--')
    console.log('currentPlayerCell',currentPlayerCell)
    if (currentPlayerCell) {
      currentPlayerCell.classList.add("player");
    } else {
      console.log("ERROR ON CURRENT PLAYER CELL :", playerPosition);
    }
  }

  // MOVING LOGIC
  let canPlayerMove = true;

  window.addEventListener("keydown", (event) => {
    if (!canPlayerMove) return;

    let newRow = playerPosition.row;
    let newCol = playerPosition.col;

    switch (event.key) {
      case "ArrowUp":
        console.log("Player Position Row:", playerPosition.row);
        console.log(newRow);
        newRow--;
        console.log(newRow);
        break;
      case "ArrowDown":
        newRow++;
        break;
      case "ArrowLeft":
        newCol--;
        break;
      case "ArrowRight":
        newCol++;
        break;
      default:
        return; // Bukan tombol panah, abaikan
    }

    // Cek Batasan Grid
    console.log(newRow)
    console.log(newCol)

    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
        if (mazeLayout[newRow][newCol] == 1) {
            handleWallCollision();
            return;
        }
        
      playerPosition.row = newRow;
      playerPosition.col = newCol;
      updatePlayerPositionOnGrid();
      checkWinCondition();
    }

    function checkWinCondition() {
      if (
        playerPosition.row === finishPosition.row &&
        playerPosition.col === finishPosition.col
      ) {
        canPlayerMove = false;
        alert(`Stage ${currentStage} Finish!`);
        currentStage++;
        updateGameInfoDisplay();
        // Jika Langsung Mau ke stage Berikutnya
        if (currentLives > 0) {
          generateNewStage();
        } else {
          handleGameOver(); // Jika nyawa habis saat menang (seharusnya tidak mungkin jika logika benar)
        }
      }
    }
  });

  function generateRandomWalls(){
    // Reset semua jalur 0
    for (let r = 0; r < 10; r++) {
      mazeLayout[r] = [];
      for (let c = 0; c < 10; c++) {
        mazeLayout[r][c] = 0;
      }
    }
    // simpan referensi sel start dan finish
    mazeLayout[startPosition.row][startPosition.col] = "start_node";
    mazeLayout[finishPosition.row][finishPosition.col] = "finish_node";

    // Algoritma sederhana (kurang ideal) untuk generate tembok
    for (let r = 0; r < 10; r++) {
      for (let c = 0; r < 10; c++) {
        if (
          mazeLayout[r][c] == "finish_node" ||
          mazeLayout[r][c] == "finish_node"
        ) {
          continue;
        }
        if (Math.random() < 0.3) {
          mazeLayout[r][c] == 1;
        }
      }
    }

    if (!isPathAvailable(startPosition, finishPosition, mazeLayout)) {
      console.log(
        "NO FOUND PATH FOUND  Regenerating walls or use a better algorithm."
      );
      // Jika tidak ada jalur, kita harus ulangi atau perbaiki.
      // Untuk LKS, ini harus menghasilkan maze yang SOLVABLE.
      // Cara paling gampang (tapi kasar) untuk demo: panggil generateRandomWalls() lagi
      // atau bersihkan beberapa tembok.
      // generateRandomWalls(); // Rekursif, hati-hati infinite loop jika terlalu sulit
      // Solusi lebih baik: implementasi algoritma maze generation yang benar (e.g., DFS-based)
      // atau algoritma pathfinding untuk membersihkan tembok jika buntu.
      // Untuk sementara, kita asumsikan path ada atau kita buat simple path.

    //   Contoh 'memaksa' jalur sederhana jika gagal (HANYA UNTUK TESTING AWAL, JANGAN DIPAKAI DI LOMBA)
      if (startPosition.row !== finishPosition.row) {
          for (let i = Math.min(startPosition.row, finishPosition.row); i <= Math.max(startPosition.row, finishPosition.row); i++) {
              mazeLayout[i][Math.floor(10/2)] = 0; // Buat jalur vertikal di tengah
          }
      }
      for (let i = Math.min(startPosition.col, finishPosition.col); i <= Math.max(startPosition.col, finishPosition.col); i++) {
           mazeLayout[finishPosition.row][i] = 0; // Buat jalur horizontal ke finish
           mazeLayout[startPosition.row][i] = 0; // Buat jalur horizontal dari start
      }
    }
    // Setelah mazeLayout final, kembalikan 'start_node' dan 'finish_node' ke 0 (path)
    // karena pathfinding mungkin butuh angka 0.
    mazeLayout[startPosition.row][startPosition.col] =0;
    mazeLayout[finishPosition.row][finishPosition.col] =0;

    console.log("generated Maze Layout:", JSON.parse(JSON.stringify(mazeLayout)))
  }

  function isPathAvailable(startPosition, finishPosition, mazeLayout) {
    const queue = [[startPosition.row, finishPosition.row]];
    const visited = new Set();
    visited.add(`${startPosition.row}-${startPosition.col}`)
    const R=10, C = 10;

    while(queue.length > 0){
        const [r,c] = queue.shift();

        if (r === finishPosition.row && c === finishPosition.col) return true; //Jalur Ditemukan
        // Tetangga: Atas Bawah Kiri Kanan
        const neighbors = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]

        for(const [nr,nc] of neighbors){
            if (nr >= 0 && nr<R && nc >= 0 && nc < C &&
            (currentLayout[nr][nc]===0 || currentLayout[nr][nc] === 'finish_node') &&
            !visited.has(`${nr}-${nc}`)) 
            {
                visited.add(`${nr}-${nc}`);
                queue.push([nr,nc])
            }
        }
    }
    return false
  }
});

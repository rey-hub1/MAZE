document.addEventListener("DOMContentLoaded", () => {
  // MUSIC PLAY
  document.addEventListener("click", function () {
    bgm.play();
  });

  userNameInput.addEventListener("input", () => {
    if (userNameInput.value.trim() !== "") {
      playerUserName = userNameInput.value.trim();
      playGameBtn.disabled = false;
    } else {
      playGameBtn = "Guest";
      playGameBtn.disabled = true;
    }
  });

  playGameBtn.addEventListener("click", () => {
    if (!playGameBtn.disabled) {
      const username = userNameInput.value;
      welcomeScreen.style.display = "none";
      initGameScreen(); // Panggil fungsi untuk setup layar game
      startGame(); // Panggil fungsi untuk mulai game
    }
  });

  hintBtn.addEventListener("click", () => {
    if (canPlayerMove && !hintUsedThisStage) {
      hintUsedThisStage = true;
      hintBtn.disabled = true;
      hintBtn.textContent = `Hint: ${e}`;

      // Tampilkan Tembok Selama 1 detik
      const wallElements = [];

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (mazeLayout[r][c] === 1) {
            const wallCell = get(`cell-${r}-${c}`);
            wallCell.classList.add("wall-memorizing");
            wallElements.push(wallCell);
          }
        }
      }

      setTimeout(() => {
        wallElements.forEach((element) => {
          element.classList.remove("wall-memorizing");
        });
      }, 1000);
    }
  });

  instructionBtn.addEventListener("click", () => {
    instructionModal.style.display = "flex";
  });
  leaderboardBtn.addEventListener("click", () => {
    displayLeaderboard();
    leaderboardModal.style.display = "flex";
  });
  // Event listeners untuk tombol close modal
  closeInstructionBtn.addEventListener("click", () => {
    instructionModal.style.display = "none";
  });

  closeLeaderboardBtn.addEventListener("click", () => {
    leaderboardModal.style.display = "none";
  });

  saveScoreBtn.addEventListener("click", () => {
    const scores = JSON.parse(localStorage.getItem("blindMazeScore")) || [];
    scores.push({ username: playerUserName, stage: currentStage });
    // Sort Descending
    scores.sort((a, b) => b.stage - a.stage);
    localStorage.setItem("blindMazeScore", JSON.stringify(scores));
    showSuccess("Score Saved");
    goPopup.style.display = "none";
    welcomeScreen.style.display = "flex";
    userNameInput.value = "";
    playGameBtn.disabled = true;
  });

  function displayLeaderboard() {
    const scores = JSON.parse(localStorage.getItem("blindMazeScore")) || [];
    leaderboardList.innerHTML = "";
    if (scores.length === 0) {
      leaderboardBtn.innerHTML = "<li><strong>No Scores Yet</strong></li>";
      return;
    }
    scores.forEach((score) => {
      const li = document.createElement("li");
      li.textContent = `${score.username} - Stage ${score.stage}`;
      leaderboardList.appendChild(li);
    });
  }
  function initGameScreen() {
    userNameDisplay.textContent = `Username ${playerUserName}`;
    livesDisplay.textContent = currentLives;
    stageDisplay.textContent = currentStage;
    // timerDisplay.textContent = `${gameTimer}s`;
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

        mazeBoard.appendChild(cell);
        rowArray.push(0);
      }
      mazeLayout.push(rowArray);
    }
    console.log("Maze Layout:", mazeLayout);
  }

  function startGame() {
    // playerUserName = "Guest";
    currentLives = 5;
    currentStage = 1;
    gameTimer = 20;
    hintUsedThisStage = false;
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
    hintUsedThisStage = false;
    hintBtn.disabled = false;
    hintBtn.textContent = `(${hintUsedThisStage})`;

    // Reset Grid tampilan (hapus class player, start, finish, wall lama)
    const cells = document.querySelectorAll(".mazeCell");
    cells.forEach((cell) => {
      cell.classList.remove(
        "player",
        "start",
        "finish",
        "wall",
        "wall-memorizing"
      );
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
    // console.log("Player Position Row:", playerPosition.row);
    canPlayerMove = true;

    document;
    get(`cell-${startPosition.row}-${startPosition.col}`).classList.add(
      "start"
    );
    document;
    get(`cell-${finishPosition.row}-${finishPosition.col}`).classList.add(
      "finish"
    );
    updatePlayerPositionOnGrid();

    // Generate Walls
    generateRandomWalls();

    // Fase hapal
    startMemorizingPhase();
  }

  function updatePlayerPositionOnGrid() {
    // hapus class player
    const oldPlayerCell = document.querySelector(".player");
    // console.log("old", oldPlayerCell);
    if (oldPlayerCell) {
      oldPlayerCell.classList.remove("player");
    }
    // Tambah Class ke player cell baru

    const currentPlayerCell = get(
      `cell-${playerPosition.row}-${playerPosition.col}`
    );
    // console.log("--Update Player--");
    // console.log("currentPlayerCell", currentPlayerCell);
    if (currentPlayerCell) {
      currentPlayerCell.classList.add("player");
    } else {
      console.log("ERROR ON CURRENT PLAYER CELL :", playerPosition);
    }
  }

  // MOVING LOGIC
  let canPlayerMove = true;

  window.addEventListener("keydown", (event) => {
    if (!canPlayerMove) {
      console.warn("Error On can player move");
      return;
    }

    let newRow = playerPosition.row;
    let newCol = playerPosition.col;

    if (welcomeStyle.display == "flex" && event.key == "Enter") {
      playGameBtn.click();
    }
    switch (event.key) {
      case "ArrowUp":
        newRow--;
        ySound.play();
        break;
      case "ArrowDown":
        newRow++;
        ySound.play();
        break;
      case "ArrowLeft":
        newCol--;
        xSound.play();
        break;
      case "ArrowRight":
        newCol++;
        xSound.play();
        break;
      case "i":
        hintBtn.click();
        break;
      default:
        return; // Bukan tombol panah, abaikan
    }

    // Cek Batasan Grid

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
  });

  function handleWallCollision() {
    canPlayerMove = false;
    clearInterval(moveTimerId);
    showDanger("You Hit A wall");
    currentLives--;
    updateGameInfoDisplay();
    if (currentLives <= 0) {
      handleGameOver();
    } else {
      handleStageRestart();
    }
  }

  function handleStageRestart() {
    console.log("Restarting Stage..");
    // player Kembali Ke tempat semula
    playerPosition = { ...startPosition };
    updatePlayerPositionOnGrid();
    // Ulangi Dari Fase Hapal
    startMemorizingPhase();
  }

  function checkWinCondition() {
    if (
      playerPosition.row === finishPosition.row &&
      playerPosition.col === finishPosition.col
    ) {
      clearInterval(moveTimerId);
      clearInterval(memorizingTimerId);
      canPlayerMove = false;
      showSuccess(`Stage ${currentStage} Finish!`);

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
  function o95generateRandomWalls() {
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

    // Random
    let Persentase = clamp(0.2 + currentStage * 0.025, 0.2, 0.35);
    console.log("Random Persentase Wall: ", Persentase);

    // Algoritma sederhana (kurang ideal) untuk generate tembok
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (
          mazeLayout[r][c] == "finish_node" ||
          mazeLayout[r][c] == "start_node"
        ) {
          continue;
        }
        if (Math.random() < Persentase) {
          // 30%
          mazeLayout[r][c] = 1; // Wall
          get(`cell-${r}-${c}`).classList.add("wall");
        }
      }
    }
    console.log(
      "generated Maze Layout FINAL:",
      JSON.parse(JSON.stringify(mazeLayout))
    );

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
        for (
          let i = Math.min(startPosition.row, finishPosition.row);
          i <= Math.max(startPosition.row, finishPosition.row);
          i++
        ) {
          mazeLayout[i][Math.floor(10 / 2)] = 0; // Buat jalur vertikal di tengah
        }
      }
      for (
        let i = Math.min(startPosition.col, finishPosition.col);
        i <= Math.max(startPosition.col, finishPosition.col);
        i++
      ) {
        mazeLayout[finishPosition.row][i] = 0; // Buat jalur horizontal ke finish
        mazeLayout[startPosition.row][i] = 0; // Buat jalur horizontal dari start
      }
    }
    // Setelah mazeLayout final, kembalikan 'start_node' dan 'finish_node' ke 0 (path)
    // karena pathfinding mungkin butuh angka 0.
    mazeLayout[startPosition.row][startPosition.col] = 0;
    mazeLayout[finishPosition.row][finishPosition.col] = 0;

    console.log(
      "generated Maze Layout:",
      JSON.parse(JSON.stringify(mazeLayout))
    );
  }

  function isPathAvailable(start, finish, currentLayout) {
    const queue = [[start.row, start.col]];
    const visited = new Set();
    visited.add(`${start.row}-${start.col}`);
    const R = 10,
      C = 10;

    while (queue.length > 0) {
      const [r, c] = queue.shift();

      if (r === finish.row && c === finish.col) return true; //Jalur Ditemukan
      // Tetangga: Atas Bawah Kiri Kanan
      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];

      for (const [nr, nc] of neighbors) {
        if (
          nr >= 0 &&
          nr < R &&
          nc >= 0 &&
          nc < C &&
          (currentLayout[nr][nc] === 0 ||
            currentLayout[nr][nc] === "finish_node") &&
          !visited.has(`${nr}-${nc}`)
        ) {
          visited.add(`${nr}-${nc}`);
          queue.push([nr, nc]);
        }
      }
    }
    return false;
  }

  function startMemorizingPhase() {
    let timeLeft = 3;

    console.log("Memorizing Started...");
    canPlayerMove = false;
    timerDisplay.textContent = `Memorizing ${timeLeft}s`;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (mazeLayout[r][c] === 1) {
          document;
          get(`cell-${r}-${c}`).classList.add("wall-memorizing");
        } else {
          document;
          get(`cell-${r}-${c}`).classList.remove("wall", "wall-memorizing");
        }
      }
    }
    // Pastikan Start Dan finish
    document;
    get(`cell-${startPosition.row}-${startPosition.col}`).classList.add(
      "start"
    );
    document;
    get(`cell-${finishPosition.row}-${finishPosition.col}`).classList.add(
      "finish"
    );
    updatePlayerPositionOnGrid();

    let overlay = makeOverlay("ovr", "memorizing", mazeBoard);
    memorizingTimerId = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Memorizing Left: ${timeLeft}s`;
      if (timeLeft < 0) {
        overlay.remove();
        clearInterval(memorizingTimerId);
        startMovePhase();
      }
    }, 1000);
  }

  function startMovePhase() {
    console.log("Move Phase Started..");
    canPlayerMove = true;
    timerDisplay.textContent = "Move: 20s";
    // Hide Tembok
    const wallCells = document.querySelectorAll(".wall-memorizing");
    wallCells.forEach((cell) => cell.classList.remove("wall-memorizing"));
    // Pastikan Start & Finish Terlihat

    let timeLeft = gameTimer;
    // debugger;
    moveTimerId = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Move: ${timeLeft}s`;
      if (timeLeft < 0) {
        clearInterval(moveTimerId);
        if (canPlayerMove) {
          showDanger("Time Up");
          handleTimeUp();
        }
      }
    }, 1000);
  }

  function makeOverlay(id = "ovr", teks, parent) {
    const overlayElement = document.createElement("div");

    // Set ID
    if (id && teks) {
      overlayElement.id = id;
      overlayElement.textContent = teks.toUpperCase();
    }
    overlayElement.style.zIndex = 10;
    parent.appendChild(overlayElement);
    return overlayElement;
  }

  function handleTimeUp() {
    canPlayerMove = false;
    showDanger("time Up");
    currentLives--;
    updateGameInfoDisplay();
    if (currentLives <= 0) {
      handleGameOver();
    } else {
      handleStageRestart();
    }
  }

  function handleGameOver() {
    canPlayerMove = false;
    clearInterval(moveTimerId);
    clearInterval(memorizingTimerId);
    console.log("Game Over");

    goUsername.textContent = playerUserName;
    goStage.textContent = currentStage;
    goPopup.style.display = "block";
    welcomeScreen.style.display = "none";
  }

  playAgainBtn.addEventListener("click", () => {
    goPopup.style.display = "none";
    welcomeScreen.style.display = "flex";
    gameScreen.style.display = "none";
    // Reset Input Nama
    userNameInput.value = "";
    playGameBtn.disabled = true;
  });

  function clamp(nilai, batasMin, batasMax) {
    return Math.max(batasMin, Math.min(nilai, batasMax));
  }

  function showDanger(text) {
    alertDanger.textContent = text;
    alertDanger.classList.add("show");

    setTimeout(() => {
      alertDanger.classList.remove("show");
    }, 2000);
  }
  function showSuccess(text) {
    alertSuccess.textContent = text;
    alertSuccess.classList.add("show");

    setTimeout(() => {
      alertSuccess.classList.remove("show");
    }, 2000);
  }
});

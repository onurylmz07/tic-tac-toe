(() => {
  const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const boardEl = document.getElementById("board");
  const cells = [...boardEl.querySelectorAll(".cell")];
  const statusEl = document.getElementById("status");
  const scoreXEl = document.getElementById("score-x");
  const scoreOEl = document.getElementById("score-o");
  const scoreDrawEl = document.getElementById("score-draw");
  const resetRoundBtn = document.getElementById("reset-round");
  const resetScoresBtn = document.getElementById("reset-scores");

  let board = Array(9).fill(null);
  let current = "X";
  let locked = false;
  let scores = { X: 0, O: 0, draw: 0 };

  function setStatus(text, className = "") {
    statusEl.textContent = text;
    statusEl.className = `status ${className}`.trim();
  }

  function renderScores() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreDrawEl.textContent = scores.draw;
  }

  function findWinner() {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { player: board[a], line };
      }
    }
    return null;
  }

  function endRound(message, className, winLine = []) {
    locked = true;
    setStatus(message, className);
    cells.forEach((cell, i) => {
      cell.disabled = true;
      if (winLine.includes(i)) cell.classList.add("win");
    });
  }

  function handleMove(index) {
    if (locked || board[index]) return;

    board[index] = current;
    const cell = cells[index];
    cell.textContent = current;
    cell.classList.add(current.toLowerCase());
    cell.disabled = true;
    cell.setAttribute("aria-label", `Cell ${index + 1}, ${current}`);

    const winner = findWinner();
    if (winner) {
      scores[winner.player] += 1;
      renderScores();
      endRound(`${winner.player} wins!`, `win-${winner.player.toLowerCase()}`, winner.line);
      return;
    }

    if (board.every(Boolean)) {
      scores.draw += 1;
      renderScores();
      endRound("It's a draw", "draw");
      return;
    }

    current = current === "X" ? "O" : "X";
    setStatus(`${current}'s turn`);
  }

  function resetRound() {
    board = Array(9).fill(null);
    current = "X";
    locked = false;
    setStatus("X starts");
    cells.forEach((cell, i) => {
      cell.textContent = "";
      cell.disabled = false;
      cell.className = "cell";
      cell.setAttribute("aria-label", `Cell ${i + 1}`);
    });
  }

  function resetScores() {
    scores = { X: 0, O: 0, draw: 0 };
    renderScores();
    resetRound();
  }

  cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      handleMove(Number(cell.dataset.index));
    });
  });

  resetRoundBtn.addEventListener("click", resetRound);
  resetScoresBtn.addEventListener("click", resetScores);

  renderScores();
  setStatus("X starts");
})();

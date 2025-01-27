

export function setNodeStatus({d, gameId, nodeStatus, socket}) {
    try {
      nodeStatus[d.node] = d.status;
      socket.emit("nodeStatusUpdate", gameId, d);
    } catch (error) {
      console.error("Error in setNodeStatus method:", error);
    }
  }

export function decreasingBar({
    elementID,
    interval
}) {
  var elem = document.getElementById(elementID);
  var width = 100;
  var id = setInterval(frame, interval);
  function frame() {
    if (width === 0) {
      clearInterval(id);
    } else {
      width--;
      elem.style.width = width + '%';
      if (width < 50) {
        elem.style.backgroundColor = 'red';
      }
      if (width < 5) {
        elem.style.backgroundColor = 'darkred';
        elem.style.animation = 'pulse 1s infinite';
      }
    }
  }
}

  export function checkAdjacentNodes({
    nodeStatus,
    columns,
    totalQuestions,
    gameId,
    socket,
  }) {
    let Nodestatus2D = to2DArray(nodeStatus, columns);
    const updateNodeStatus = (adjacentIndex, newStatus) => {
      const currentStatus = Nodestatus2D[adjacentIndex.row][adjacentIndex.col];
      if (currentStatus !== 1 && currentStatus !== 2 && currentStatus !== 3 && currentStatus !== 7 && currentStatus !== 8) { //added status 7 & 8 check
        if ((newStatus === 4 && currentStatus === 5) || (newStatus === 5 && currentStatus === 4)) {
          setNodeStatus({
            d: { node: adjacentIndex.index, status: 6 },
            gameId,
            nodeStatus,
            socket,
          });
          Nodestatus2D[adjacentIndex.row][adjacentIndex.col] = 6;
        } else if (currentStatus !== 4 && currentStatus !== 5 && currentStatus !== 6) {
          setNodeStatus({
            d: { node: adjacentIndex.index, status: newStatus },
            gameId,
            nodeStatus,
            socket,
          });
          Nodestatus2D[adjacentIndex.row][adjacentIndex.col] = newStatus;
        }
      }
    };

    for (let i = 0; i < totalQuestions; i++) {
      if (nodeStatus[i] === 1 || nodeStatus[i] === 2) {
        let nodeRow = Math.floor(i / columns);
        let nodeCol = i % columns;
        let newStatus = nodeStatus[i] === 1 ? 4 : 5;

        // Check left
        if (nodeCol > 0) {
          updateNodeStatus({ row: nodeRow, col: nodeCol - 1, index: i - 1 }, newStatus);
        }
        // Check right
        if (nodeCol < columns - 1) {
          updateNodeStatus({ row: nodeRow, col: nodeCol + 1, index: i + 1 }, newStatus);
        }
        // Check top
        if (nodeRow > 0) {
          updateNodeStatus({ row: nodeRow - 1, col: nodeCol, index: i - columns }, newStatus);
        }
        // Check bottom
        if (nodeRow < columns - 1) {
          updateNodeStatus({ row: nodeRow + 1, col: nodeCol, index: i + columns }, newStatus);
        }
      }
    }
  }
  
  
  function to2DArray(arr, chunkSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }
        /*
Värde 0 - 7, standard 0 är när noden inte är tagen, död eller nåbar
    0 = standdard
    1 = tagen av spelare 1
    2 = tagen av spelare 2
    3 = borttagen/död
    4 = nåbar för spelare 1
    5 = nåbar för spelare 2
    6 = nåbar för 1 och 2
    7 = paxad av p1
    8 = paxad av p2
*/
  export function drawNodeColors({
    totalQuestions,
    nodeStatus,
    showQuestionComponent,
    playerRole,
  }) {
    for (let i = 1; i <= totalQuestions; i++) {
      const nodeElement = document.getElementById(`node-${i}`);
      if (!nodeElement) {
        console.error(`Node element with ID 'node-${i}' not found.`);
        continue;
      }
  
      const currentStatus = nodeStatus[i - 1];
      nodeElement.style.animation = "none"; // Default animation reset
      nodeElement.disabled = true; // Default disabled state
  
      switch (currentStatus) {
        case 1:
          nodeElement.style.backgroundColor = "#32cd32";
          break;
  
        case 2:
          nodeElement.style.backgroundColor = "#ff8c00";
          break;
  
        case 3:
          nodeElement.style.backgroundColor = "#1e1e2f";
          nodeElement.style.borderColor = "#1e1e2f"; 
          break;
  
        case 4:
          nodeElement.style.backgroundColor = "#9cca9cff";
          if (showQuestionComponent) break;
          if (playerRole === "Player 1") {
            nodeElement.disabled = false;
            nodeElement.style.animation = "pulse 2s infinite";
          }
          break;
  
        case 5:
          nodeElement.style.backgroundColor = "#ffc379ff";
          if (showQuestionComponent) break;
          if (playerRole === "Player 2") {
            nodeElement.disabled = false;
            nodeElement.style.animation = "pulse 2s infinite";
          }
          break;
  
        case 6:
          if (!showQuestionComponent) {
            nodeElement.style.backgroundColor = "#f7ffa1ff";
            nodeElement.disabled = false;
            nodeElement.style.animation = "pulse 2s infinite";
          }
          break;
        //case 7 & 8 for locking a question
        case 7:
          nodeElement.style.backgroundColor = "#f5f5f5ff";
          nodeElement.style.borderColor = "#32cd32";
          break;
        case 8:
          nodeElement.style.backgroundColor = "#f5f5f5ff";
          nodeElement.style.borderColor = "#ff8c00";
          break;
  
        default:
          nodeElement.style.backgroundColor = "#f5f5f5ff";
          break;
      }
    }
  }

  function shuffle(array) {
    // Iterate over the array in reverse order
    for (let i = array.length - 1; i > 0; i--) {
      // Generate Random Index
      const j = Math.floor(Math.random() * (i + 1));
  
      // Swap elements
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  export function generateRandomQuestion({ min, max, operator, questions, socket, gameId }) {
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    let generateRandomAnswers = (answer) =>{
      let randomAnswers = [0,0,0];
      randomAnswers[0] = answer + Math.floor(Math.random() * (answer/2) - answer/4); //+- 25% of answer
      randomAnswers[1] = answer + Math.floor(Math.random() * (answer/2) - answer/4);
      randomAnswers[2] = answer + Math.floor(Math.random() * (answer/2) - answer/4);

      if (randomAnswers[0] === randomAnswers[1]){
        randomAnswers[1]++;
      }
      if (randomAnswers[0] === randomAnswers[2]){
        randomAnswers[2]++;
      }
      if (randomAnswers[1] === randomAnswers[2]){
        randomAnswers[2]++;
      }
      for(let i = 0; i < randomAnswers.length; i++){
        if(randomAnswers[i] === answer){
          randomAnswers[i] = answer * 2;
        }
      }
      return randomAnswers;
    }
  
    switch (operator) {
      case '+':
        let correctAnswerAdd = num1 + num2;
        let wrongAnswersAdd = generateRandomAnswers(correctAnswerAdd);
        questions.q = `${num1} + ${num2}`;
        questions.a = [
          { a: correctAnswerAdd, c: true },
          { a: wrongAnswersAdd[0], c: false },
          { a: wrongAnswersAdd[1], c: false },
          { a: wrongAnswersAdd[2], c: false },
        ];
        shuffle(questions.a);
        break;
      case '-':
        if (num1 <= num2){
          return generateRandomQuestion({ min, max, operator, questions, socket, gameId });
        }
        let correctAnswerSubtract = num1 - num2;
        let wrongAnswersSubtract = generateRandomAnswers(correctAnswerSubtract);
        questions.q = `${num1} - ${num2}`;
        questions.a = [
          { a: correctAnswerSubtract, c: true },
          { a: wrongAnswersSubtract[0], c: false },
          { a: wrongAnswersSubtract[1], c: false },
          { a: wrongAnswersSubtract[2], c: false },
        ];
        shuffle(questions.a);
        break;
      case '*':
        let correctAnswerMultiply = num1 * num2;
        let wrongAnswersMultiply = generateRandomAnswers(correctAnswerMultiply);

        questions.q = `${num1} * ${num2}`;
        questions.a = [
          { a: correctAnswerMultiply, c: true },
          { a: wrongAnswersMultiply[0], c: false },
          { a: wrongAnswersMultiply[1], c: false },
          { a: wrongAnswersMultiply[2], c: false },
        ];
        shuffle(questions.a);
        break;
      case '/':
        // Avoid division by zero, decimals, and answer = 1
        if (num2 === 1 || num1 % num2 !== 0 || num1 === num2) {
          return generateRandomQuestion({ min, max, operator, questions, socket, gameId });
        }
        let correctAnswerDivide = num1 /num2;
        let wrongAnswersDivide = generateRandomAnswers(correctAnswerDivide);

        questions.q = `${num1} / ${num2}`;
        questions.a = [
          { a: correctAnswerDivide, c: true },
          { a: wrongAnswersDivide[0], c: false },
          { a: wrongAnswersDivide[1], c: false },
          { a: wrongAnswersDivide[2], c: false },
        ];
        shuffle(questions.a);
        break;
      default:
        questions.q = "Not valid operator";
        questions.a = [
          { a: null, c: true },
          { a: null, c: false },
          { a: null, c: false },
          { a: null, c: false },
        ];
    }
    socket.emit("addQuestion", { gameId, q: questions.q, a: questions.a })
  }
  
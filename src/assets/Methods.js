

export function setNodeStatus({d, pollId, nodeStatus, socket}) {
  try {
    console.log("setNodeStatus", d);
    nodeStatus[d.node] = d.status;
    socket.emit("nodeStatusUpdate", pollId, d);
    getNodeStatus(pollId, socket);
  } catch (error) {
    console.error("Error in setNodeStatus method:", error);
  }
}

export function getNodeStatus(pollId, socket) {
  try {
    socket.emit("getNodeStatus", pollId);
  } catch (error) {
    console.error("Error in getNodeStatus method:", error);
  }
}
let isCheckingNodes = false;

export function checkAdjacentNodes({
  nodeStatus,
  columns,
  totalQuestions,
  pollId,
  socket,
}) {
  if (isCheckingNodes) return; // Skip execution if already running
  isCheckingNodes = true;
  const processedNodes = new Set(); // Track processed nodes

  try {
    const Nodestatus2D = to2DArray(nodeStatus, columns);
    const updateNodeStatus = (adjacentIndex, newStatus) => {
      if (
        adjacentIndex.row >= 0 &&
        adjacentIndex.row < Nodestatus2D.length &&
        adjacentIndex.col >= 0 &&
        adjacentIndex.col < Nodestatus2D[adjacentIndex.row].length
      ) {
        const currentStatus = Nodestatus2D[adjacentIndex.row][adjacentIndex.col];

        if (!processedNodes.has(adjacentIndex.index) && ![1, 2, 3].includes(currentStatus)) {
          processedNodes.add(adjacentIndex.index); // Mark node as processed

          if (
            (newStatus === 4 && currentStatus === 5) ||
            (newStatus === 5 && currentStatus === 4)
          ) {
            setNodeStatus({
              d: { node: adjacentIndex.index, status: 6 },
              pollId,
              nodeStatus,
              socket,
            });
            Nodestatus2D[adjacentIndex.row][adjacentIndex.col] = 6;
          } else if (![4, 5, 6].includes(currentStatus)) {
            setNodeStatus({
              d: { node: adjacentIndex.index, status: newStatus },
              pollId,
              nodeStatus,
              socket,
            });
            Nodestatus2D[adjacentIndex.row][adjacentIndex.col] = newStatus;
          }
        }
      }
    };

    for (let i = 0; i < totalQuestions; i++) {
      if ([1, 2].includes(nodeStatus[i])) {
        const nodeRow = Math.floor(i / columns);
        const nodeCol = i % columns;
        const newStatus = nodeStatus[i] === 1 ? 4 : 5;

        if (nodeCol > 0) {
          updateNodeStatus({ row: nodeRow, col: nodeCol - 1, index: i - 1 }, newStatus);
        }
        if (nodeCol < columns - 1) {
          updateNodeStatus({ row: nodeRow, col: nodeCol + 1, index: i + 1 }, newStatus);
        }
        if (nodeRow > 0) {
          updateNodeStatus({ row: nodeRow - 1, col: nodeCol, index: i - columns }, newStatus);
        }
        if (nodeRow < Math.floor(totalQuestions / columns)) {
          updateNodeStatus({ row: nodeRow + 1, col: nodeCol, index: i + columns }, newStatus);
        }
      }
    }
  } catch (error) {
    console.error("Error in checkAdjacentNodes method:", error);
  }
  finally {
    isCheckingNodes = false; // Reset flag after execution
    getNodeStatus(pollId, socket);
  }

}


function to2DArray(arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

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
        break;

      case 4:
        if (showQuestionComponent) break;
        nodeElement.style.backgroundColor = "#9cca9cff";
        if (playerRole === "Player 1") {
          nodeElement.disabled = false;
          nodeElement.style.animation = "pulse 2s infinite";
        }
        break;

      case 5:
        if (showQuestionComponent) break;
        nodeElement.style.backgroundColor = "#ffc379ff";
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

      default:
        nodeElement.style.backgroundColor = "#f5f5f5ff";
        break;
    }
  }
}

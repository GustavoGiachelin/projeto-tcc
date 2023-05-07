import * as THREE from 'three'
import Maze, { MazeCell } from './Maze'
import Experience from '../Experience.js'

export default class HuntAndKill {
    private _maze: Array<MazeCell[]>
    private _scene: THREE.Scene
    private _experience: Experience
    private _sizes

    constructor(maze: Array<MazeCell[]>, scene: THREE.Scene, experience: Experience) {
        this._maze = maze
        this._scene = scene
        this._experience = experience
        this._sizes = this._experience.sizes
    }

    private getRandomCell(): MazeCell {
        const rowIndex = Math.floor(Math.random() * this._sizes.mazeSize);
        const colIndex = Math.floor(Math.random() * this._sizes.mazeSize);
        return this._maze[rowIndex][colIndex];
    }

    private getCell(x: number, y: number): MazeCell {
        return this._maze[x][y];
    }

    private async removeWall(cell1: MazeCell, cell2: MazeCell) {
        const rowDiff = cell1.x - cell2.x;
        const colDiff = cell1.y - cell2.y;
        const wallsToRemove = []

        if (rowDiff === 1) {
            wallsToRemove.push(cell1.walls.top);
            wallsToRemove.push(cell2.walls.bottom);
        } else if (rowDiff === -1) {
            wallsToRemove.push(cell1.walls.bottom);
            wallsToRemove.push(cell2.walls.top);
        } else if (colDiff === 1) {
            wallsToRemove.push(cell1.walls.left);
            wallsToRemove.push(cell2.walls.right);
        } else if (colDiff === -1) {
            wallsToRemove.push(cell1.walls.right);
            wallsToRemove.push(cell2.walls.left);
        }

        wallsToRemove.forEach(w => this._scene.remove(w))
        this._experience.renderer.update();
    }

    private getNeighborCells(cell: MazeCell): MazeCell[] {
        const neighbors: MazeCell[] = [];
    
        if (cell.y > 0) {
           neighbors.push(this.getCell(cell.x, cell.y - 1)); // cima
        }
        if (cell.x < this._experience.sizes.mazeSize - 1) {
            neighbors.push(this.getCell(cell.x + 1, cell.y)); // direita
        }
        if (cell.y < this._experience.sizes.mazeSize - 1) {
            neighbors.push(this.getCell(cell.x, cell.y + 1)); // baixo
        }
        if (cell.x > 0) {
            neighbors.push(this.getCell(cell.x - 1, cell.y)); // esquerda
        }
        return neighbors;
    }

    getUnvisitedNeighborCells(cell: MazeCell): MazeCell[] {
        const neighborCells = this.getNeighborCells(cell);
        return neighborCells.filter((neighbor) => !neighbor.visited);
    }

    getVisitedNeighborCells(cell: MazeCell): MazeCell[] {
        const neighborCells = this.getNeighborCells(cell);
        return neighborCells.filter((neighbor) => neighbor.visited);
      }

    generateMaze() {
        // Escolhe uma célula aleatória para começar.
        let currentCell = this.getRandomCell();
      
        while (currentCell) {
          // Marca a célula como visitada
          currentCell.visited = true;
      
          // Pega todas as células vizinhas que nao foram visitadas.
          const neighborCells = this.getUnvisitedNeighborCells(currentCell);
      
          if (neighborCells.length > 0) {
            // Escolhe um vizinho aleatória para criar uma passagem.
            const neighborCell = neighborCells[Math.floor(Math.random() * neighborCells.length)];
      
            // Remove a parede da célula atual e do vizinho.
            this.removeWall(currentCell, neighborCell);
      
            // O vizinho vira a célula atual
            currentCell = neighborCell;
          } else {
            // Se não houver mais vizinhos nao visitados, faz o "hunt"
            // Célula atual vira null
            currentCell = null;
      
            // Passa por todas as células
            for (let i = 0; i < this._sizes.mazeSize; i++) {
              for (let j = 0; j < this._sizes.mazeSize; j++) {
                const cell = this.getCell(i, j);
      
                if (!cell.visited) {
                  // Pega os vizinhos ja visitados da célula atual
                  const visitedNeighborCells = this.getVisitedNeighborCells(cell);
      
                  if (visitedNeighborCells.length > 0) {
                    // Escolhe um aleatório
                    const visitedNeighborCell = visitedNeighborCells[Math.floor(Math.random() * visitedNeighborCells.length)];
      
                    // Cria a passagem entre os dois
                    this.removeWall(cell, visitedNeighborCell);
      
                    // O vizinho vira a célula atual
                    currentCell = visitedNeighborCell;
      
                    // A célula atual é marcada como visitada
                    currentCell.visited = true;
      
                    // Sai do loop
                    break;
                  }
                }
              }
      
              // Se a celula atual nao for nula, sai do loop também.
              if (currentCell) {
                break;
              }
            }
          }
        }
      }
      
}
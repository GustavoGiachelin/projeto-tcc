import * as THREE from 'three'
import { MazeCell } from './Maze'
import Experience from '../Experience.js'

export default class RecursiveBacktracker {
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

    carvePassages(cell: MazeCell) {
        // Marca a célula como visitada
        cell.visited = true;
      
        // Pega todas as células vizinhas que nao foram visitadas.
        const neighborCells = this.getUnvisitedNeighborCells(cell);
      
        // Embaralha a lista
        neighborCells.sort(() => Math.random() - 0.5);
      
        // Recursively carve passages from each unvisited neighbor
        // Recursivamente cria as passagens de cada vizinho nao visitado
        for (const neighborCell of neighborCells) {
            if(!neighborCell.visited) {
                // Cria a passagem
                this.removeWall(cell, neighborCell);
                // Chama a função recursiva
                this.carvePassages(neighborCell);
            }
        }
    }

    generateMaze() {
        // Escolha uma célula aleatória para iniciar.
        const startCell = this.getRandomCell();

        // Chama a função recursiva.
        this.carvePassages(startCell);
    }
}
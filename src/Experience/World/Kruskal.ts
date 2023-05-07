import * as THREE from 'three'
import { MazeCell } from './Maze'
import Experience from '../Experience.js'

enum WallEnum {
    top,
    right,
    bottom,
    left,
}

export default class Kruskal {
    private _maze: Array<MazeCell[]>
    private _scene: THREE.Scene
    private _experience: Experience

    constructor(maze: Array<MazeCell[]>, scene: THREE.Scene, experience: Experience) {
        this._maze = maze
        this._scene = scene
        this._experience = experience
    }

    private getCell(x: number, y: number): MazeCell {
      return this._maze[x][y];
    }

    private async removeWall(cell: MazeCell, wall: WallEnum, removeFromScene: boolean): Promise<void> {
        let wallToRemove
        switch (wall) {
            case WallEnum.top:
                wallToRemove = cell.walls.top
                cell.walls.top = null
                break

            case WallEnum.right:
                wallToRemove = cell.walls.right
                cell.walls.right = null
                break

            case WallEnum.bottom:
                wallToRemove = cell.walls.bottom
                cell.walls.bottom = null
                break

            case WallEnum.left:
                wallToRemove = cell.walls.left
                cell.walls.left = null
                break
        }
        
        if(removeFromScene) {
            this._scene.remove(wallToRemove)
            this._experience.renderer.update();
        }

    }

    private getNeighborCells(cell: MazeCell): MazeCell[] {
        const neighbors: MazeCell[] = [];
    
        if (cell.y > 0) {
           neighbors.push(this.getCell(cell.x, cell.y - 1)); // top
        }
    
        if (cell.x < this._experience.sizes.mazeSize - 1) {
            neighbors.push(this.getCell(cell.x + 1, cell.y)); // right
        }
    
        if (cell.y < this._experience.sizes.mazeSize - 1) {
            neighbors.push(this.getCell(cell.x, cell.y + 1)); // bottom
        }
    
        if (cell.x > 0) {
            neighbors.push(this.getCell(cell.x - 1, cell.y)); // left
        }
    
        return neighbors;
    }

    generateMaze() {
        const edges: [MazeCell, MazeCell][] = [];

        // Adiciona todas as bordas em uma lista
        for (let i = 0; i < this._experience.sizes.mazeSize; i++) {
            for (let j = 0; j < this._experience.sizes.mazeSize; j++) {
                const cell = this.getCell(i, j);

                const neighborCells = this.getNeighborCells(cell);
                for (const neighbor of neighborCells) {
                    edges.push([cell, neighbor]);
                }
            }
        }

        // Embaralha os cantos aleatóriamente.
        for (let i = edges.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [edges[i], edges[j]] = [edges[j], edges[i]];
        }

        // Executa o algoritmo de kruskal
        const sets: Set<MazeCell>[] = [];
        for (let i = 0; i < this._experience.sizes.mazeSize; i++) {
            for (let j = 0; j < this._experience.sizes.mazeSize; j++) {
                const cell = this.getCell(i, j);
                sets.push(new Set([cell]));
            }
        }

        for (const [cell1, cell2] of edges) {
            const set1 = sets.find((set) => set.has(cell1));
            const set2 = sets.find((set) => set.has(cell2));

            if (set1 !== set2) {
                const newSet = new Set([...set1, ...set2]);
                sets.splice(sets.indexOf(set1), 1);
                sets.splice(sets.indexOf(set2), 1);
                sets.push(newSet);

                if (cell1.x < cell2.x) {
                    this.removeWall(cell1, WallEnum.bottom, true) // remove bottom wall
                    this.removeWall(cell2, WallEnum.top, false) // remove top wall
                } else if (cell1.x > cell2.x) {
                    this.removeWall(cell1, WallEnum.top, true); // remove top wall
                    this.removeWall(cell2, WallEnum.bottom, false); // remove bottom wall
                } else if (cell1.y < cell2.y) {
                    this.removeWall(cell1, WallEnum.right, true) // remove right wall
                    this.removeWall(cell2, WallEnum.left, false) // remove left wall
                } else if (cell1.y > cell2.y) {
                    this.removeWall(cell1, WallEnum.left, true) // remove left wall
                    this.removeWall(cell2, WallEnum.right, false) // remove right wall
                }
            }
        }
    }
}
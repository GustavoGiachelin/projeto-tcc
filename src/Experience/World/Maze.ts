import * as THREE from 'three'
import Experience from '../Experience.js'
import Debug from '../Utils/Debug.js'
import Resources from '../Utils/Resources.js'
import Time from '../Utils/Time.js'
import Kruskal from './Kruskal.js'
import RecursiveBacktracker from './RecursiveBacktracker.js'
import HuntAndKill from './HuntAndKill.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as CANNON from 'cannon-es'
import Client, { DataModel } from '../../client/client.js'

export default class Maze
{
    private POS_INCREMENT = 2

    private experience: Experience
    private scene: THREE.Scene
    private resources: Resources
    private time: Time
    private debug: Debug
    private debugFolder
    private sizes
    private physics: CANNON.World;
    private wallModel;
    private wallModelRotated;
    private groundModel;
    private mazeCells: Array<MazeCell[]> = []
    private trophy;
    private BASE_WALL_POS_Y = 1.05
    private BASE_WALL_POS_Z = 1
    private BASE_ROTATED_WALL_POS_X = 1

    private trophy_count = 0
    private _startTimer
    private _endTimer
    private _model: DataModel
    private _client = new Client()

    constructor()
    {
        this.experience = new Experience()
        this.physics = this.experience.physics
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this._model = {
            kruskalTime: 0,
            rbTime: 0,
            hnkTime: 0
        }
        
        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Maze')
        }

        this.resources.items.gradient5.minFilter = THREE.NearestFilter
        this.resources.items.gradient5.magFilter = THREE.NearestFilter
        this.resources.items.gradient5.generateMipmaps = false

        // Resource
        // const wall = this.resources.items.wallModel
        // const ground = this.resources.items.groundModel
        const materialWall = new THREE.MeshToonMaterial({
            color: 0x392a3d,
        })
        materialWall.gradientMap = this.resources.items.gradient5
        
        // this.wallModel = wall.scene
        this.wallModel = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 2, 2.19),
            materialWall
        ); 
        this.wallModel.scale.set(1, 1, 1)
        this.wallModel.rotation.y = Math.PI * -0.5
        
        this.wallModelRotated = this.wallModel.clone()
        this.wallModelRotated.rotation.y = 0
        

        // this.groundModel = ground.scene
        const materialGround = new THREE.MeshToonMaterial({
            color: 0x287334,
        })
        materialGround.gradientMap = this.resources.items.gradient5
        this.groundModel = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 0.19),
            materialGround
        );
        this.groundModel.rotation.x = Math.PI * -0.5
        this.groundModel.scale.set(1, 1, 1)
        
        this.wallModel.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
                child.material.metalness = 0
                child.material.roughness = 5
            }
        })
        this.groundModel.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
                child.material.metalness = 0
                child.material.roughness = 5
            }
        })

    }
    start() {
        this.generateKruskal()
        this.setHtmlName("Kruskal")
    }

    finish() {
        const tempoK = document.getElementById('tempo-kruskal');
        const tempoRB = document.getElementById('tempo-rb');
        const tempoHK = document.getElementById('tempo-hk');
        const timeK = document.getElementById('time-kruskal');
        const timeRB = document.getElementById('time-rb');
        const timeHK = document.getElementById('time-hk');

        const calcTimeK = this.time.millisecondsToMinuteAndSecond(this._model.kruskalTime)
        const calcTimeRB = this.time.millisecondsToMinuteAndSecond(this._model.rbTime)
        const calcTimeHK = this.time.millisecondsToMinuteAndSecond(this._model.hnkTime)
        
        tempoK.textContent = calcTimeK
        timeK.textContent = calcTimeK
        tempoRB.textContent = calcTimeRB
        timeRB.textContent = calcTimeRB
        tempoHK.textContent = calcTimeHK
        timeHK.textContent = calcTimeHK
        
        document.getElementById('overlay').style.display = "block"
        document.getElementById('result').style.display = "block"
    }

    next() {
        if(this.trophy_count == 1) {
            this._model.kruskalTime = this._endTimer - this._startTimer
            this.generateRB()
            this.setHtmlName("Recursive Backtracker")
        } else if (this.trophy_count == 2) {
            this._model.rbTime = this._endTimer - this._startTimer
            this.generateHnK()
            this.setHtmlName("Hunt and Kill")
        } else {
            this._model.hnkTime = this._endTimer - this._startTimer
            this._client.save(this.formatModel(this._model))
            this.finish()
            this.setHtmlName("")
        }
    }

    createTopAndLeftWalls(i: number, j: number): void {
        const currentCell = this.mazeCells[i][j]
        const currentGround = currentCell.ground
        
        // Cima
        const top = this.wallModel.clone()
        top.name = "wall"
        top.position.set(currentGround.position.x, this.BASE_WALL_POS_Y, currentGround.position.z - this.BASE_WALL_POS_Z)
        this.scene.add(top)
        currentCell.walls.top = top

        
        // Esquerda
        const left = this.wallModelRotated.clone()
        left.name = "wall"
        left.position.set(currentGround.position.x - this.BASE_ROTATED_WALL_POS_X, this.BASE_WALL_POS_Y, currentGround.position.z)
        this.scene.add(left)
        currentCell.walls.left = left
    }

    createBottomAndRightWalls(i: number, j: number): void {
        const currentCell = this.mazeCells[i][j]
        const currentGround = currentCell.ground

        // Baixo
        if(i == this.sizes.mazeSize - 1) {
            const bottom = this.wallModel.clone()
            bottom.position.set(currentGround.position.x, this.BASE_WALL_POS_Y, currentGround.position.z - this.BASE_WALL_POS_Z + this.POS_INCREMENT)
            currentCell.walls.bottom = bottom
            bottom.name = "wall"
            this.scene.add(bottom)
        } else {
            const cellBellow = this.mazeCells[i + 1][j]
            currentCell.walls.bottom = cellBellow.walls.top
        }

        // Direita
        if(j == this.sizes.mazeSize - 1) {
            const right = this.wallModelRotated.clone()
            right.position.set(currentGround.position.x - this.BASE_ROTATED_WALL_POS_X + this.POS_INCREMENT, this.BASE_WALL_POS_Y, currentGround.position.z)
            currentCell.walls.right = right
            right.name = "wall"
            this.scene.add(right)
        } else {
            const cellToRight = this.mazeCells[i][j + 1]
            currentCell.walls.right = cellToRight.walls.left
        }
    }

    setModel()
    {
        const groundPosY = 0
        let groundPosX = 1
        let groundPosZ = 1
        const groundGroup = new THREE.Group()
        groundGroup.name = "ground"
        for(let i = 0; i < this.sizes.mazeSize; i++){
            this.mazeCells[i] = []
            for(let j = 0; j < this.sizes.mazeSize; j++) {
                const ground = this.groundModel.clone()
                groundGroup.add(ground)
                ground.position.set(groundPosX, groundPosY, groundPosZ)
                this.mazeCells[i].push({ ground: ground, x: i, y: j,  walls: {top: null, right: null, bottom: null, left: null}, visited: false })
                groundPosX += this.POS_INCREMENT
            }
            groundPosX = 1
            groundPosZ += this.POS_INCREMENT
        }

        groundGroup.position.set(0,0,0)
        this.scene.add(groundGroup)

        
        for(let i = 0; i < this.sizes.mazeSize; i++){
            for(let j = 0; j < this.sizes.mazeSize; j++) { 
                this.createTopAndLeftWalls(i, j)
            }
        }
        for(let i = this.sizes.mazeSize - 1; i > -1; i--){
            for(let j = this.sizes.mazeSize - 1; j > -1; j--) { 
                this.createBottomAndRightWalls(i, j)
            }
        }
    }

    createStartCell() {
        const ground = this.groundModel.clone()
        ground.position.set(-1, 0, 1)
        this.scene.add(ground)

        const top = this.wallModel.clone()
        top.name = "wall"
        top.position.set(-1, this.BASE_WALL_POS_Y, 0)
        this.scene.add(top)
        
        const bottom = this.wallModel.clone()
        bottom.name = "wall"
        bottom.position.set(-1, this.BASE_WALL_POS_Y, 2)
        this.scene.add(bottom)
        
        const left = this.wallModelRotated.clone()
        left.name = "wall"
        left.position.set(-2, this.BASE_WALL_POS_Y, 1)
        this.scene.add(left)
        
        const cellLeftWall = this.mazeCells[0][0].walls.left
        this.scene.remove(cellLeftWall)
    }

    createEndCell() {
        const ground = this.groundModel.clone()
        ground.position.set(21, 0, 19)
        this.scene.add(ground)
        
        const top = this.wallModel.clone()
        top.name = "wall"
        top.position.set(21, this.BASE_WALL_POS_Y, 18)
        this.scene.add(top)
        
        const bottom = this.wallModel.clone()
        bottom.name = "wall"
        bottom.position.set(21, this.BASE_WALL_POS_Y, 20)
        this.scene.add(bottom)
        
        const right = this.wallModelRotated.clone()
        right.name = "wall"
        right.position.set(22, this.BASE_WALL_POS_Y, 19)
        this.scene.add(right)

        const cellRightWall = this.mazeCells[this.sizes.mazeSize - 1][this.sizes.mazeSize - 1].walls.right
        this.scene.remove(cellRightWall)

        this.trophy = this.resources.items.trophyModel.scene
        this.trophy.scale.set(0.5, 0.5, 0.5)
        this.trophy.position.set(21, 0, 19)
        this.scene.add(this.trophy)
    }
    
    generateKruskal() {
        this.setModel()
        const kruskal = new Kruskal(this.mazeCells, this.scene, this.experience)
        kruskal.generateMaze()
        this.createStartCell()
        this.createEndCell()
        this.createPhy() 
    }
    
    generateRB() {
        this.experience.cleanScene()
        this.setModel()
        const rb = new RecursiveBacktracker(this.mazeCells, this.scene, this.experience)
        rb.generateMaze()
        this.createStartCell()
        this.createEndCell()
        this.createPhy() 
    }
    
    generateHnK() {
        this.experience.cleanScene()
        this.setModel()
        const hNk = new HuntAndKill(this.mazeCells, this.scene, this.experience)
        hNk.generateMaze()
        this.createStartCell()
        this.createEndCell()
        this.createPhy() 
    }

    createPhy() {
        const walls = this.scene.children.filter(x => x.name === "wall")
        for(const wall of walls) {
            const phyWall = new CANNON.Body({
                type: CANNON.Body.STATIC,
                collisionResponse: true,
                shape: new CANNON.Box(new CANNON.Vec3(0.25, 1, 1)), 
            })
            phyWall.position.set(wall.position.x, wall.position.y, wall.position.z)
            if(wall.rotation.y != 0) {
                phyWall.quaternion.setFromEuler(0, -Math.PI / 2, 0)

            }
            this.physics.addBody(phyWall)
        }
    }

    update()
    {
        this.checkStartMove()
        this.checkForVictory()
    }

    checkStartMove() {
        const cameraPos = this.experience.camera.phySphere.position
        if((cameraPos.x != 1 || cameraPos.z != 1) && !this._startTimer) {
            this._startTimer = performance.now()
        }
    }

    checkForVictory() {
        const cameraPos = new THREE.Vector3(this.experience.camera.phySphere.position.x, 0, this.experience.camera.phySphere.position.z)
        
        if(this.trophy && cameraPos.distanceTo(this.trophy.position) < 0.5) {
            this._endTimer = performance.now()
            this.experience.camera.phySphere.position.set(1, 1, 1)
            this.experience.camera.camera3d.position.set(1, 1, 1)
            this.trophy_count++
            this.next()
            this.experience.camera.controls.lock()
            this._startTimer = null
            this._endTimer = null
        }
    }

    formatModel(model: DataModel): DataModel {
        return {
            hnkTime: this.time.millisecondsToSeconds(model.hnkTime),
            kruskalTime: this.time.millisecondsToSeconds(model.kruskalTime),
            rbTime: this.time.millisecondsToSeconds(model.rbTime)
        } as DataModel
    }

    setHtmlName(name: string): void {
        document.getElementById("current-alg").textContent = name 
    }
}

export interface MazeCell {
    ground: THREE.Object3D
    x: number
    y: number
    walls: Walls
    visited: boolean
}

export interface Walls {
    top: THREE.Object3D
    right: THREE.Object3D
    bottom: THREE.Object3D
    left: THREE.Object3D
}
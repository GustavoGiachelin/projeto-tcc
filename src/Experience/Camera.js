import * as THREE from 'three'
import Experience from './Experience.js'
import * as CANNON from 'cannon-es'
import { PointerLockControlsCannon } from './PointerLockControlsCannon.js';

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.debug = this.experience.debug
        this.background = null
        this.physics = this.experience.physics
        
        this.setInstance()
        this.setControls()
    }
    
    setInstance()
    {
        //Physics
        this.phySphere = new CANNON.Body({
            shape: new CANNON.Sphere(0.15),
            mass: 5,
            material: this.experience.physicsMaterial
        })
        this.phySphere.position.set(1, 1, 1)
        this.phySphere.linearDamping = 0.99
        this.physics.addBody(this.phySphere)


        this.camera3d = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 1000)
        this.camera3d.position.set(1, 1, 1)
        this.camera3d.lookAt(new THREE.Vector3(1, 1, 0))
        
        this.camera2d = new THREE.OrthographicCamera(- this.sizes.orthographicOffset * this.sizes.aspectRatio,
            (this.sizes.orthographicSize + this.sizes.orthographicOffset) * this.sizes.aspectRatio ,
            this.sizes.orthographicOffset,
            -this.sizes.orthographicSize - this.sizes.orthographicOffset,
            1,
            4 
        )
        this.camera2d.position.set(0, 3.5, 0)
        this.camera2d.lookAt(new THREE.Vector3(0, 1, 0))

        this.scene.add(this.camera2d)
        this.scene.add(this.camera3d)
        
        this.instance = this.camera3d
        
    }

    setControls()
    {
        this.controls = new PointerLockControlsCannon(this.camera3d, this.phySphere)
        this.scene.add(this.controls.getObject())
  
        this.controls.addEventListener('lock', () => {
            this.controls.enabled = true
        })
  
        this.controls.addEventListener('unlock', () => {
            this.controls.enabled = false
        })
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        this.controls.update(this.experience.time.delta)
    }

    changeCamera() {
        if(!this.background) {
            this.background = this.scene.background
        }
        this.camera2d.position.set(-this.sizes.mazeSize, 3.5, 0)
        if(this.instance === this.camera3d) {
            this.instance = this.camera2d
            this.scene.background = null
        } else {
            this.instance = this.camera3d
            this.scene.background = this.background
        }
    }
}
import * as THREE from 'three';

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.ts'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

let instance = null

export default class Experience
{
    constructor(_canvas)
    {
        if(instance)
        {
            return instance
        }
        instance = this
        
        window.experience = this

        this.canvas = _canvas

        this.debug = new Debug()
        this.physics = new CANNON.World({gravity: new CANNON.Vec3(0,0,0)})
        this.physicsMaterial = new CANNON.Material('physics')
        const physics_physics = new CANNON.ContactMaterial(this.physicsMaterial, this.physicsMaterial, {
            friction: 0.8,
            restitution: 0.8,
          })
  
        this.physics.addContactMaterial(physics_physics)

        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()
        this.keyboard = []
        const phyGround = new CANNON.Body({
                shape: new CANNON.Plane(),
                material: this.physicsMaterial,
                mass: 0
        })
        phyGround.position.set(0, 0.0, 5)
        phyGround.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        this.physics.addBody(phyGround)

        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        this.time.on('tick', () =>
        {
            this.processKeyboard()
            this.update()
        })
    }

    async processKeyboard() {
        
        if(this.keyboard['c']) {
            this.changeCamera()
        }
    }

    cleanScene() {
        const phyBodies = this.physics.bodies.filter(x => x.type == 2)
        phyBodies.forEach(b => {
            this.physics.removeBody(b)
        })
        const threeObjs = this.scene.children.filter(x => x.name == "wall" || x.name == "ground")
        threeObjs.forEach(o => {
            this.scene.remove(o)
        })
        this.renderer.update()
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
    }

    update()
    {
        if(this.camera.controls.enabled) {

            this.physics.fixedStep(1/60,this.time.delta)
        }
        this.camera.update()
        this.world.update()
        this.renderer.update()
    }

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

        this.scene.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                for(const key in child.material)
                {
                    const value = child.material[key]

                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if(this.debug.active)
            this.debug.ui.destroy()
    }

    changeCamera() {
        this.camera.changeCamera()
        this.renderer.update()
    }
}
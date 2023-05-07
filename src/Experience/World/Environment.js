import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        
        this.setSunLight()
        this.setAmbientLight()
        this.setEnvironmentMap()
    }

    setGround() {
        const ground = this.resources.items.planeModel
        const groundModel = ground.scene
        groundModel.scale.set(50, 50, 50)
        groundModel.position.set(9.5, -8.5, 5.5)
        this.scene.add(groundModel)
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);
    }

    setSunLight()
    {
        this.sunLight = new THREE.PointLight('#ffffff', 0.43)
        this.sunLight.castShadow = false
        this.sunLight.shadow.camera.far = 15
        this.sunLight.shadow.mapSize.set(1024, 1024)
        this.sunLight.shadow.normalBias = 0.05
        this.sunLight.position.set(10.668,0.8352, -1.25)
        this.scene.add(this.sunLight)
    }

    setEnvironmentMap()
    {
        this.environmentMap = {}
        this.environmentMap.intensity = 0.4
        this.environmentMap.texture = this.resources.items.environmentMapTexture
        this.environmentMap.texture.encoding = THREE.sRGBEncoding
        
        this.scene.environment = this.environmentMap.texture
        this.scene.background = this.environmentMap.texture

        this.environmentMap.updateMaterials = () =>
        {
            this.scene.traverse((child) =>
            {
                if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
                {
                    child.material.envMap = this.environmentMap.texture
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                }
            })
        }
        this.environmentMap.updateMaterials()
    }
}
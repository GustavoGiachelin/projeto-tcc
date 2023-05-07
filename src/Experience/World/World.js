import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import Maze from './Maze.ts'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.maze = new Maze()
            this.environment = new Environment()
        })
    }

    update()
    {
        if(this.maze)
            this.maze.update()
    }
}
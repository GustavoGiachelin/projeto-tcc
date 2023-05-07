import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter
{
    constructor()
    {
        super()

        // Setup
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.aspectRatio = this.width / this.height
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)
        this.mazeSize = 10
        this.orthographicSize = this.mazeSize * 2
        this.orthographicOffset = 2

        // Resize event
        window.addEventListener('resize', () =>
        {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)

            this.trigger('resize')
        })
    }
}
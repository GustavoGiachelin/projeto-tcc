import EventEmitter from './EventEmitter.js'

export default class Time extends EventEmitter
{
    constructor()
    {
        super()

        // Setup
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16

        window.requestAnimationFrame(() =>
        {
            this.tick()
        })
    }

    tick()
    {
        const currentTime = Date.now()
        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.current - this.start

        this.trigger('tick')

        window.requestAnimationFrame(() =>
        {
            this.tick()
        })
    }

    millisecondsToSeconds(elapsed) {
        return Math.floor((elapsed/1000));
    }

    millisecondsToMinuteAndSecond(elapsed) {
        let min = Math.floor((elapsed/1000/60) << 0);
        let sec = Math.floor((elapsed/1000) % 60);
        min = min < 10 ? '0' + min : min.toString()
        sec = sec < 10 ? '0' + sec : sec.toString()
        return min + "m " + sec + "s"
    }
}
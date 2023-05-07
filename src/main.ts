import './style.css'

import Experience from './Experience/Experience.js'

const experience = new Experience(document.querySelector('canvas.webgl'))
// const kruskal = document.getElementById('generateKruskal')
// kruskal.addEventListener("click", function() {
//     experience.world.maze.generateKruskal()
//     experience.camera.controls.lock()
// })

// const rb = document.getElementById('generateRB')
// rb.addEventListener("click", function() {
//     experience.world.maze.generateRB()
//     experience.camera.controls.lock()
// })
// const hNk = document.getElementById('generateHnK')
// hNk.addEventListener("click", function() {
//     experience.world.maze.generateRB()
//     experience.camera.controls.lock()
// })

const play = document.getElementById('play')
play.addEventListener("click", function() {
    experience.camera.controls.lock()
    document.getElementById('overlay').style.display = "none";
    document.getElementById('instructions').style.display = "none";
    experience.world.maze.start();
})

addEventListener('keypress', (e) => {
    if(e.key == "c") {
        experience.changeCamera()
    }
})
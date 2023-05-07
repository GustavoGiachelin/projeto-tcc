export default [
    {
        name: 'environmentMapTexture',
        type: 'cubeTexture',
        path:
        [
            'textures/environmentMap/px.jpg',
            'textures/environmentMap/nx.jpg',
            'textures/environmentMap/py.jpg',
            'textures/environmentMap/ny.jpg',
            'textures/environmentMap/pz.jpg',
            'textures/environmentMap/nz.jpg'
        ]
    },
    {
        name: 'gradient5',
        type: 'texture',
        path: 'textures/gradients/5.jpg'
    },
    {
        name: 'wallModel',
        type: 'gltfModel',
        path: 'models/Wall/Wall.glb'
    },
    {
        name: 'groundModel',
        type: 'gltfModel',
        path: 'models/Ground/Ground.glb'
    },
    {
        name: 'planeModel',
        type: 'gltfModel',
        path: 'models/Ground/plane.glb'
    },
    {
        name: 'trophyModel',
        type: 'gltfModel',
        path: 'models/Trophy/trophy.glb'
    },
    {
        name: 'font',
        type: 'font',
        path: 'fonts/helvetiker_bold.typeface.json',
    }
]
// Configuración inicial
const canvas = document.createElement('canvas');
const context = canvas.getContext('webgl', { xrCompatible: true });
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, context });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Luz ambiental
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// Controlador de modelos
const loader = new THREE.GLTFLoader();
let currentModel = null;

// Función para cargar y colocar modelos
function loadModel(modelPath, position) {
    loader.load(`models/${modelPath}`, (gltf) => {
        if (currentModel) scene.remove(currentModel);
        currentModel = gltf.scene;
        currentModel.position.copy(position);
        currentModel.scale.set(0.5, 0.5, 0.5); // Escala inicial
        scene.add(currentModel);
    });
}

// Detección de superficies y colocación
let hitTestSource = null;
let hitTestSourceRequested = false;

renderer.xr.addEventListener('sessionstart', () => {
    navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] }).then((session) => {
        session.requestReferenceSpace('local').then((referenceSpace) => {
            renderer.xr.setReferenceSpace(referenceSpace);
        });
        session.requestHitTestSource({ space: renderer.xr.getReferenceSpace() }).then((source) => {
            hitTestSource = source;
        });
    });
});

function detectSurface(frame) {
    const session = renderer.xr.getSession();
    if (!hitTestSource || !session) return null;

    const viewerPose = frame.getViewerPose(renderer.xr.getReferenceSpace());
    if (viewerPose) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(renderer.xr.getReferenceSpace());
            return new THREE.Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
        }
    }
    return null;
}

// Interacción de usuario
document.querySelectorAll('.product').forEach((product) => {
    product.addEventListener('click', () => {
        const modelPath = product.getAttribute('data-model');
        const initialPosition = new THREE.Vector3(0, 0, -1); // Coloca el modelo frente al usuario
        loadModel(modelPath, initialPosition);
    });
});

// Gestos táctiles
let touchStart = null;
canvas.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
        touchStart = event.touches[0];
    }
});

canvas.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1 && touchStart && currentModel) {
        const touchMove = event.touches[0];
        const dx = touchMove.clientX - touchStart.clientX;
        const dy = touchMove.clientY - touchStart.clientY;
        currentModel.rotation.y += dx * 0.01; // Rotar
        currentModel.scale.multiplyScalar(1 + dy * 0.001); // Escalar
        touchStart = touchMove;
    }
});

// Animación y renderizado
function animate() {
    renderer.setAnimationLoop((frame) => {
        const surfacePosition = detectSurface(frame);
        if (surfacePosition && currentModel) {
            currentModel.position.copy(surfacePosition);
        }
        renderer.render(scene, camera);
    });
}
animate();

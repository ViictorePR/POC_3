// Configuración inicial
const canvas = document.createElement('canvas');
const context = canvas.getContext('webgl', { xrCompatible: true });
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, context });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true;

// Crear escena y cámara
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Luz ambiental
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// Controlador de modelos
const loader = new THREE.GLTFLoader();
let currentModel = null;

// Función para cargar modelos
function loadModel(modelPath, position) {
    loader.load(`models/${modelPath}`, (gltf) => {
        if (currentModel) scene.remove(currentModel);
        currentModel = gltf.scene;
        currentModel.position.copy(position);
        currentModel.scale.set(0.3, 0.3, 0.3);
        scene.add(currentModel);
    });
}

// Detectar superficies
let hitTestSource = null;
let hitPosition = new THREE.Vector3();

function detectSurface(frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();
    if (!hitTestSource) {
        session.requestHitTestSource({ space: referenceSpace }).then((source) => {
            hitTestSource = source;
        });
    }
    if (hitTestSource) {
        const viewerPose = frame.getViewerPose(referenceSpace);
        if (viewerPose) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const pose = hitTestResults[0].getPose(referenceSpace);
                hitPosition.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
            }
        }
    }
}

// Interacción con el menú
document.querySelectorAll('.product').forEach((product) => {
    product.addEventListener('click', () => {
        const modelPath = product.getAttribute('data-model');
        loadModel(modelPath, hitPosition);
    });
});

// Iniciar AR
function startAR() {
    if (navigator.xr) {
        navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] })
            .then((session) => {
                renderer.xr.setSession(session);
                renderer.setAnimationLoop(render);
            })
            .catch((err) => console.error("Error al iniciar WebXR:", err));
    } else {
        alert("WebXR no es compatible con este dispositivo o navegador.");
    }
}

document.getElementById('startAR').addEventListener('click', startAR);


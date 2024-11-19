// Configuración inicial
const canvas = document.getElementById('arCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

// Luz básica
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Modelos (simulados)
const models = {
    model1: new THREE.BoxGeometry(1, 1, 1),
    model2: new THREE.ConeGeometry(0.5, 1, 32),
    model3: new THREE.SphereGeometry(0.5, 32, 32)
};

// Material estándar
const material = new THREE.MeshStandardMaterial({ color: 0x0078d4 });

// Colocación del modelo seleccionado
function placeModel(modelKey) {
    const geometry = models[modelKey];
    if (geometry) {
        const model = new THREE.Mesh(geometry, material);
        model.position.set(0, 0, -2); // Simula colocarlo en una superficie
        scene.add(model);
    }
}

// Detección de interacción con el menú
document.querySelectorAll('.product').forEach(product => {
    product.addEventListener('click', () => {
        const modelKey = product.getAttribute('data-model');
        placeModel(modelKey);
    });
});

// Animación
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

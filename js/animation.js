const THREE_VERSION_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/+esm";
let THREE = globalThis.THREE;
let OrbitControlsCtor = globalThis.OrbitControls;

async function ensureThreeLoaded() {
    if (!THREE) {
        THREE = await import(THREE_VERSION_URL);
        globalThis.THREE = THREE;
    }

    return THREE;
}
const _threePromise = ensureThreeLoaded();

async function init() {
    const THREE = await _threePromise;
    
    const canvas = document.querySelector('#bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create Wireframe Geometry (The "Technical" core)
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x64ffda, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Create Particles (The Plexus feel)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0x64ffda,
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Interaction State
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) / 100;
        mouseY = (event.clientY - window.innerHeight / 2) / 100;
    });

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);

        // Smooth mouse movement (Lerp)
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        sphere.rotation.y += 0.002;
        sphere.rotation.x += 0.001;
        
        // Parallax effect
        sphere.position.x = targetX * 0.5;
        sphere.position.y = -targetY * 0.5;

        // Dynamic Twinkle effect
        const time = Date.now() * 0.001;
        particlesMaterial.opacity = 0.6 + Math.sin(time * 2) * 0.2;
        particlesMaterial.size = 0.005 + Math.sin(time * 3) * 0.001;

        particlesMesh.rotation.y = -targetX * 0.1;
        particlesMesh.rotation.x = -targetY * 0.1;

        renderer.render(scene, camera);
    }

    animate();
}

init().catch(console.error);

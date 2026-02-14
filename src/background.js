import * as THREE from 'three';

let scene, camera, renderer, particlesMesh, mainShape;
let shapes = [];

export function initBackground() {
    const canvas = document.getElementById('bg');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(30);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 8000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 150;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add main torus
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xff00ff,
        wireframe: true,
        emissive: 0xff00ff,
        emissiveIntensity: 0.5
    });
    mainShape = new THREE.Mesh(geometry, material);
    scene.add(mainShape);

    // Lights
    const pointLight = new THREE.PointLight(0x00f5ff, 2);
    pointLight.position.set(20, 20, 20);
    const pointLight2 = new THREE.PointLight(0xff00ff, 2);
    pointLight2.position.set(-20, -20, 20);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(pointLight, pointLight2, ambientLight);

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        mainShape.rotation.x += 0.002;
        mainShape.rotation.y += 0.006;
        mainShape.rotation.z += 0.002;

        particlesMesh.rotation.y += 0.0008;
        particlesMesh.rotation.x += 0.0003;

        // Animate additional shapes
        shapes.forEach(shape => {
            shape.rotation.x += 0.01;
            shape.rotation.y += 0.01;
            shape.scale.x += shape.userData.scaleSpeed;
            shape.scale.y += shape.userData.scaleSpeed;
            shape.scale.z += shape.userData.scaleSpeed;
            
            if (shape.scale.x > 2 || shape.scale.x < 0.5) {
                shape.userData.scaleSpeed *= -1;
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Trigger animation on AI response
export function triggerResponseAnimation() {
    // Remove old shapes
    shapes.forEach(shape => scene.remove(shape));
    shapes = [];

    // Create random animated shapes
    const shapeTypes = [
        () => new THREE.OctahedronGeometry(3),
        () => new THREE.IcosahedronGeometry(3),
        () => new THREE.TetrahedronGeometry(3),
        () => new THREE.TorusKnotGeometry(2, 0.5, 100, 16)
    ];

    for (let i = 0; i < 3; i++) {
        const geometry = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]();
        const material = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            wireframe: true,
            emissive: Math.random() * 0xffffff,
            emissiveIntensity: 0.5
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20
        );
        mesh.userData.scaleSpeed = 0.01;
        
        scene.add(mesh);
        shapes.push(mesh);

        // Remove after 3 seconds
        setTimeout(() => {
            scene.remove(mesh);
            shapes = shapes.filter(s => s !== mesh);
        }, 3000);
    }

    // Particle burst effect
    const positions = particlesMesh.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (Math.random() - 0.5) * 5;
        positions[i + 1] += (Math.random() - 0.5) * 5;
        positions[i + 2] += (Math.random() - 0.5) * 5;
    }
    particlesMesh.geometry.attributes.position.needsUpdate = true;
}

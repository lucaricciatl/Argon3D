import * as THREE from 'three';

 // Application State
let currentUser = null;
let currentSection = 'generate';
let generationType = 'text';
let userModels = new Map();
let currentModel = null;
let viewer3D = null;
let scene, camera, renderer, controls;

// Sample data
const sampleModels = [
    {
        id: "model_001",
        name: "Geometric Cube",
        type: "text-generated",
        prompt: "A colorful geometric cube with rounded edges",
        format: "GLB",
        vertices: 8,
        faces: 12,
        size: "256KB",
        preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGRjZBMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0xNTAgNTBMMTgwIDMwTDE4MCAxMzBMMTUwIDE1MFYxNTBaIiBmaWxsPSIjRkY4QTAwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNTAgNTBMODAgMzBMMTgwIDMwTDE1MCA1MEg1MFoiIGZpbGw9IiNGRkI1MDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg=="
    },
    {
        id: "model_002", 
        name: "Modern Chair",
        type: "text-generated",
        prompt: "A sleek modern office chair in blue",
        format: "OBJ",
        vertices: 1024,
        faces: 2048,
        size: "1.2MB",
        preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjYwIiB5PSI0MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9IiM0Mjg1RjQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxyZWN0IHg9IjkwIiB5PSIxMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzM0NzBGMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTcwIiByPSIxNSIgZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+"
    },
    {
        id: "model_003",
        name: "Cartoon Tree",
        type: "image-generated",
        prompt: "tree.jpg",
        format: "STL",
        vertices: 512,
        faces: 1024,
        size: "800KB",
        preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjkwIiB5PSIxMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzg4NjUzMyIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0iIzRDQUY1MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iNzAiIHI9IjMwIiBmaWxsPSIjNjZCQjZBIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4="
    }
];

const textPrompts = [
    "A futuristic robot with glowing blue eyes",
    "A medieval castle with tall towers", 
    "A sports car with sleek design",
    "A fantasy dragon with spread wings",
    "A modern smartphone with curved screen",
    "A vintage gramophone with golden details",
    "A cozy wooden cabin in the forest",
    "A space station with solar panels",
    "A treasure chest filled with gold coins",
    "A lighthouse on a rocky cliff"
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthState();
});

function initializeApp() {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        updateThemeButton(savedTheme);
    }
    
    // Initialize prompt suggestions
    renderPromptSuggestions();
    
    // Initialize 3D viewer
    setTimeout(() => {
        init3DViewer();
    }, 100);
}

function setupEventListeners() {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    
    // Auth forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // File upload
    const imageFile = document.getElementById('image-file');
    if (imageFile) {
        imageFile.addEventListener('change', handleFileUpload);
    }
    
    // Modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Navigation buttons - Fix for landing page
    setupNavigationButtons();
    
    // Generation form
    setupGenerationForm();
}

function setupNavigationButtons() {
    // Landing page navigation
    const getStartedBtns = document.querySelectorAll('.hero-actions .btn--primary');
    const loginBtns = document.querySelectorAll('.nav-actions .btn--outline');
    const registerBtns = document.querySelectorAll('.nav-actions .btn--primary');
    const demoBtn = document.querySelector('.hero-actions .btn--outline');
    
    // Register buttons
    getStartedBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });
    });
    
    registerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });
    });
    
    // Login buttons
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    });
    
    // Demo button
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showDemo();
        });
    }
    
    // Sidebar navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.textContent.trim().toLowerCase().replace('🎨 ', '').replace('📚 ', '').replace('👁️ ', '');
            showSection(section);
        });
    });
    
    // Logout button
    const logoutBtn = document.querySelector('.nav-user .btn--outline');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

function setupGenerationForm() {
    // Option cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const isTextCard = card.querySelector('h3').textContent.includes('Text');
            selectGenerationType(isTextCard ? 'text' : 'image');
        });
    });
    
    // Generate button
    const generateBtn = document.querySelector('.generation-controls .btn--primary');
    if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateModel();
        });
    }
}

function checkAuthState() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        showDashboard();
    } else {
        showLanding();
    }
}

// Theme Management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-color-scheme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-color-scheme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Navigation
function showLanding() {
    const landing = document.getElementById('landing');
    const dashboard = document.getElementById('dashboard');
    
    if (landing) landing.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
}

function showDashboard() {
    const landing = document.getElementById('landing');
    const dashboard = document.getElementById('dashboard');
    
    if (landing) landing.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    
    if (currentUser) {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = currentUser.name;
        }
        loadUserModels();
        renderLibrary();
    }
}

function showLogin() {
    closeModal('register-modal');
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.add('show');
    }
}

function showRegister() {
    closeModal('login-modal');
    const registerModal = document.getElementById('register-modal');
    if (registerModal) {
        registerModal.classList.add('show');
    }
}

function showDemo() {
    // Simulate demo by creating a guest user
    currentUser = { id: 'demo', name: 'Demo User', email: 'demo@example.com' };
    showDashboard();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulate authentication
    if (email && password) {
        const userData = {
            id: generateId(),
            name: email.split('@')[0],
            email: email
        };
        
        const token = btoa(JSON.stringify(userData) + Date.now());
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        currentUser = userData;
        closeModal('login-modal');
        showDashboard();
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    // Simulate registration
    if (name && email && password) {
        const userData = {
            id: generateId(),
            name: name,
            email: email
        };
        
        const token = btoa(JSON.stringify(userData) + Date.now());
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        currentUser = userData;
        closeModal('register-modal');
        showDashboard();
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    currentUser = null;
    userModels.clear();
    showLanding();
}

// Dashboard Navigation
function showSection(sectionName) {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the correct menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const itemText = item.textContent.trim().toLowerCase();
        if (itemText.includes(sectionName)) {
            item.classList.add('active');
        }
    });
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        currentSection = sectionName;
    }
    
    if (sectionName === 'viewer' && currentModel) {
        setTimeout(() => {
            render3DModel(currentModel);
        }, 100);
    }
}

// Generation
function selectGenerationType(type) {
    generationType = type;
    
    // Update option cards
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Find and activate the correct option card
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        const cardTitle = card.querySelector('h3').textContent;
        if ((type === 'text' && cardTitle.includes('Text')) || 
            (type === 'image' && cardTitle.includes('Image'))) {
            card.classList.add('active');
        }
    });
    
    // Show/hide input sections
    const textInput = document.getElementById('text-input');
    const imageInput = document.getElementById('image-input');
    
    if (type === 'text') {
        if (textInput) textInput.classList.remove('hidden');
        if (imageInput) imageInput.classList.add('hidden');
    } else {
        if (textInput) textInput.classList.add('hidden');
        if (imageInput) imageInput.classList.remove('hidden');
    }
}

function renderPromptSuggestions() {
    const container = document.getElementById('suggestion-tags');
    if (!container) return;
    
    container.innerHTML = '';
    
    textPrompts.slice(0, 5).forEach(prompt => {
        const tag = document.createElement('span');
        tag.className = 'suggestion-tag';
        tag.textContent = prompt;
        tag.addEventListener('click', () => {
            const textPrompt = document.getElementById('text-prompt');
            if (textPrompt) {
                textPrompt.value = prompt;
            }
        });
        container.appendChild(tag);
    });
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Update upload area to show selected file
            const uploadArea = document.querySelector('.file-upload-area');
            if (uploadArea) {
                uploadArea.innerHTML = `
                    <div class="upload-icon">✅</div>
                    <p>${file.name}</p>
                    <span>Ready to generate</span>
                `;
            }
        };
        reader.readAsDataURL(file);
    }
}

async function generateModel() {
    const btnText = document.getElementById('generate-btn-text');
    const loader = document.getElementById('generate-loader');
    const format = document.getElementById('output-format').value;
    
    let input = '';
    if (generationType === 'text') {
        const textPrompt = document.getElementById('text-prompt');
        input = textPrompt ? textPrompt.value : '';
        if (!input.trim()) {
            alert('Please enter a text prompt');
            return;
        }
    } else {
        const fileInput = document.getElementById('image-file');
        const file = fileInput ? fileInput.files[0] : null;
        if (!file) {
            alert('Please select an image');
            return;
        }
        input = file.name;
    }
    
    // Show progress modal
    showProgressModal();
    
    // Simulate generation process
    await simulateGeneration();
    
    // Create new model
    const newModel = {
        id: generateId(),
        name: generateModelName(input),
        type: generationType + '-generated',
        prompt: input,
        format: format,
        vertices: Math.floor(Math.random() * 2000) + 500,
        faces: Math.floor(Math.random() * 4000) + 1000,
        size: (Math.random() * 2 + 0.5).toFixed(1) + 'MB',
        preview: sampleModels[Math.floor(Math.random() * sampleModels.length)].preview,
        createdAt: new Date().toISOString()
    };
    
    // Add to user's models
    if (!userModels.has(currentUser.id)) {
        userModels.set(currentUser.id, []);
    }
    userModels.get(currentUser.id).push(newModel);
    
    // Save to localStorage
    saveUserModels();
    
    // Hide progress modal and show success
    closeModal('progress-modal');
    currentModel = newModel;
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        successModal.classList.add('show');
    }
    
    // Update library
    renderLibrary();
}

async function simulateGeneration() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    const steps = [
        { progress: 20, text: 'Analyzing input...' },
        { progress: 40, text: 'Generating geometry...' },
        { progress: 60, text: 'Creating textures...' },
        { progress: 80, text: 'Optimizing model...' },
        { progress: 100, text: 'Finalizing...' }
    ];
    
    for (let step of steps) {
        if (progressFill) progressFill.style.width = step.progress + '%';
        if (progressText) progressText.textContent = step.text;
        await new Promise(resolve => setTimeout(resolve, 800));
    }
}

function showProgressModal() {
    const progressModal = document.getElementById('progress-modal');
    if (progressModal) {
        progressModal.classList.add('show');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = 'Initializing...';
    }
}

function generateModelName(input) {
    const adjectives = ['Amazing', 'Stunning', 'Creative', 'Unique', 'Beautiful', 'Elegant', 'Modern', 'Artistic'];
    const nouns = ['Model', 'Creation', 'Design', 'Sculpture', 'Object', 'Artwork', 'Piece', 'Structure'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adj} ${noun}`;
}

function viewGeneratedModel() {
    closeModal('success-modal');
    showSection('viewer');
    
    setTimeout(() => {
        render3DModel(currentModel);
    }, 100);
}

// Library Management
function loadUserModels() {
    const savedModels = localStorage.getItem('userModels');
    if (savedModels) {
        const allModels = JSON.parse(savedModels);
        userModels = new Map(Object.entries(allModels));
    }
    
    // Add sample models for demo
    if (!userModels.has(currentUser.id)) {
        userModels.set(currentUser.id, [...sampleModels]);
        saveUserModels();
    }
}

function saveUserModels() {
    const modelsObj = Object.fromEntries(userModels);
    localStorage.setItem('userModels', JSON.stringify(modelsObj));
}

function renderLibrary() {
    const grid = document.getElementById('library-grid');
    if (!grid) return;
    
    const models = userModels.get(currentUser.id) || [];
    
    grid.innerHTML = '';
    
    if (models.length === 0) {
        grid.innerHTML = '<p>No models generated yet. Start creating!</p>';
        return;
    }
    
    models.forEach(model => {
        const card = document.createElement('div');
        card.className = 'model-card';
        card.innerHTML = `
            <div class="model-preview">
                <img src="${model.preview}" alt="${model.name}">
            </div>
            <div class="model-info">
                <h3 class="model-title">${model.name}</h3>
                <div class="model-details">
                    <div class="model-detail">
                        <span>Format:</span>
                        <span>${model.format}</span>
                    </div>
                    <div class="model-detail">
                        <span>Size:</span>
                        <span>${model.size}</span>
                    </div>
                    <div class="model-detail">
                        <span>Vertices:</span>
                        <span>${model.vertices}</span>
                    </div>
                    <div class="model-detail">
                        <span>Faces:</span>
                        <span>${model.faces}</span>
                    </div>
                </div>
                <div class="model-actions">
                    <button class="btn btn--primary btn--sm" onclick="viewModel('${model.id}')">View</button>
                    <button class="btn btn--outline btn--sm" onclick="downloadModelById('${model.id}')">Download</button>
                    <button class="btn btn--outline btn--sm" onclick="deleteModel('${model.id}')">Delete</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function viewModel(modelId) {
    const models = userModels.get(currentUser.id) || [];
    const model = models.find(m => m.id === modelId);
    
    if (model) {
        currentModel = model;
        showSection('viewer');
        
        setTimeout(() => {
            render3DModel(model);
        }, 100);
    }
}

function downloadModelById(modelId) {
    const models = userModels.get(currentUser.id) || [];
    const model = models.find(m => m.id === modelId);
    
    if (model) {
        // Simulate download
        const blob = new Blob(['# Simulated 3D Model Data'], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${model.name}.${model.format.toLowerCase()}`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

function deleteModel(modelId) {
    if (('Are you sure you want to delete this model?')) {
        const models = userModels.get(currentUser.id) || [];
        const updatedModels = models.filter(m => m.id !== modelId);
        userModels.set(currentUser.id, updatedModels);
        saveUserModels();
        renderLibrary();
    }
}

// 3D Viewer
function init3DViewer() {
    const container = document.getElementById('viewer-canvas');
    if (!container) return;
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Controls
    //if (THREE.OrbitControls) {
    //    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //    controls.enableDamping = true;
    //    controls.dampingFactor = 0.1;
    //}
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Animation loop
    animate();
    
    // Handle resize
    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    const container = document.getElementById('viewer-canvas');
    if (!container || !camera || !renderer) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function render3DModel(model) {
    if (!scene) return;
    
    // Clear previous models
    const objectsToRemove = [];
    scene.traverse(child => {
        if (child.isMesh && child.userData.isModel) {
            objectsToRemove.push(child);
        }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));
    
    // Create a simple geometric representation based on model name
    let geometry, material, mesh;
    
    if (model.name.toLowerCase().includes('cube')) {
        geometry = new THREE.BoxGeometry(2, 2, 2);
        material = new THREE.MeshLambertMaterial({ color: 0xff6a00 });
    } else if (model.name.toLowerCase().includes('chair')) {
        geometry = new THREE.BoxGeometry(1.5, 2, 1.5);
        material = new THREE.MeshLambertMaterial({ color: 0x4285f4 });
    } else if (model.name.toLowerCase().includes('tree')) {
        geometry = new THREE.ConeGeometry(1, 3, 8);
        material = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
    } else {
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        material = new THREE.MeshLambertMaterial({ color: 0x9c27b0 });
    }
    
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isModel = true;
    scene.add(mesh);
    
    // Update model info
    updateModelInfo(model);
    
    // Reset camera position
    camera.position.set(0, 0, 5);
    if (controls) {
        controls.reset();
    }
}

function updateModelInfo(model) {
    const elements = {
        'model-name': model.name,
        'model-format': model.format,
        'model-vertices': model.vertices,
        'model-faces': model.faces,
        'model-size': model.size
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function downloadModel() {
    if (currentModel) {
        downloadModelById(currentModel.id);
    }
}

function resetCamera() {
    if (camera && controls) {
        camera.position.set(0, 0, 5);
        controls.reset();
    }
}

// Utility Functions
function generateId() {
    return 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Global functions for HTML onclick handlers
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showDemo = showDemo;
window.closeModal = closeModal;
window.showSection = showSection;
window.selectGenerationType = selectGenerationType;
window.generateModel = generateModel;
window.viewModel = viewModel;
window.downloadModel = downloadModel;
window.downloadModelById = downloadModelById;
window.deleteModel = deleteModel;
window.resetCamera = resetCamera;
window.viewGeneratedModel = viewGeneratedModel;
window.logout = logout;

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            closeModal(modal.id);
        });
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const textPrompt = document.getElementById('text-prompt');
        if (textPrompt && !textPrompt.classList.contains('hidden')) {
            textPrompt.focus();
        }
    }
});
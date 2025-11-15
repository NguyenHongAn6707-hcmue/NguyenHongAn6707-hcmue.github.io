// Tốc độ di chuyển của cá mập (pixels per frame) -> Giảm để thợ lặn nhanh hơn
const SHARK_SPEED = 8; 
// Tốc độ di chuyển ngẫu nhiên của thợ lặn -> Tăng tốc độ mạnh
const DIVER_WIGGLE = 10; 
// Tốc độ trôi nhẹ của thợ lặn (tạo dòng chảy) -> Tăng tốc độ
const DIVER_DRIFT_SPEED = 6; 
// Tốc độ di chuyển của đàn cá
const FISH_SPEED = 8; 
// Tốc độ di chuyển của rùa (chậm hơn)
const TURTLE_SPEED = 3; 


// 1. Lấy các phần tử từ DOM
const gameContainer = document.getElementById('game-container');

// 2. Khởi tạo trạng thái của tất cả các đối tượng chuyển động
let entities = [];

// Thêm Cá Mập (Shark)
const sharkElement = document.getElementById('shark-left');
entities.push({
    element: sharkElement,
    x: sharkElement.offsetLeft, 
    y: sharkElement.offsetTop, 
    type: 'shark',
    speed: SHARK_SPEED,
    isDiver: false
});

// Thêm Thợ Lặn (Divers)
['diver1', 'diver2', 'diver3'].forEach(id => {
    const el = document.getElementById(id);
    entities.push({
        element: el,
        x: el.offsetLeft, 
        y: el.offsetTop, 
        type: 'diver',
        speed: DIVER_WIGGLE, // Dùng cho dao động ngẫu nhiên
        isDiver: true
    });
});

// Thêm Rùa (Turtle) - Di chuyển chậm, liên tục
const turtleElement = document.getElementById('turtle');
entities.push({
    element: turtleElement,
    x: turtleElement.offsetLeft, 
    y: turtleElement.offsetTop, 
    type: 'turtle',
    speed: TURTLE_SPEED,
    direction: -1 
});

// Thêm Đàn Cá (Fish)
entities.push(
    { 
        element: document.getElementById('goldfish'), 
        x: document.getElementById('goldfish').offsetLeft, 
        y: document.getElementById('goldfish').offsetTop, 
        type: 'fish', 
        speed: FISH_SPEED, 
        direction: -1 // Cá vàng đi từ phải sang trái
    },
    { 
        element: document.getElementById('faintschool'), 
        x: document.getElementById('faintschool').offsetLeft, 
        y: document.getElementById('faintschool').offsetTop, 
        type: 'fish', 
        speed: FISH_SPEED, 
        direction: 1 // Cá xanh đi từ trái sang phải
    }
);

// 3. Hàm tính khoảng cách giữa hai điểm
function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

// 4. Hàm chính để cập nhật trạng thái trò chơi
function updateGame() {
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;
    
    const sharkEntity = entities.find(e => e.type === 'shark');
    const divers = entities.filter(e => e.type === 'diver');
    
    // Tìm thợ lặn gần cá mập nhất (mục tiêu)
    let target = null;
    let minDistance = Infinity;
    
    divers.forEach(diver => {
        const distance = getDistance(sharkEntity.x, sharkEntity.y, diver.x, diver.y);
        if (distance < minDistance) {
            minDistance = distance;
            target = diver;
        }
    });

    entities.forEach(entity => {
        // --- Logic Shark (Đuổi bắt) ---
        if (entity.type === 'shark' && target) {
            const dx = target.x - entity.x;
            const dy = target.y - entity.y;
            const distance = getDistance(0, 0, dx, dy);

            if (distance > 1) { 
                entity.x += (dx / distance) * entity.speed; // Dùng SHARK_SPEED=8
                entity.y += (dy / distance) * entity.speed;
            }

            // Lật hình ảnh (Sửa lỗi lật)
            // Cá mập hướng sang trái nếu dx < 0
            if (dx < 0) {
                entity.element.style.transform = 'scaleX(1)'; 
            } else {
                entity.element.style.transform = 'scaleX(-1)'; 
            }
        }
        
        // --- Logic Divers (Wiggle + Trôi phải, Looping) ---
        else if (entity.type === 'diver') {
            // Wiggle (Dao động ngẫu nhiên) - Rất nhanh
            entity.x += (Math.random() - 0.5) * entity.speed * 2;
            entity.y += (Math.random() - 0.5) * entity.speed * 2;
            
            // Trôi nhẹ sang phải (Tránh cá mập) - Rất nhanh
            entity.x += DIVER_DRIFT_SPEED; // Dùng DIVER_DRIFT_SPEED=6

            // Kiểm tra biên ngang (Looping)
            if (entity.x > containerWidth + entity.element.clientWidth / 2) {
                // Nếu trôi ra khỏi biên phải, reset về biên trái
                entity.x = -entity.element.clientWidth;
            }
            
            // Giới hạn biên dọc (Clamping)
            entity.y = Math.max(70, Math.min(entity.y, containerHeight - entity.element.clientHeight));
            
            // Thợ lặn luôn hướng về bên phải (theo trôi dạt)
            entity.element.style.transform = 'scaleX(1)'; 
        }
        
        // --- Logic Fish & Turtle (Chạy liên tục, lật hình) ---
        else if (entity.type === 'fish' || entity.type === 'turtle') {
            entity.x += entity.speed * entity.direction;

            // Kiểm tra biên ngang (Looping)
            if (entity.direction === 1 && entity.x > containerWidth) { 
                entity.x = -entity.element.clientWidth; 
            } else if (entity.direction === -1 && entity.x < -entity.element.clientWidth) { 
                entity.x = containerWidth;
            }

            // Lật hình ảnh theo hướng di chuyển
            // Hướng: 1 (Phải) -> Lật ảnh (-1)
            // Hướng: -1 (Trái) -> Không lật ảnh (1)
            entity.element.style.transform = `scaleX(${entity.direction === 1 ? -1 : 1})`;
        }


        // Áp dụng vị trí mới cho tất cả các thực thể
        entity.element.style.left = `${entity.x}px`;
        entity.element.style.top = `${entity.y}px`;
    });

    // Lặp lại hoạt ảnh
    requestAnimationFrame(updateGame);
}

// Bắt đầu vòng lặp trò chơi
updateGame();
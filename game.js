let gameState = {
    leftBank: ['farmer', 'wolf', 'goat', 'cabbage'],
    rightBank: [],
    boat: {
        position: 'left',
        contents: []
    },
    selected: null
};

// 폭죽 효과 관련 변수
let fireworksInterval;

function moveSelected() {
    if (gameState.boat.contents.length === 0) {
        showMessage('보트에 탑승자가 없습니다!', 'warning');
        return;
    }
    
    const boat = document.getElementById('boat');
    const container = document.querySelector('.container');
    const boatWidth = boat.offsetWidth;
    
    // 보트 이동 중에는 클릭 비활성화
    boat.style.pointerEvents = 'none';
    document.querySelectorAll('.item').forEach(item => {
        item.style.pointerEvents = 'none';
    });
    
    // 보트 위치에 따라 이동
    if (gameState.boat.position === 'left') {
        // 오른쪽 강둑 앞에 정지
        boat.style.left = `calc(75% - ${boatWidth}px)`;
        gameState.boat.position = 'right';
    } else {
        // 왼쪽 강둑 앞에 정지
        boat.style.left = '25%';
        gameState.boat.position = 'left';
    }
    
    // 이동이 완료된 후 상태 체크 및 클릭 활성화
    setTimeout(() => {
        checkGameState();
        updateStatus();
        boat.style.pointerEvents = 'auto';
        document.querySelectorAll('.item').forEach(item => {
            item.style.pointerEvents = 'auto';
        });
    }, 2000);
}

function updateBanks() {
    const leftBank = document.getElementById('leftBank');
    const rightBank = document.getElementById('rightBank');
    
    // 은행 초기화
    leftBank.innerHTML = '';
    rightBank.innerHTML = '';
    
    // 왼쪽 은행 아이템 표시
    gameState.leftBank.forEach(item => {
        const img = createItemElement(item);
        leftBank.appendChild(img);
    });
    
    // 오른쪽 은행 아이템 표시
    gameState.rightBank.forEach(item => {
        const img = createItemElement(item);
        rightBank.appendChild(img);
    });
}

function createItemElement(item) {
    const img = document.createElement('img');
    img.src = `${item}.png`;
    img.className = 'item';
    img.id = item;
    img.onclick = () => selectItem(item);
    return img;
}

function selectItem(item) {
    const currentBank = gameState.boat.position === 'left' ? gameState.leftBank : gameState.rightBank;
    
    // 보트에 있는 아이템을 클릭하면 현재 강둑으로 내리기
    if (gameState.boat.contents.includes(item)) {
        const index = gameState.boat.contents.indexOf(item);
        gameState.boat.contents.splice(index, 1);
        currentBank.push(item);
        updateBanks();
        updateBoat();
        updateStatus();
        return;
    }
    
    if (!currentBank.includes(item)) {
        showMessage('현재 강 둑에 없는 항목은 선택할 수 없습니다.');
        return;
    }
    
    if (gameState.boat.contents.length >= 2) {
        showMessage('보트에는 농부와 한 항목만 실을 수 있습니다.');
        return;
    }
    
    if (item === 'farmer' || gameState.boat.contents.includes('farmer')) {
        const sourceBank = gameState.boat.position === 'left' ? gameState.leftBank : gameState.rightBank;
        const index = sourceBank.indexOf(item);
        sourceBank.splice(index, 1);
        gameState.boat.contents.push(item);
        updateBanks();
        updateBoat();
        updateStatus();
    } else {
        showMessage('농부가 먼저 보트에 타야 합니다.');
    }
}

// 보트 내용물 업데이트 함수 수정
function updateBoat() {
    const boat = document.getElementById('boat');
    boat.innerHTML = '';
    
    // 보트 내용물을 담을 컨테이너 생성
    const contentsContainer = document.createElement('div');
    contentsContainer.style.display = 'flex';
    contentsContainer.style.justifyContent = 'center';
    contentsContainer.style.alignItems = 'flex-end';
    contentsContainer.style.position = 'absolute';
    contentsContainer.style.bottom = '50%'; // 보트 중간 높이로 조정
    contentsContainer.style.width = '100%';
    contentsContainer.style.height = '100%';
    contentsContainer.style.zIndex = '1'; // 보트 위에 표시되도록
    
    gameState.boat.contents.forEach((item, index) => {
        const itemContainer = document.createElement('div');
        itemContainer.style.position = 'relative';
        itemContainer.style.display = 'flex';
        itemContainer.style.flexDirection = 'column';
        itemContainer.style.alignItems = 'center';
        
        const img = document.createElement('img');
        img.src = `${item}.png`;
        img.className = 'item boat-item';
        img.id = `boat-${item}`;
        img.style.width = '35px';
        img.style.height = '35px';
        img.style.margin = '0 2px';
        img.onclick = () => selectItem(item);
        
        itemContainer.appendChild(img);
        contentsContainer.appendChild(itemContainer);
    });
    
    boat.appendChild(contentsContainer);
}

function checkGameState() {
    const leftBank = new Set(gameState.leftBank);
    const rightBank = new Set(gameState.rightBank);
    const boatContents = new Set(gameState.boat.contents);
    
    // 위험한 상황 체크
    if (leftBank.has('wolf') && leftBank.has('goat') && !leftBank.has('farmer')) {
        applyFailEffect('wolf', 'goat', 'left');
        return;
    }
    
    if (leftBank.has('goat') && leftBank.has('cabbage') && !leftBank.has('farmer')) {
        applyFailEffect('goat', 'cabbage', 'left');
        return;
    }
    
    if (rightBank.has('wolf') && rightBank.has('goat') && !rightBank.has('farmer')) {
        applyFailEffect('wolf', 'goat', 'right');
        return;
    }
    
    if (rightBank.has('goat') && rightBank.has('cabbage') && !rightBank.has('farmer')) {
        applyFailEffect('goat', 'cabbage', 'right');
        return;
    }
    
    // 승리 조건 체크
    const allItemsOnRight = gameState.boat.position === 'right' 
        ? rightBank.size + boatContents.size === 4
        : rightBank.size === 4;
    
    if (allItemsOnRight) {
        celebrateVictory();
    }
}

// 승리 축하 함수 수정
function celebrateVictory() {
    showMessage('축하합니다! 모두 안전하게 건넜습니다!', 'success');
    
    // 게임 컨트롤 비활성화
    disableGameControls();
    
    // 승리 효과 적용
    applyVictoryEffects();
    
    // 폭죽 효과 시작
    startFireworks();
}

// 게임 컨트롤 비활성화 함수
function disableGameControls() {
    const items = document.querySelectorAll('.item');
    const moveButton = document.querySelector('button');
    
    items.forEach(item => {
        item.style.pointerEvents = 'none';
    });
    
    if (moveButton) {
        moveButton.disabled = true;
    }
}

// 승리 효과 적용 함수
function applyVictoryEffects() {
    // 아이템들에 승리 애니메이션 적용
    document.querySelectorAll('.item').forEach(item => {
        item.classList.add('victory-animation');
    });
    
    // 컨테이너에 승리 효과 적용
    document.querySelector('.container').classList.add('victory');
    
    // 다시하기 버튼 강조
    const resetButton = document.querySelector('button:last-child');
    if (resetButton) {
        resetButton.classList.add('highlight-reset');
    }
}

// 실패 효과를 적용하는 새로운 함수
function applyFailEffect(predator, prey, bank) {
    const bankElement = document.getElementById(bank + 'Bank');
    const predatorElement = bankElement.querySelector(`#${predator}`);
    const preyElement = bankElement.querySelector(`#${prey}`);
    
    // 효과음 재생
    playSound(predator);
    
    // 포식자 효과
    predatorElement.classList.add('attack-animation');
    
    // 먹이 효과
    preyElement.classList.add('victim-animation');
    
    // 배경 효과
    bankElement.classList.add('danger-background');
    
    // 메시지 표시
    const message = predator === 'wolf' 
        ? '늑대가 염소를 잡아먹었습니다!' 
        : '염소가 양배추를 먹어버렸습니다!';
    showMessage(message, 'error');
    
    // 1.5초 후 게임 리셋
    setTimeout(resetGame, 1500);
}

// 효과음 재생 함수
function playSound(predator) {
    const sound = new Audio(predator === 'wolf' ? 'wolf-howl.mp3' : 'goat-bleat.mp3');
    sound.play().catch(err => console.log('효과음 재생 실패'));
}

function showMessage(msg, type = 'normal') {
    const messageElement = document.getElementById('message');
    
    // 이모지에 애니메이션 효과 추가
    const msgWithAnimatedEmoji = msg.replace(/([🎉🎊✨])/g, '<span class="message-emoji">$1</span>');
    messageElement.innerHTML = msgWithAnimatedEmoji;
    
    // 이전 클래스들 제거
    messageElement.classList.remove('error', 'success', 'warning', 'success-message', 'error-message');
    
    switch(type) {
        case 'error':
            messageElement.classList.add('error', 'error-message');
            // 에러 메시지는 3초 후 사라짐
            setTimeout(() => {
                messageElement.classList.remove('show-message');
            }, 3000);
            break;
        case 'success':
            messageElement.classList.add('success', 'success-message', 'show-message');
            // 성공 메시지는 유지 (다시하기 전까지)
            break;
        case 'warning':
            messageElement.classList.add('warning');
            setTimeout(() => {
                messageElement.classList.remove('show-message');
            }, 3000);
            break;
    }
    
    messageElement.classList.add('show-message');
}

// 구름 생성 함수
function createClouds() {
    const cloudsContainer = document.getElementById('clouds');
    const numberOfClouds = 5;

    for (let i = 0; i < numberOfClouds; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // 랜덤 크기와 위치
        const size = Math.random() * 50 + 30;
        const top = Math.random() * 30;
        const duration = Math.random() * 20 + 30;
        const delay = Math.random() * -20;
        
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size/2}px`;
        cloud.style.top = `${top}%`;
        cloud.style.animationDuration = `${duration}s`;
        cloud.style.animationDelay = `${delay}s`;
        
        cloudsContainer.appendChild(cloud);
    }
}

// 페이지 로드 시 구름 생성
window.addEventListener('load', createClouds);

// resetGame 함수 수정
function resetGame() {
    // 폭죽 효과 중지
    if (fireworksInterval) {
        clearInterval(fireworksInterval);
        fireworksInterval = null;
    }
    
    // 남아있는 폭죽 요소들 제거
    const fireworksContainer = document.getElementById('fireworks-container');
    fireworksContainer.innerHTML = '';
    
    // 게임 상태 초기화
    gameState = {
        leftBank: ['farmer', 'wolf', 'goat', 'cabbage'],
        rightBank: [],
        boat: {
            position: 'left',
            contents: []
        },
        selected: null
    };
    
    // 보트 위치 초기화
    const boat = document.getElementById('boat');
    boat.style.left = '25%';
    
    // 승리 효과 제거
    document.querySelectorAll('.item').forEach(item => {
        item.classList.remove('victory-animation');
        item.style.pointerEvents = 'auto';
    });
    
    // 컨테이너 승리 효과 제거
    document.querySelector('.container').classList.remove('victory');
    
    // 다시하기 버튼 강조 효과 제거
    const resetButton = document.querySelector('button:last-child');
    if (resetButton) {
        resetButton.classList.remove('highlight-reset');
    }
    
    // 이동하기 버튼 활성화
    const moveButton = document.querySelector('button');
    if (moveButton) {
        moveButton.disabled = false;
    }
    
    // 상태 업데이트
    updateBanks();
    updateBoat();
    updateStatus();
    showMessage('');
}

function updateStatus() {
    const statusRow = document.getElementById('status-row');
    const items = ['farmer', 'wolf', 'goat', 'cabbage'];
    
    items.forEach((item, index) => {
        const cell = statusRow.cells[index];
        const isOnRight = gameState.rightBank.includes(item) || 
                         (gameState.boat.position === 'right' && 
                          gameState.boat.contents.includes(item));
        
        cell.textContent = isOnRight ? '1' : '0';
        cell.setAttribute('data-value', isOnRight ? '1' : '0');
        
        // 상태 변경 애니메이션
        cell.style.animation = 'none';
        cell.offsetHeight; // reflow
        cell.style.animation = 'statusChange 0.5s ease';
    });
}

// 폭죽 생성 함수 수정
function createFirework() {
    const colors = [
        '#ff0000', '#ffa500', '#ffff00', '#00ff00', 
        '#00ffff', '#0000ff', '#ff00ff', '#ff69b4'
    ];
    
    const fireworksContainer = document.getElementById('fireworks-container');
    const firework = document.createElement('div');
    
    // 랜덤 위치 설정
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * (window.innerHeight * 0.7);
    
    firework.className = 'firework';
    firework.style.left = `${x}px`;
    firework.style.top = `${y}px`;
    firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    const duration = Math.random() * 1000 + 800; // 지속시간 증가
    firework.style.setProperty('--duration', duration + 'ms');
    
    fireworksContainer.appendChild(firework);
    
    // 더 많은 파편과 함께 폭죽 생성
    createSparks(x, y, colors[Math.floor(Math.random() * colors.length)], duration);
    
    setTimeout(() => {
        firework.remove();
    }, duration);
}

// 폭죽 파편 생성 함수 수정
function createSparks(x, y, color, duration) {
    const fireworksContainer = document.getElementById('fireworks-container');
    const numberOfSparks = 24; // 파편 개수 증가
    const sparkSize = Math.random() * 4 + 3; // 파편 크기 증가
    const distance = Math.random() * 200 + 100; // 이동 거리 증가
    
    for (let i = 0; i < numberOfSparks; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.backgroundColor = color;
        spark.style.width = `${sparkSize}px`;
        spark.style.height = `${sparkSize}px`;
        
        const angle = (i * 360) / numberOfSparks;
        const travel = `translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px)`;
        spark.style.setProperty('--travel', travel);
        spark.style.setProperty('--duration', duration + 'ms');
        
        fireworksContainer.appendChild(spark);
        
        setTimeout(() => {
            spark.remove();
        }, duration);
    }
}

// 폭죽 효과 시작 함수
function startFireworks() {
    // 기존 폭죽 효과가 있다면 중지
    if (fireworksInterval) {
        clearInterval(fireworksInterval);
    }
    
    // 새로운 폭죽 효과 시작
    createFirework(); // 즉시 하나 생성
    fireworksInterval = setInterval(() => {
        createFirework();
    }, 300); // 300ms마다 새로운 폭죽 생성
}

// 초기 게임 상태 설정
updateBanks();

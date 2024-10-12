const dino = document.querySelector('.dino');
const background = document.querySelector('.background');
const scoreDisplay = document.querySelector('.score');
const healthBar = document.getElementById('health');
const powerUp = document.getElementById('power-up');
const restartButton = document.querySelector('.restart-button');

let isJumping = false;
let isGameOver = false;
let position = 0;
let dinoPositionX = 0;
let isMovingLeft = false;
let isMovingRight = false;
let score = 0;
let health = 100;
let phase = 1; // Nova variável para controlar as fases
const maxPhase = 5; // Número total de fases
const phaseDisplay = document.createElement('div'); // Exibição da fase atual

// Configurando exibição da fase na tela
phaseDisplay.style.position = 'absolute';
phaseDisplay.style.top = '20px';
phaseDisplay.style.right = '20px';
phaseDisplay.style.fontSize = '24px';
phaseDisplay.style.color = '#000';
document.body.appendChild(phaseDisplay);

// Função para atualizar a barra de vida e fase na tela
function updateHealthBar() {
    healthBar.style.width = health + '%';
    healthBar.textContent = health; // Mostra o valor numérico da vida dentro da barra
    if (health <= 50) {
        healthBar.style.backgroundColor = 'yellow';
    }
    if (health <= 20) {
        healthBar.style.backgroundColor = 'red';
    }
}

function updatePhaseDisplay() {
    phaseDisplay.textContent = `Fase: ${phase}`;
}

function handleKeyDown(event) {
    if (event.keyCode === 32) {
        if (!isJumping) {
            jump();
        }
    } else if (event.keyCode === 37) {
        isMovingLeft = true;
    } else if (event.keyCode === 39) {
        isMovingRight = true;
    }
}

function handleKeyUp(event) {
    if (event.keyCode === 37) {
        isMovingLeft = false;
    } else if (event.keyCode === 39) {
        isMovingRight = false;
    }
}

function moveDino() {
    if (isMovingLeft && dinoPositionX > 0) {
        dinoPositionX -= 10;
        dino.style.left = dinoPositionX + 'px';
    }
    if (isMovingRight && dinoPositionX < window.innerWidth - 60) {
        dinoPositionX += 10;
        dino.style.left = dinoPositionX + 'px';
    }
}

function jump() {
    isJumping = true;

    let upInterval = setInterval(() => {
        if (position >= 150) {
            clearInterval(upInterval);

            let downInterval = setInterval(() => {
                if (position <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                } else {
                    position -= 20;
                    dino.style.bottom = position + 'px';
                }
            }, 20);
        } else {
            position += 20;
            dino.style.bottom = position + 'px';
        }
    }, 20);
}

function createCactus() {
    const cactus = document.createElement('div');
    let cactusPosition = 1000;
    let randomTime = Math.random() * (6000 / phase); // Ajusta o tempo baseado na fase

    if (isGameOver) return;

    cactus.classList.add('cactus');
    background.appendChild(cactus);
    cactus.style.left = cactusPosition + 'px';

    let leftTimer = setInterval(() => {
        if (cactusPosition < -60) {
            clearInterval(leftTimer);
            background.removeChild(cactus);
        } else if (cactusPosition > dinoPositionX && cactusPosition < dinoPositionX + 60 && position < 60) {
            // Dino foi atingido
            clearInterval(leftTimer);
            background.removeChild(cactus); // Remove o cacto quando atinge o Dino
            health -= 10;
            updateHealthBar();

            if (health <= 0) {
                gameOver();
            }
        } else if (cactusPosition < dinoPositionX - 60 && position >= 60) {
            // Dino pulou sobre o cacto e ganha pontos
            score += 10;
            updateScore();
            clearInterval(leftTimer);
            background.removeChild(cactus); // Remove o cacto ao pular sobre ele
        } else {
            cactusPosition -= (10 + phase * 2); // Aumenta a velocidade dos cactos com base na fase
            cactus.style.left = cactusPosition + 'px';
        }
    }, 20);

    setTimeout(createCactus, randomTime); // Cria o próximo cacto
}

function showDamageEffect() {
    // Adiciona um efeito de piscar a tela para indicar que o Dino perdeu vida
    dino.classList.add('damage');
    const damageMessage = document.createElement('div');
    damageMessage.classList.add('damage-message');
    damageMessage.textContent = '-10 HP';
    document.body.appendChild(damageMessage);

    // Remove o efeito e a mensagem de dano após um tempo
    setTimeout(() => {
        dino.classList.remove('damage');
        damageMessage.remove();
    }, 500);
}

function updateScore() {
    scoreDisplay.innerHTML = 'Pontos: ' + score;
    if (score % 50 === 0 && score !== 0) { // A cada 50 pontos, avança de fase
        advancePhase();
    }
}

function advancePhase() {
    if (phase < maxPhase) {
        phase++;
        updatePhaseDisplay(); // Atualiza a exibição da fase
    }
}

function createPowerUp() {
    let powerUpPosition = 1000;
    let randomTime = Math.random() * 15000 + 5000; // Power-up aparece entre 5 a 20 segundos

    powerUp.style.left = powerUpPosition + 'px';
    powerUp.style.display = 'block'; // Mostra o power-up

    let movePowerUp = setInterval(() => {
        if (powerUpPosition < -40) {
            // Saiu da tela
            clearInterval(movePowerUp);
            powerUp.style.display = 'none'; // Esconde o power-up
        } else if (powerUpPosition > dinoPositionX && powerUpPosition < dinoPositionX + 60 && position < 60) {
            // Dino pegou o power-up
            health = Math.min(health + 5, 100); // Aumenta 5 de vida, até o máximo de 100
            updateHealthBar();
            score += 10; // Aumenta a pontuação ao pegar o power-up
            updateScore();
            powerUp.style.display = 'none'; // Esconde o power-up
            clearInterval(movePowerUp);
        } else {
            powerUpPosition -= (10 + phase * 2); // Aumenta a velocidade do power-up com base na fase
            powerUp.style.left = powerUpPosition + 'px';
        }
    }, 20);

    // Cria outro power-up depois de um tempo aleatório
    setTimeout(createPowerUp, randomTime);
}

createPowerUp(); // Inicializa o primeiro power-up

function gameOver() {
    isGameOver = true;
    document.querySelector('.game-over')?.remove(); // Remove qualquer texto anterior de Game Over
    const gameOverText = document.createElement('h1');
    gameOverText.classList.add('game-over');
    gameOverText.textContent = 'Fim de jogo';
    document.body.appendChild(gameOverText);
    restartButton.style.display = 'block'; // Exibe o botão de reinício
}

function restartGame() {
    // Reseta as variáveis do jogo
    score = 0;
    health = 100;
    phase = 1; // Reseta a fase para 1
    isGameOver = false;
    position = 0;
    dinoPositionX = 0;
    dino.style.left = dinoPositionX + 'px';
    dino.style.bottom = position + 'px';

    // Reseta o HUD
    updateScore();
    updateHealthBar();
    updatePhaseDisplay(); // Reseta a exibição da fase

    // Remove cactos existentes
    document.querySelectorAll('.cactus').forEach(cactus => cactus.remove());

    restartButton.style.display = 'none'; // Esconde o botão de reinício
    createCactus(); // Reinicia o jogo
}

// Adiciona a função de reinício ao clicar no botão
restartButton.addEventListener('click', restartGame);

// Iniciar o jogo
createCactus();
updatePhaseDisplay(); // Mostra a fase inicial na tela
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
setInterval(moveDino, 20);



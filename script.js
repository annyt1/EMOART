
// 1. Глобальные переменные и объекты
let emotionEntries = []; // Массив для хранения записей (в дальнейшем можно сохранить в localStorage)

// Получаем элементы DOM один раз при загрузке скрипта
const form = document.getElementById('emotionForm');
const emotionSelect = document.getElementById('emotion');
const commentInput = document.getElementById('comment');
const visualization = document.getElementById('visualization');
const aiBuddy = document.getElementById('ai-buddy');
const aiResponse = document.getElementById('ai-response');

// 2. Функция для загрузки данных из LocalStorage (если они есть)
function loadEntries() {
    if (localStorage.getItem('emotionEntries')) {
        emotionEntries = JSON.parse(localStorage.getItem('emotionEntries'));
        renderVisualization(); // Отображаем загруженные данные
    }
}

// 3. Функция для отображения визуализации (Карта настроений)
function renderVisualization() {
    visualization.innerHTML = ''; // Очищаем предыдущую визуализацию

    if (emotionEntries.length === 0) {
        visualization.textContent = 'Пока нет записей. Добавьте первую эмоцию!';
        return;
    }

    // Группируем эмоции и считаем количество
    const counts = emotionEntries.reduce((acc, entry) => {
        acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
        return acc;
    }, {});

    // Составляем карту эмоций (с эмодзи и текстом)
    const emotionMap = {
        joy: '😊 Радость',
        sadness: '😢 Грусть',
        anger: '😠 Злость',
        fear: '😨 Страх',
        surprise: '😲 Удивление',
        love: '❤️ Любовь'
    };

    // Создаем круги (больше записей - больше круг)
    for (const emotion in counts) {
        if (counts.hasOwnProperty(emotion)) {
            const count = counts[emotion];
            const element = document.createElement('div');
            element.className = 'emotion-circle'; // Класс для стилизации кругов
            element.textContent = emotionMap[emotion] ? `${emotionMap[emotion].split(' ')[0]} ${count}` : `${count}`;
            element.dataset.emotion = emotion; // Добавляем дата-атрибут для возможной фильтрации

            // Примерное масштабирование круга в зависимости от количества
            const baseSize = 40;
            const maxSize = 100;
            const size = Math.min(maxSize, baseSize + count * 5); // Чем больше count, тем больше круг

            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.padding = '5px';
            element.style.fontSize = '12px'; // Уменьшаем шрифт для маленьких кругов
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
            element.style.flexShrink = '0'; // Чтобы круги не сжимались

            // Применяем цвет фона в зависимости от эмоции
            switch (emotion) {
                case 'joy': element.style.background = '#4CAF50'; break; // Зеленый
                case 'sadness': element.style.background = '#2196F3'; break; // Синий
                case 'anger': element.style.background = '#F44336'; break; // Красный
                case 'fear': element.style.background = '#9C27B0'; break; // Фиолетовый
                case 'surprise': element.style.background = '#FF9800'; break; // Оранжевый
                case 'love': element.style.background = '#E91E63'; break; // Розовый
                default: element.style.background = '#9E9E9E'; // Серый по умолчанию
            }
            
            element.style.borderRadius = '50%';
            element.style.border = '2px solid rgba(255,255,255,0.5)';
            element.style.color = 'white';
            element.style.cursor = 'pointer';
           element.addEventListener('click', () => {
        // Фильтруем записи только по выбранной эмоции
        const relevantEntries = emotionEntries.filter(entry => entry.emotion === emotion);

        // Собираем все комментарии для этой эмоции
        const comments = relevantEntries.map(entry => entry.comment);

        // Показываем окно с комментариями (или сообщение, если их нет)
        if (comments.length > 0) {
            alert(`Комментарии к "${emotionMap[emotion] || emotion}":\n\n${comments.join('\n')}`);
        } else {
            alert('К этой эмоции пока нет комментариев.');
        }
        });
            visualization.appendChild(element);
        }
    }
}

// 4. Инициализация при загрузке страницы
loadEntries(); // Загружаем старые записи
// Функция для эффекта "печатающегося текста"
function typeWriter(text, elementId, speed = 30) {
    const element = document.getElementById(elementId);
    element.innerHTML = ""; // Очищаем поле перед началом
    let i = 0;

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}
// 5. ИИ-помощник
const aiDatabase = {
    joy: ["Твоя энергия заразительна! Поделись этой радостью с кем-то еще.", "Это прекрасный день! Запомни, что сделало тебя счастливой."],
    sadness: ["Грустить — это нормально. Дай себе время отдохнуть. Чай и уют помогут.", "Помни, что тучи всегда рассеиваются. Ты сильнее, чем кажется."],
    anger: ["Сделай 5 глубоких вдохов. Твои чувства важны, но не дай гневу управлять тобой.", "Злость — это сигнал. Попробуй выплеснуть её в творчество или спорт."],
    fear: ["Ты в безопасности. Попробуй сосредоточиться на том, что ты контролируешь сейчас.", "Большинство страхов не сбываются. Ты справишься, я рядом."],
    love: ["Любовь делает мир лучше! Наслаждайся этим теплым чувством.", "Как здорово! Пусть любовь наполняет твой день светом."],
    surprise: ["Удивление — это начало открытия! Что нового ты сегодня узнала?", "Ого! Мир умеет удивлять. Наслаждайся этим моментом."]
};

function getAiSupport(emotion, comment) {
    const aiBlock = document.getElementById('ai-buddy');
    const aiText = document.getElementById('ai-response');
    
    let response = aiDatabase[emotion] ? aiDatabase[emotion][Math.floor(Math.random() * aiDatabase[emotion].length)] : "Я рядом!";
    
    const text = comment.toLowerCase();
    if (text.includes("устал") || text.includes("сложно") || text.includes("тяжело")) {
        response = "Я вижу, ты устала. Пожалуйста, отдохни сегодня подольше. Ты это заслужила.";
    } else if (text.includes("экзамен") || text.includes("тест") || text.includes("работа")) {
        response = "Удачи с учебой! Ты всё знаешь, просто верь в свои силы!";
    } else if (text.includes("радостн") || text.includes("весело")) {
        response = "Здорово, что ты делишься своей радостью! Пусть этот позитив длится как можно дольше.";
    }

    aiBlock.style.display = 'block';
    typeWriter(response, 'ai-response', 40); 

}

// 6. Функция для запуска конфетти
function launchConfetti(emoji) {
    // Находим кнопку "Добавить запись"
    const btn = document.querySelector('button[type="submit"]'); // Ищем по типу, чтобы найти правильную кнопку
    if (!btn) return; // Если кнопки нет, выходим
    
    const rect = btn.getBoundingClientRect(); // Получаем координаты кнопки
    
    // Создаем 20 частиц
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle'; // Класс для стилей анимации
        particle.innerText = emoji;
        
        // Начальная позиция — центр кнопки
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Задаем случайное направление полета через переменные CSS
        const dx = (Math.random() - 0.5) * 400 + 'px'; // Влево-вправо на 200px
        const dy = (Math.random() - 0.5) * 400 + 'px'; // Вверх-вниз на 200px
        const dr = (Math.random() * 360) + 'deg';      // Случайное вращение
        
        particle.style.setProperty('--dx', dx);
        particle.style.setProperty('--dy', dy);
        particle.style.setProperty('--dr', dr);
        
        document.body.appendChild(particle);
        
        // Удаляем частицу через 1.5 секунды, когда анимация закончится
        setTimeout(() => particle.remove(), 1500);
    }
}

// 7. ОБРАБОТЧИК СОБЫТИЯ SUBMIT (ЕДИНЫЙ)
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Предотвращаем стандартную отправку формы

    // 1. Получаем данные из формы
    const emotion = emotionSelect.value; // Например, "joy"
    const comment = commentInput.value.trim(); // Текст комментария

    // Проверка: если ничего не выбрано или комментарий пуст, выходим
    if (!emotion || !comment) {
        alert('Пожалуйста, выберите эмоцию и напишите комментарий.');
        return;
    }

    // 2. Получаем сам смайлик для конфетти (берем первую часть текста из выпадающего списка)
    const selectedEmoji = emotionSelect.options[emotionSelect.selectedIndex].text.split(' ')[0];

    // 3. ЗАПУСКАЕМ ЭФФЕКТЫ
    launchConfetti(selectedEmoji);     // Взрыв конфетти
    getAiSupport(emotion, comment);    // Ответ от ИИ-помощника

    // 4. СОХРАНЯЕМ ЗАПИСЬ
    const entry = {
        emotion, // Короткая запись: emotion: emotion
        comment,
        timestamp: Date.now() // Время создания записи
    };
    
    emotionEntries.push(entry); // Добавляем новую запись в массив
    localStorage.setItem('emotionEntries', JSON.stringify(emotionEntries)); // Сохраняем массив в LocalStorage

    // 5. ОБНОВЛЯЕМ ВИЗУАЛИЗАЦИЮ И ОЧИЩАЕМ ФОРМУ
    renderVisualization();
    commentInput.value = ''; // Очищаем поле ввода комментария
    emotionSelect.value = ''; // Сбрасываем выбор эмоции (можно поставить '---')
});


// --- Код для случайных цитат (если ты его тоже добавила) ---
const quotes = [
    "Твои эмоции — это краски, которыми ты раскрашиваешь свой мир.",
    "Позволь себе чувствовать всё.",
    "Грусть — это просто отдых перед радостью.",
    "Каждая эмоция важна.",
    "Ты — это не твои мысли, ты — тот, кто их слышит."
];

function changeQuote() {
    const quoteElement = document.getElementById('quote');
    if (quoteElement) { // Проверяем, существует ли элемент
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.innerText = `"${quotes[randomIndex]}"`;
    }
}

// Менять цитату каждые 10 секунд (если блок quote-container существует)
if (document.getElementById('quote-container')) {
    setInterval(changeQuote, 10000);
}




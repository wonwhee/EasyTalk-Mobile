function guestLogin() {
    console.log('게스트 로그인 시도');
    
    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('입력된 ID:', id);
    console.log('입력된 Password:', password);
    
    if (id === 'guest' && password === 'guest123') {
        console.log('게스트 로그인 성공');
        isAdmin = false;
        isGuest = true;
        currentUser = 'guest';
        
        // 화면 전환
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('dictionarySection').style.display = 'block';
        document.getElementById('adminStatus').style.display = 'none';
        document.getElementById('guestStatus').style.display = 'block';
        
        showAlert('👤 게스트로 로그인했습니다!', 'success');
        
        setupMainAppEvents();
        loadAllData();
        
    } else {
        console.log('게스트 로그인 실패');
        showAlert('❌ 게스트 정보가 잘못되었습니다.', 'error');
        navigator.vibrate && navigator.vibrate(200);
    }
}

function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        isAdmin = false;
        isGuest = false;
        currentUser = null;
        
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('loginId').value = '';
        document.getElementById('loginPassword').value = '';
        
        showAlert('🚪 로그아웃되었습니다.', 'info');
    }
}

function loadAllData() {
    console.log('모든 데이터 로드 시작');
    updateStats();
    loadHistory();
    
    if (isAdmin) {
        updateAIRulesList();
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
        const diffBtn = document.getElementById(`diff${aiDifficultyLevel}`);
        if (diffBtn) {
            diffBtn.classList.add('active');
        }
    }
    
    updateAIStatus();
    console.log('모든 데이터 로드 완료');
}

// ========================================
// 게스트 전용: 진짜 사전 검색 기능
// ========================================

function searchRealDictionary() {
    const word = document.getElementById('dictionaryInput').value.trim();
    
    if (!word) {
        showAlert('검색할 단어를 입력해주세요.', 'warning');
        return;
    }
    
    const wordInfo = realKoreanDictionary[word];
    const resultDiv = document.getElementById('dictionaryResult');
    const infoDiv = document.getElementById('wordInfo');
    
    if (wordInfo) {
        infoDiv.innerHTML = `
            <div style="margin-bottom: 20px; text-align: center;">
                <strong style="color: #059669; font-size: 28px;">"${word}"</strong>
                <div style="color: #6b7280; font-size: 16px; margin-top: 8px;">${wordInfo.pronunciation}</div>
            </div>
            
            <div class="word-meaning">
                📖 <strong>뜻:</strong><br>
                ${wordInfo.meaning}
            </div>
            
            <div class="example">
                💬 <strong>예문:</strong><br>
                "${wordInfo.example}"
            </div>
            
            <div class="pronunciation">
                ✨ <strong>쉬운 말:</strong> ${wordInfo.easy}
            </div>
        `;
        resultDiv.style.display = 'block';
        currentQuizWord = word;
        showAlert(`📖 "${word}" 단어를 찾았습니다!`, 'success');
        
        // 부드러운 스크롤
        setTimeout(() => {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
        
    } else {
        infoDiv.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">😔</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #dc2626;">
                    "${word}" 단어를 찾을 수 없습니다
                </div>
                <div style="color: #666; margin-bottom: 20px;">
                    현재 사전에 등록된 단어만 검색 가능합니다
                </div>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; font-size: 13px; color: #059669;">
                    <strong>검색 가능한 단어 (19개):</strong><br>
                    확인, 협조, 신청, 제출, 방문, 연락, 대기, 취소, 변경, 완료, 문의, 안내, 양해, 성함, 진료, 처방전, 수납, 접수, 예약
                </div>
            </div>
        `;
        resultDiv.style.display = 'block';
        currentQuizWord = null;
        showAlert(`❌ "${word}"을 사전에서 찾을 수 없습니다.`, 'warning');
        navigator.vibrate && navigator.vibrate([100, 50, 100]);
    }
}

// ========================================
// 게스트 전용: 단어 테스트 기능
// ========================================

function startQuiz() {
    if (!currentQuizWord || !realKoreanDictionary[currentQuizWord]) {
        showAlert('먼저 사전에서 단어를 검색해주세요.', 'warning');
        return;
    }
    
    createQuiz(currentQuizWord);
    document.getElementById('quizSection').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('quizSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

function generateRandomQuiz() {
    const words = Object.keys(realKoreanDictionary);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    createQuiz(randomWord);
    
    document.getElementById('quizSection').style.display = 'block';
    showAlert(`🎲 랜덤 단어 "${randomWord}" 테스트!`, 'info');
    
    setTimeout(() => {
        document.getElementById('quizSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

function createQuiz(word) {
    const wordInfo = realKoreanDictionary[word];
    if (!wordInfo) return;
    
    // 퀴즈 초기화
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    
    // 단어 표시
    document.getElementById('quizWord').textContent = word;
    
    // 정답과 오답 선택지 생성
    const correctAnswer = wordInfo.meaning;
    const wrongAnswers = getWrongAnswers(word, correctAnswer);
    
    // 선택지 섞기
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    // 선택지 HTML 생성
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = options.map((option, index) => `
        <div class="quiz-option touchable" onclick="selectAnswer('${word}', '${escapeHtml(option)}', '${escapeHtml(correctAnswer)}')">
            ${option.length > 60 ? option.substring(0, 60) + '...' : option}
        </div>
    `).join('');
}

function getWrongAnswers(word, correctAnswer) {
    const allMeanings = Object.values(realKoreanDictionary).map(info => info.meaning);
    const wrongAnswers = allMeanings.filter(meaning => meaning !== correctAnswer);
    
    // 랜덤하게 3개 선택
    const shuffled = wrongAnswers.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}

function selectAnswer(word, selectedAnswer, correctAnswer) {
    const options = document.querySelectorAll('.quiz-option');
    const isCorrect = selectedAnswer === correctAnswer;
    
    // 햅틱 피드백
    if (navigator.vibrate) {
        if (isCorrect) {
            navigator.vibrate(100); // 짧은 진동 (정답)
        } else {
            navigator.vibrate([100, 50, 100]); // 긴 진동 (오답)
        }
    }
    
    // 모든 선택지 색칠
    options.forEach(option => {
        const optionText = option.textContent.trim();
        const shortSelected = selectedAnswer.length > 60 ? selectedAnswer.substring(0, 60) + '...' : selectedAnswer;
        const shortCorrect = correctAnswer.length > 60 ? correctAnswer.substring(0, 60) + '...' : correctAnswer;
        
        if (optionText === shortSelected) {
            option.classList.add(isCorrect ? 'correct' : 'wrong');
        } else if (optionText === shortCorrect) {
            option.classList.add('correct');
        }
        option.style.pointerEvents = 'none';
    });
    
    // 결과 표시
    setTimeout(() => {
        showQuizResult(word, isCorrect);
    }, 1000);
}

function showQuizResult(word, isCorrect) {
    const resultDiv = document.getElementById('quizResult');
    const resultText = document.getElementById('quizResultText');
    const wordInfo = realKoreanDictionary[word];
    
    if (isCorrect) {
        resultText.innerHTML = `
            <div style="color: #059669; font-size: 24px; margin-bottom: 20px;">
                🎉 정답입니다!
            </div>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
                <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px;">"${word}"</div>
                <div style="margin-bottom: 15px;">뜻을 정확히 알고 계시네요!</div>
                <div style="color: #059669; font-weight: 600;">✨ 쉬운 말: ${wordInfo.easy}</div>
            </div>
        `;
    } else {
        resultText.innerHTML = `
            <div style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">
                😅 아쉽네요!
            </div>
            <div style="background: #fef2f2; padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;">
                <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px;">"${word}"</div>
                <div style="margin-bottom: 10px;"><strong>정답:</strong></div>
                <div style="margin-bottom: 15px; line-height: 1.5;">${wordInfo.meaning}</div>
                <div style="color: #059669; font-weight: 600;">✨ 쉬운 말: ${wordInfo.easy}</div>
            </div>
        `;
    }
    
    document.getElementById('quizContainer').style.display = 'none';
    resultDiv.style.display = 'block';
    
    showAlert(isCorrect ? '🎉 정답입니다!' : '😅 다시 공부해보세요!', isCorrect ? 'success' : 'info');
}

function hideQuiz() {
    document.getElementById('quizSection').style.display = 'none';
}

// ========================================
// 관리자 전용 함수들
// ========================================

function setDifficulty(level) {
    if (!isAdmin) {
        showAlert('❌ 관리자만 접근할 수 있습니다.', 'error');
        return;
    }
    
    aiDifficultyLevel = level;
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`diff${level}`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    const levels = { 1: '기본', 2: '보통', 3: '고급' };
    showAlert(`🤖 AI 레벨: "${levels[level]}" 설정완료`, 'success');
    
    localStorage.setItem('easytalk_mobile_ai_difficulty_level', level.toString());
    updateAIStatus();
    
    // 햅틱 피드백
    navigator.vibrate && navigator.vibrate(50);
}

function addAIRule() {
    if (!isAdmin) {
        showAlert('❌ 관리자만 접근할 수 있습니다.', 'error');
        return;
    }
    
    const original = document.getElementById('aiOriginal').value.trim();
    const converted = document.getElementById('aiConverted').value.trim();
    
    if (!original || !converted) {
        showAlert('어려운 단어와 쉬운 단어를 모두 입력해주세요.', 'warning');
        return;
    }
    
    if (original === converted) {
        showAlert('원래 단어와 바꿀 단어가 같습니다.', 'warning');
        return;
    }
    
    const aiRules = JSON.parse(localStorage.getItem('easytalk_mobile_ai_custom_rules') || '{}');
    aiRules[original] = converted;
    localStorage.setItem('easytalk_mobile_ai_custom_rules', JSON.stringify(aiRules));
    
    document.getElementById('aiOriginal').value = '';
    document.getElementById('aiConverted').value = '';
    
    showAlert(`🤖 AI 규칙 추가: "${original}" → "${converted}"`, 'success');
    updateAIRulesList();
    
    // 햅틱 피드백
    navigator.vibrate && navigator.vibrate(100);
    
    setTimeout(() => {
        const aiOriginalInput = document.getElementById('aiOriginal');
        if (aiOriginalInput) {
            aiOriginalInput.focus();
        }
    }, 300);
}

function updateAIRulesList() {
    const aiRules = JSON.parse(localStorage.getItem('easytalk_mobile_ai_custom_rules') || '{}');
    const container = document.getElementById('aiRulesList');
    const countElement = document.getElementById('aiRuleCount');
    
    if (!container || !countElement) return;
    
    countElement.textContent = Object.keys(aiRules).length;
    
    if (Object.keys(aiRules).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                <div style="font-size: 2rem; margin-bottom: 10px;">🤖</div>
                <div>추가된 AI 규칙이 없습니다.</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = Object.entries(aiRules)
        .map(([original, converted]) => `
            <div class="list-item">
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(original)} → ${escapeHtml(converted)}</div>
                    <div style="font-size: 11px; color: #666;">🤖 AI 규칙</div>
                </div>
                <button onclick="deleteAIRule('${escapeHtml(original)}')" 
                        style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px;">
                    삭제
                </button>
            </div>
        `).join('');
}

function deleteAIRule(original) {
    if (!isAdmin) return;
    
    if (confirm(`"${original}" AI 규칙을 삭제하시겠습니까?`)) {
        const aiRules = JSON.parse(localStorage.getItem('easytalk_mobile_ai_custom_rules') || '{}');
        delete aiRules[original];
        localStorage.setItem('easytalk_mobile_ai_custom_rules', JSON.stringify(aiRules));
        
        showAlert(`🗑️ AI 규칙 "${original}" 삭제됨`, 'success');
        updateAIRulesList();
        
        // 햅틱 피드백
        navigator.vibrate && navigator.vibrate([50, 30, 50]);
    }
}

// ========================================
// 받침 처리 함수
// ========================================

function hasJongseong(char) {
    if (!char || char.length !== 1) return false;
    const code = char.charCodeAt(0);
    
    if (code >= 0xAC00 && code <= 0xD7A3) {
        return (code - 0xAC00) % 28 !== 0;
    }
    
    if (/[0-9]/.test(char)) {
        const hasJongseongNums = ['1', '3', '6', '7', '8'];
        return hasJongseongNums.includes(char);
    }
    
    return false;
}

function smartWordReplace(text, original, replacement) {
    const escapedOriginal = escapeRegExp(original);
    
    const patterns = [
        {
            regex: new RegExp(`${escapedOriginal}을(\\s|$|[.!?])`, 'g'),
            replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}을$1` : `${replacement}를$1`
        },
        {
            regex: new RegExp(`${escapedOriginal}를(\\s|$|[.!?])`, 'g'),
            replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}을$1` : `${replacement}를$1`
        },
        {
            regex: new RegExp(`${escapedOriginal}은(\\s|$|[.!?])`, 'g'),
            replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}은$1` : `${replacement}는$1`
        },
        {
            regex: new RegExp(`${escapedOriginal}는(\\s|$|[.!?])`, 'g'),
            replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}은$1` : `${replacement}는$1`
        },
        {
            regex: new RegExp(`${escapedOriginal}이(\\s|$|[.!?])`, 'g'),
            replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}이$1` : `${replacement}가$1`
        },
        {
            regex: new RegExp(`${escapedOriginal}가(\\s|$|[.!?])`, 'g'),
            replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}이$1` : `${replacement}가$1`
        },
        {
            regex: new RegExp(`${escapedOriginal}(?![을를은는이가와과에게서로부터의아야])`, 'g'),
            replacement: replacement
        }
    ];
    
    patterns.forEach(pattern => {
        text = text.replace(pattern.regex, pattern.replacement);
    });
    
    return text;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\');
}

function escapeHtml(text) {
    return text.replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/\\/g, '\\\\');
}

// ========================================
// EasyTalk AI 핵심 변환 함수
// ========================================

function convertText() {
    const input = document.getElementById('textInput').value.trim();
    if (!input) {
        showAlert('변환할 텍스트를 입력해주세요.', 'warning');
        return;
    }
    
    console.log('📱 EasyTalk Mobile AI 변환 시작:', input);
    
    // AI 분석 중 표시
    showAIAnalyzing();
    
    // 햅틱 피드백
    navigator.vibrate && navigator.vibrate(50);
    
    // 모바일에서는 조금 더 빠른 반응
    setTimeout(() => {
        const result = performEasyTalkConversion(input);
        hideAIAnalyzing();
        showResult(input, result);
        addToHistory(input, result);
        
        console.log('✅ EasyTalk Mobile AI 변환 완료:', result);
    }, 1000);
}

function showAIAnalyzing() {
    document.getElementById('aiAnalyzing').style.display = 'block';
}

function hideAIAnalyzing() {
    document.getElementById('aiAnalyzing').style.display = 'none';
}

function performEasyTalkConversion(text) {
    let converted = text;
    detectedDifficultWords = [];
    
    console.log('🧠 EasyTalk Mobile AI 분석 중...');
    
    // 1. 학습된 문장 우선 적용
    const learnedSentences = JSON.parse(localStorage.getItem('easytalk_mobile_learned_sentences') || '{}');
    if (learnedSentences[text]) {
        console.log('📚 학습된 문장 사용:', learnedSentences[text]);
        return learnedSentences[text];
    }
    
    // 2. 관리자 AI 규칙 적용
    const aiRules = JSON.parse(localStorage.getItem('easytalk_mobile_ai_custom_rules') || '{}');
    for (const [original, simple] of Object.entries(aiRules)) {
        if (converted.includes(original)) {
            converted = smartWordReplace(converted, original, simple);
            detectedDifficultWords.push({
                original: original,
                converted: simple,
                source: 'admin_rule'
            });
            console.log('🔴 관리자 AI 규칙 적용:', original, '→', simple);
        }
    }
    
    // 3. EasyTalk AI 어려운 단어 감지 및 변환
    const currentAIDictionary = easyTalkAI[aiDifficultyLevel] || {};
    for (const [original, simple] of Object.entries(currentAIDictionary)) {
        if (converted.includes(original)) {
            converted = smartWordReplace(converted, original, simple);
            detectedDifficultWords.push({
                original: original,
                converted: simple,
                source: 'easytalk_ai'
            });
            console.log('🤖 EasyTalk AI 감지:', original, '→', simple);
        }
    }
    
    // 4. 기본 변환 규칙 적용
    for (const [original, simple] of Object.entries(conversionRules)) {
        if (converted.includes(original)) {
            converted = smartWordReplace(converted, original, simple);
            detectedDifficultWords.push({
                original: original,
                converted: simple,
                source: 'basic'
            });
            console.log('📝 기본 규칙 적용:', original, '→', simple);
        }
    }
    
    // 5. 존댓말 패턴 변환
    converted = convertPolitePatterns(converted);
    
    // AI 통계 업데이트
    aiStats.todayDetected += detectedDifficultWords.length;
    aiStats.autoConverted += detectedDifficultWords.filter(w => w.source === 'easytalk_ai').length;
    aiStats.totalConversions++;
    saveAIStats();
    
    console.log('🧠 EasyTalk Mobile AI 분석 완료! 감지된 단어:', detectedDifficultWords.length, '개');
    
    return converted;
}

function convertPolitePatterns(text) {
    let result = text;
    
    const politePatterns = [
        { pattern: /(\w+)하십시오/g, replacement: '$1하세요' },
        { pattern: /(\w+)합니다/g, replacement: '$1해요' },
        { pattern: /(\w+)입니다/g, replacement: '$1이에요' },
        { pattern: /(\w+)됩니다/g, replacement: '$1돼요' },
        { pattern: /(\w+)습니다/g, replacement: '$1어요' },
        { pattern: /(\w+)드립니다/g, replacement: '$1드려요' },
        { pattern: /(\w+)주십시오/g, replacement: '$1주세요' },
        { pattern: /(\w+)바랍니다/g, replacement: '$1바라요' }
    ];
    
    politePatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(result)) {
            result = result.replace(pattern, replacement);
            console.log('🤖 존댓말 패턴 변환:', pattern.source);
        }
    });
    
    return result;
}

function showResult(original, converted) {
    document.getElementById('originalText').textContent = original;
    document.getElementById('convertedText').textContent = converted;
    document.getElementById('resultSection').style.display = 'block';
    
    currentResult = converted;
    currentOriginal = original;
    
    // 감지된 단어 표시
    if (detectedDifficultWords.length > 0) {
        document.getElementById('detectedWords').style.display = 'block';
        const detectedList = document.getElementById('detectedWordsList');
        
        const sourceLabels = {
            'admin_rule': '🔴 AI규칙',
            'easytalk_ai': '🤖 EasyTalk',
            'basic': '📝 기본'
        };
        
        detectedList.innerHTML = detectedDifficultWords
            .map(word => `
                <span class="detected-word">
                    ${word.original} → ${word.converted}
                    <span style="font-size: 9px; opacity: 0.7;">(${sourceLabels[word.source]})</span>
                </span>
            `).join('');
    } else {
        document.getElementById('detectedWords').style.display = 'none';
    }
    
    // 부드러운 스크롤
    setTimeout(() => {
        document.getElementById('resultSection').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 300);
    
    updateAIStatus();
    updateStats();
}

// ========================================
// 음성 관련 함수들 (모바일 최적화)
// ========================================

function startRecording() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showAlert('음성 인식을 지원하지 않는 브라우저입니다.', 'error');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    const btn = document.getElementById('recordBtn');
    btn.classList.add('recording');
    
    // 햅틱 피드백
    navigator.vibrate && navigator.vibrate(100);
    
    recognition.onstart = function() {
        showAlert('🎤 음성 인식 시작! 말씀해주세요...', 'info');
    };
    
    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        document.getElementById('textInput').value = text;
        showAlert(`✅ 음성 인식: "${text}"`, 'success');
        
        // 햅틱 피드백
        navigator.vibrate && navigator.vibrate(50);
        
        setTimeout(() => convertText(), 500);
    };
    
    recognition.onend = function() {
        btn.classList.remove('recording');
    };
    
    recognition.onerror = function(event) {
        btn.classList.remove('recording');
        
        let errorMessage = '음성 인식 오류가 발생했습니다.';
        switch(event.error) {
            case 'no-speech':
                errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
                break;
            case 'audio-capture':
                errorMessage = '마이크에 접근할 수 없습니다.';
                break;
            case 'not-allowed':
                errorMessage = '마이크 사용 권한이 거부되었습니다.';
                break;
        }
        showAlert(errorMessage, 'error');
        
        // 오류 햅틱 피드백
        navigator.vibrate && navigator.vibrate([100, 50, 100, 50, 100]);
    };
    
    recognition.start();
}

function speakText() {
    if (!currentResult) {
        showAlert('재생할 텍스트가 없습니다.', 'warning');
        return;
    }
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentResult);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = function() {
            showAlert('🔊 음성 재생 중...', 'info');
            // 재생 시작 햅틱
            navigator.vibrate && navigator.vibrate(50);
        };
        
        utterance.onend = function() {
            console.log('음성 재생 완료');
        };
        
        utterance.onerror = function(event) {
            showAlert('음성 재생 중 오류가 발생했습니다.', 'error');
        };
        
        window.speechSynthesis.speak(utterance);
    } else {
        showAlert('이 브라우저는 음성 출력을 지원하지 않습니다.', 'error');
    }
}

function copyResult() {
    if (!currentResult) {
        showAlert('복사할 내용이 없습니다.', 'warning');
        return;
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentResult).then(() => {
            showAlert('📋 변환 결과가 복사되었습니다!', 'success');
            // 복사 성공 햅틱
            navigator.vibrate && navigator.vibrate(100);
        }).catch(() => {
            fallbackCopyText(currentResult);
        });
    } else {
        fallbackCopyText(currentResult);
    }
}

function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
        document.execCommand('copy');
        showAlert('📋 변환 결과가 복사되었습니다!', 'success');
        navigator.vibrate && navigator.vibrate(100);
    } catch (err) {
        showAlert('복사에 실패했습니다.', 'error');
    }
    
    document.body.removeChild(textarea);
}

function clearInput() {
    document.getElementById('textInput').value = '';
    document.getElementById('resultSection').style.display = 'none';
    hideAIAnalyzing();
    hideFeedback();
    currentResult = '';
    currentOriginal = '';
    detectedDifficultWords = [];
    showAlert('🗑️ 입력이 지워졌습니다.', 'info');
    
    // 지우기 햅틱
    navigator.vibrate && navigator.vibrate(50);
}

// ========================================
// 피드백 관련 함수들
// ========================================

function showFeedback() {
    document.getElementById('feedbackSection').style.display = 'block';
    setTimeout(() => {
        document.getElementById('feedbackSection').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }, 100);
}

function hideFeedback() {
    document.getElementById('feedbackSection').style.display = 'none';
}

function showWordEdit() {
    if (!isAdmin) {
        showAlert('❌ 단어 수정은 관리자만 사용할 수 있습니다.', 'warning');
        return;
    }
    
    showAlert('💡 단어별 수정은 AI 규칙 추가를 이용해주세요!', 'info');
}

function giveFeedback(rating) {
    const feedbackMessages = {
        'excellent': '🌟 완벽하다는 평가 감사합니다!',
        'good': '👍 좋다는 평가 감사합니다!',
        'ok': '😐 더 똑똑한 AI로 발전하겠습니다!'
    };
    
    if (rating === 'excellent' || rating === 'good') {
        const learnedSentences = JSON.parse(localStorage.getItem('easytalk_mobile_learned_sentences') || '{}');
        learnedSentences[currentOriginal] = currentResult;
        localStorage.setItem('easytalk_mobile_learned_sentences', JSON.stringify(learnedSentences));
        
        aiStats.accuracy = Math.min(100, aiStats.accuracy + 1);
    } else if (rating === 'ok') {
        aiStats.accuracy = Math.max(0, aiStats.accuracy - 0.5);
    }
    
    saveAIStats();
    updateAIStatus();
    
    showAlert(feedbackMessages[rating], 'success');
    hideFeedback();
    
    // 피드백 햅틱
    if (rating === 'excellent') {
        navigator.vibrate && navigator.vibrate([100, 50, 100, 50, 100]);
    } else {
        navigator.vibrate && navigator.vibrate(100);
    }
    
    setTimeout(() => {
        clearInput();
    }, 1500);
}

// ========================================
// 통계 및 히스토리 관리
// ========================================

function updateAIStatus() {
    const levels = { 1: '기본', 2: '보통', 3: '고급' };
    
    const todayElement = document.getElementById('todayDetected');
    const autoElement = document.getElementById('autoConverted');
    const levelElement = document.getElementById('currentLevel');
    const accuracyElement = document.getElementById('accuracyRate');
    
    if (todayElement) todayElement.textContent = aiStats.todayDetected;
    if (autoElement) autoElement.textContent = aiStats.autoConverted;
    if (levelElement) levelElement.textContent = levels[aiDifficultyLevel];
    if (accuracyElement) accuracyElement.textContent = Math.round(aiStats.accuracy);
}

function saveAIStats() {
    localStorage.setItem('easytalk_mobile_ai_stats', JSON.stringify(aiStats));
}

function updateStats() {
    const learnedSentences = JSON.parse(localStorage.getItem('easytalk_mobile_learned_sentences') || '{}');
    const aiRules = JSON.parse(localStorage.getItem('easytalk_mobile_ai_custom_rules') || '{}');
    
    const container = document.getElementById('statsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${aiStats.totalConversions}</div>
            <div class="stat-label">총 변환</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${isAdmin ? Object.keys(aiRules).length : Object.keys(learnedSentences).length}</div>
            <div class="stat-label">${isAdmin ? 'AI 규칙' : 'AI 학습'}</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${aiStats.todayDetected}</div>
            <div class="stat-label">감지 단어</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(aiStats.accuracy)}%</div>
            <div class="stat-label">정확도</div>
        </div>
    `;
}

function addToHistory(original, converted) {
    const history = JSON.parse(localStorage.getItem('easytalk_mobile_history') || '[]');
    
    history.unshift({
        original: original,
        converted: converted,
        detectedWords: detectedDifficultWords.length,
        timestamp: new Date().toISOString(),
        user: currentUser,
        userType: isAdmin ? 'admin' : 'guest'
    });
    
    // 최근 10개만 유지 (모바일 최적화)
    if (history.length > 10) {
        history.splice(10);
    }
    
    localStorage.setItem('easytalk_mobile_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('easytalk_mobile_history') || '[]');
    const container = document.getElementById('historyContainer');
    
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📋</div>
                <div>EasyTalk 변환 기록이 없습니다.</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    history.slice(0, 5).forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'list-item';
        
        const date = new Date(item.timestamp).toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const displayOriginal = item.original.length > 20 ? item.original.substring(0, 20) + '...' : item.original;
        const displayConverted = item.converted.length > 20 ? item.converted.substring(0, 20) + '...' : item.converted;
        
        const userIcon = item.userType === 'admin' ? '🔴' : '👤';
        
        historyItem.innerHTML = `
            <div style="flex: 1;">
                <div style="font-size: 11px; color: #666; margin-bottom: 5px;">
                    🤖 ${date} | ${item.detectedWords}개 감지 | ${userIcon} ${item.user}
                </div>
                <div style="font-size: 12px; line-height: 1.4;">
                    <div style="margin-bottom: 3px;"><strong>원본:</strong> ${displayOriginal}</div>
                    <div style="color: #059669;"><strong>변환:</strong> ${displayConverted}</div>
                </div>
            </div>
        `;
        
        container.appendChild(historyItem);
    });
}

// ========================================
// 데이터 관리 함수들
// ========================================

function exportData() {
    const userType = isAdmin ? 'admin' : 'guest';
    const allData = {
        learnedSentences: JSON.parse(localStorage.getItem('easytalk_mobile_learned_sentences') || '{}'),
        aiCustomRules: isAdmin ? JSON.parse(localStorage.getItem('easytalk_mobile_ai_custom_rules') || '{}') : 'admin_only',
        aiStats: JSON.parse(localStorage.getItem('easytalk_mobile_ai_stats') || '{}'),
        history: JSON.parse(localStorage.getItem('easytalk_mobile_history') || '[]'),
        difficultyLevel: aiDifficultyLevel,
        exportDate: new Date().toISOString(),
        version: 'EasyTalk_Mobile_v1.0_Fixed',
        user: currentUser,
        userType: userType
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    // 모바일에서 다운로드 처리
    if (navigator.share && navigator.canShare && navigator.canShare({files: [new File([dataBlob], 'backup.json')]})) {
        // Web Share API 사용
        const file = new File([dataBlob], `easytalk_mobile_backup_${currentUser}_${new Date().toISOString().slice(0, 10)}.json`, {type: 'application/json'});
        navigator.share({
            title: 'EasyTalk 모바일 백업',
            files: [file]
        }).catch(console.error);
    } else {
        // 기존 다운로드 방식
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `easytalk_mobile_backup_${currentUser}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showAlert('📤 데이터가 백업되었습니다!', 'success');
    navigator.vibrate && navigator.vibrate(100);
}

function resetAllData() {
    const userType = isAdmin ? '관리자' : '게스트';
    const confirmation = prompt(
        `정말로 ${userType} 데이터를 모두 삭제하시겠습니까?\n\n삭제하려면 "삭제"를 입력하세요:`
    );
    
    if (confirmation !== '삭제') {
        showAlert('삭제가 취소되었습니다.', 'info');
        return;
    }
    
    // 데이터 삭제
    const keysToRemove = [
        'easytalk_mobile_learned_sentences', 
        'easytalk_mobile_ai_stats', 
        'easytalk_mobile_history', 
        'easytalk_mobile_ai_difficulty_level'
    ];
    
    if (isAdmin) {
        keysToRemove.push('easytalk_mobile_ai_custom_rules');
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 전역 변수 초기화
    currentResult = '';
    currentOriginal = '';
    detectedDifficultWords = [];
    aiDifficultyLevel = 2;
    aiStats = {
        todayDetected: 0,
        autoConverted: 0,
        totalConversions: 0,
        accuracy: 100
    };
    
    showAlert(`🗑️ ${userType} 데이터가 삭제되었습니다.`, 'success');
    
    // 강한 햅틱 피드백
    navigator.vibrate && navigator.vibrate([200, 100, 200]);
    
    loadAllData();
}

// ========================================
// 유틸리티 함수
// ========================================

function showAlert(message, type = 'info') {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    const duration = type === 'error' ? 4000 : type === 'warning' ? 3000 : 2500;
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => alert.remove(), 300);
        }
    }, duration);
}

// ========================================
// PWA 및 모바일 최적화
// ========================================

// 서비스 워커 등록 (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // 간단한 서비스 워커 (오프라인 캐싱)
        const swCode = `
            const CACHE_NAME = 'easytalk-mobile-v1-fixed';
            const urlsToCache = ['/'];
            
            self.addEventListener('install', function(event) {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            return cache.addAll(urlsToCache);
                        })
                );
            });
            
            self.addEventListener('fetch', function(event) {
                event.respondWith(
                    caches.match(event.request)
                        .then(function(response) {
                            if (response) {
                                return response;
                            }
                            return fetch(event.request);
                        }
                    )
                );
            });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl)
            .then(function(registration) {
                console.log('📱 Service Worker 등록 성공:', registration.scope);
            })
            .catch(function(error) {
                console.log('Service Worker 등록 실패:', error);
            });
    });
}

// 앱 설치 프롬프트
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 설치 가능함을 사용자에게 알림
    setTimeout(() => {
        showAlert('📱 EasyTalk을 홈 화면에 추가할 수 있습니다!', 'info');
    }, 5000);
});

// 터치 제스처 지원
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartY - touchEndY;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // 위로 스와이프 - 결과 보기
            const resultSection = document.getElementById('resultSection');
            if (resultSection && resultSection.style.display === 'block') {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // 아래로 스와이프 - 입력창으로
            const textInput = document.getElementById('textInput');
            if (textInput) {
                textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                textInput.focus();
            }
        }
    }
}

// 키보드 표시/숨김 감지 (iOS Safari 대응)
function detectKeyboard() {
    const initialHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
        const currentHeight = window.innerHeight;
        const heightDifference = initialHeight - currentHeight;
        
        if (heightDifference > 150) {
            // 키보드가 올라옴
            document.body.classList.add('keyboard-open');
            console.log('키보드 감지');
        } else {
            // 키보드가 내려감
            document.body.classList.remove('keyboard-open');
        }
    });
}

detectKeyboard();

// 배터리 상태 확인 (모바일 최적화)
if ('getBattery' in navigator) {
    navigator.getBattery().then(function(battery) {
        console.log('배터리 상태:', Math.round(battery.level * 100) + '%');
        
        if (battery.level < 0.15) {
            console.log('저전력 모드 활성화');
            // 애니메이션 줄이기, 성능 최적화
        }
    });
}

// 네트워크 상태 확인
function checkNetworkStatus() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        console.log('네트워크 타입:', connection.effectiveType);
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            console.log('느린 네트워크 감지 - 최적화 모드');
        }
    }
}

// 메모리 사용량 모니터링
function checkMemoryUsage() {
    if ('memory' in performance) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        console.log(`메모리 사용량: ${usedMB}MB / ${limitMB}MB`);
        
        if (usedMB > limitMB * 0.8) {
            console.log('메모리 사용량 높음 - 최적화 필요');
            // 메모리 정리
            if (window.gc) {
                window.gc();
            }
        }
    }
}

// 주기적 성능 체크
setInterval(() => {
    checkNetworkStatus();
    checkMemoryUsage();
}, 30000); // 30초마다

// ========================================
// 접근성 및 사용성 개선
// ========================================

// 다크모드 감지
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    console.log('다크모드 감지');
    // 다크모드 대응 (필요시 스타일 조정)
}

// 폰트 크기 조정 감지
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('애니메이션 줄이기 설정 감지');
    // 애니메이션 최소화
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
}

// ========================================
// 완료 로그
// ========================================

console.log('✅ EasyTalk Mobile - 수정완료 버전 로드 성공!');
console.log('📱 주요 기능:');
console.log('  • 로그인 문제 완전 해결');
console.log('  • 모든 버튼 이벤트 연결 완료');
console.log('  • 터치 최적화 UI');
console.log('  • 햅틱 피드백 지원');
console.log('  • PWA 지원 (홈 화면 추가 가능)');
console.log('  • 모바일 성능 최적화');
console.log('🔐 로그인: EASY TALK/1234 (관리자) 또는 guest/guest123 (게스트)');
console.log('🚀 테스트: "협조 부탁드립니다" 입력 후 변환');
console.log('📖 사전 테스트: "확인" 검색 → 테스트하기');
// ========================================
// EasyTalk Mobile - 핸드폰 전용 버전 (수정완료)
// ========================================

// 전역 변수
let currentResult = '';
let currentOriginal = '';
let isAdmin = false;
let isGuest = false;
let currentUser = null;
let aiDifficultyLevel = 2;
let detectedDifficultWords = [];
let currentQuizWord = null;
let aiStats = {
    todayDetected: 0,
    autoConverted: 0,
    totalConversions: 0,
    accuracy: 100
};

// 기본 변환 규칙
const conversionRules = {
    "안녕하십니까": "안녕하세요",
    "감사드립니다": "감사해요",
    "죄송합니다": "죄송해요",
    "성함": "이름",
    "예약": "미리 정하기",
    "진료": "병원에서 보기",
    "처방전": "약 받는 종이",
    "수납": "돈 내기",
    "접수": "신청하기"
};

// EasyTalk AI: 실제 어려운 단어 데이터베이스
const easyTalkAI = {
    1: { // 기본 레벨
        "확인": "알아보기", "연락": "전화하기", "방문": "찾아가기", "대기": "기다리기",
        "신청": "요청하기", "취소": "그만두기", "변경": "바꾸기", "완료": "끝내기",
        "협조": "도움", "문의": "질문하기", "안내": "알려주기", "양해": "이해",
        "제출": "내기"
    },
    2: { // 보통 레벨
        "확인": "알아보기", "연락": "전화하기", "방문": "찾아가기", "대기": "기다리기",
        "신청": "요청하기", "취소": "그만두기", "변경": "바꾸기", "완료": "끝내기",
        "협조": "도움", "문의": "질문하기", "안내": "알려주기", "양해": "이해",
        "제출": "내기", "승차": "타기", "하차": "내리기", "환승": "갈아타기",
        "계산": "돈 세기", "결제": "돈 내기", "주문": "시키기", "배송": "보내기",
        "교환": "바꾸기", "반품": "돌려주기", "할인": "싸게", "적립": "모으기",
        "발급": "만들어 주기", "검토": "살펴보기", "승인": "허락하기", "거부": "안 된다고 하기"
    },
    3: { // 고급 레벨
        "확인": "알아보기", "연락": "전화하기", "방문": "찾아가기", "대기": "기다리기",
        "신청": "요청하기", "취소": "그만두기", "변경": "바꾸기", "완료": "끝내기",
        "협조": "도움", "문의": "질문하기", "안내": "알려주기", "양해": "이해",
        "제출": "내기", "승차": "타기", "하차": "내리기", "환승": "갈아타기",
        "계산": "돈 세기", "결제": "돈 내기", "주문": "시키기", "배송": "보내기",
        "교환": "바꾸기", "반품": "돌려주기", "할인": "싸게", "적립": "모으기",
        "발급": "만들어 주기", "검토": "살펴보기", "승인": "허락하기", "거부": "안 된다고 하기",
        "구비": "준비하기", "지참": "가져오기", "소지": "가지고 있기", "휴대": "들고 다니기",
        "착용": "입기", "탈의": "벗기", "착석": "앉기", "기립": "서기",
        "보행": "걷기", "정차": "멈추기", "출발": "떠나기", "도착": "이르기",
        "거주": "살기", "체류": "머물기", "숙박": "잠자기", "투숙": "호텔에 묵기"
    }
};

// 진짜 한국어 사전 (게스트용)
const realKoreanDictionary = {
    "확인": {
        meaning: "어떤 사실이나 내용을 자세히 알아보거나 틀림없음을 조사하여 확실하게 하는 것",
        pronunciation: "[확인]",
        example: "예약 시간을 확인해 주세요.",
        easy: "알아보기"
    },
    "협조": {
        meaning: "서로 마음과 힘을 합하여 도움",
        pronunciation: "[협ː조]",
        example: "모든 분들의 협조가 필요합니다.",
        easy: "도움"
    },
    "신청": {
        meaning: "어떤 일을 해 달라고 관계 기관이나 사람에게 청하여 요구하는 일",
        pronunciation: "[신청]",
        example: "대출 신청을 하고 싶습니다.",
        easy: "요청하기"
    },
    "제출": {
        meaning: "서류나 물건 따위를 관계 기관이나 윗사람에게 내어 바치는 것",
        pronunciation: "[제출]",
        example: "서류를 내일까지 제출해 주세요.",
        easy: "내기"
    },
    "방문": {
        meaning: "어떤 목적을 가지고 다른 사람을 찾아가거나 어떤 장소에 가는 것",
        pronunciation: "[방문]",
        example: "병원에 방문하겠습니다.",
        easy: "찾아가기"
    },
    "연락": {
        meaning: "서로 소식을 주고받거나 관계를 맺는 것",
        pronunciation: "[연락]",
        example: "언제든지 연락 주세요.",
        easy: "전화하기"
    },
    "대기": {
        meaning: "무엇을 기다리는 것",
        pronunciation: "[대기]",
        example: "잠시만 대기해 주세요.",
        easy: "기다리기"
    },
    "취소": {
        meaning: "이미 정한 것을 없던 일로 하는 것",
        pronunciation: "[취소]",
        example: "예약을 취소하고 싶습니다.",
        easy: "그만두기"
    },
    "변경": {
        meaning: "바꾸어서 고치는 것",
        pronunciation: "[변경]",
        example: "시간 변경이 가능한가요?",
        easy: "바꾸기"
    },
    "완료": {
        meaning: "일을 끝까지 마치는 것",
        pronunciation: "[완료]",
        example: "작업이 완료되었습니다.",
        easy: "끝내기"
    },
    "문의": {
        meaning: "어떤 일에 대하여 묻는 것",
        pronunciation: "[문의]",
        example: "가격 문의드립니다.",
        easy: "질문하기"
    },
    "안내": {
        meaning: "길이나 방향을 가르쳐 주거나 설명해 주는 것",
        pronunciation: "[안내]",
        example: "입구 안내를 부탁드립니다.",
        easy: "알려주기"
    },
    "양해": {
        meaning: "남의 사정을 잘 알아주고 너그러이 받아들이는 것",
        pronunciation: "[양해]",
        example: "양해 부탁드립니다.",
        easy: "이해"
    },
    "성함": {
        meaning: "다른 사람의 이름을 높여 이르는 말",
        pronunciation: "[성함]",
        example: "성함을 알려주세요.",
        easy: "이름"
    },
    "진료": {
        meaning: "의사가 환자의 병을 진찰하고 치료하는 일",
        pronunciation: "[진료]",
        example: "오전에 진료 받겠습니다.",
        easy: "병원에서 보기"
    },
    "처방전": {
        meaning: "의사가 환자에게 줄 약의 이름과 복용 방법 등을 적어 주는 종이",
        pronunciation: "[처방전]",
        example: "처방전을 가져오세요.",
        easy: "약 받는 종이"
    },
    "수납": {
        meaning: "돈이나 물건 따위를 받아서 정리하여 넣어 두는 것",
        pronunciation: "[수납]",
        example: "수납대에서 계산해 주세요.",
        easy: "돈 내기"
    },
    "접수": {
        meaning: "신청이나 신고 따위를 받아들이는 것",
        pronunciation: "[접수]",
        example: "접수를 먼저 해주세요.",
        easy: "신청하기"
    },
    "예약": {
        meaning: "미리 약속을 정하여 두는 것",
        pronunciation: "[예약]",
        example: "내일 2시에 예약했습니다.",
        easy: "미리 정하기"
    }
};

// ========================================
// 초기화 및 이벤트 설정
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 EasyTalk Mobile - 수정된 버전 로드 완료');
    setupMobileEvents();
    loadSettings();
    setupLoginEvents();
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
});

function setupLoginEvents() {
    // 로그인 버튼 이벤트
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    const loginPassword = document.getElementById('loginPassword');
    const loginId = document.getElementById('loginId');
    
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', adminLogin);
        adminLoginBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            adminLogin();
        });
    }
    
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', guestLogin);
        guestLoginBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            guestLogin();
        });
    }
    
    // 키보드 이벤트
    if (loginPassword) {
        loginPassword.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // 아이디 값에 따라 로그인 분기
                const id = document.getElementById('loginId').value.trim();
                if (id === 'EASY TALK') {
                    adminLogin();
                } else {
                    guestLogin();
                }
            }
        });
    }
    
    if (loginId) {
        loginId.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('loginPassword').focus();
            }
        });
    }
}

function setupMobileEvents() {
    // 터치 이벤트 최적화
    document.addEventListener('touchstart', function() {}, { passive: true });
    document.addEventListener('touchmove', function() {}, { passive: true });
    
    // 화면 방향 변경 대응
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            window.scrollTo(0, 0);
            adjustViewport();
        }, 500);
    });
    
    // 뷰포트 높이 조정 (모바일 주소창 대응)
    adjustViewport();
}

function adjustViewport() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function setupMainAppEvents() {
    console.log('메인 앱 이벤트 설정 시작');
    
    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // 텍스트 변환 버튼
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', convertText);
    }
    
    // 음성 녹음 버튼
    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) {
        recordBtn.addEventListener('click', startRecording);
    }
    
    // 지우기 버튼
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearInput);
    }
    
    // 음성 재생 버튼
    const speakBtn = document.getElementById('speakBtn');
    if (speakBtn) {
        speakBtn.addEventListener('click', speakText);
    }
    
    // 복사 버튼
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyResult);
    }
    
    // 피드백 버튼
    const feedbackBtn = document.getElementById('feedbackBtn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', showFeedback);
    }
    
    // 수정 버튼
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.addEventListener('click', showWordEdit);
    }
    
    // 백업 버튼
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // 초기화 버튼
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllData);
    }
    
    // 피드백 섹션 버튼들
    const feedbackButtons = document.querySelectorAll('[data-rating]');
    feedbackButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            giveFeedback(rating);
        });
    });
    
    const closeFeedbackBtn = document.getElementById('closeFeedbackBtn');
    if (closeFeedbackBtn) {
        closeFeedbackBtn.addEventListener('click', hideFeedback);
    }
    
    // 텍스트 입력 이벤트
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', function(e) {
            // 자동 높이 조절
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
    
    // 관리자 전용 이벤트
    if (isAdmin) {
        setupAdminEvents();
    }
    
    // 게스트 전용 이벤트
    if (isGuest) {
        setupGuestEvents();
    }
    
    console.log('메인 앱 이벤트 설정 완료');
}

function setupAdminEvents() {
    console.log('관리자 이벤트 설정');
    
    // 난이도 선택 버튼들
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const level = parseInt(this.getAttribute('data-level'));
            setDifficulty(level);
        });
    });
    
    // AI 규칙 추가 버튼
    const addAIRuleBtn = document.getElementById('addAIRuleBtn');
    if (addAIRuleBtn) {
        addAIRuleBtn.addEventListener('click', addAIRule);
    }
    
    // AI 규칙 입력 필드 엔터 키
    const aiOriginal = document.getElementById('aiOriginal');
    const aiConverted = document.getElementById('aiConverted');
    
    if (aiOriginal) {
        aiOriginal.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                aiConverted.focus();
            }
        });
    }
    
    if (aiConverted) {
        aiConverted.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addAIRule();
            }
        });
    }
}

function setupGuestEvents() {
    console.log('게스트 이벤트 설정');
    
    // 사전 검색 버튼
    const searchDictionaryBtn = document.getElementById('searchDictionaryBtn');
    if (searchDictionaryBtn) {
        searchDictionaryBtn.addEventListener('click', searchRealDictionary);
    }
    
    // 퀴즈 버튼들
    const startQuizBtn = document.getElementById('startQuizBtn');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }
    
    const randomQuizBtn = document.getElementById('randomQuizBtn');
    if (randomQuizBtn) {
        randomQuizBtn.addEventListener('click', generateRandomQuiz);
    }
    
    const retryQuizBtn = document.getElementById('retryQuizBtn');
    if (retryQuizBtn) {
        retryQuizBtn.addEventListener('click', generateRandomQuiz);
    }
    
    const closeQuizBtn = document.getElementById('closeQuizBtn');
    if (closeQuizBtn) {
        closeQuizBtn.addEventListener('click', hideQuiz);
    }
    
    // 사전 검색 입력 필드 엔터 키
    const dictionaryInput = document.getElementById('dictionaryInput');
    if (dictionaryInput) {
        dictionaryInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchRealDictionary();
            }
        });
    }
}

function loadSettings() {
    const savedLevel = localStorage.getItem('easytalk_mobile_ai_difficulty_level');
    if (savedLevel) {
        aiDifficultyLevel = parseInt(savedLevel);
    }
    
    const savedStats = localStorage.getItem('easytalk_mobile_ai_stats');
    if (savedStats) {
        try {
            aiStats = JSON.parse(savedStats);
        } catch (e) {
            console.log('통계 로드 실패, 기본값 사용');
        }
    }
}

// ========================================
// 로그인 관련 함수들
// ========================================

function adminLogin() {
    console.log('관리자 로그인 시도');
    
    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('입력된 ID:', id);
    console.log('입력된 Password:', password);
    
    if (id === 'EASY TALK' && password === '1234') {
        console.log('관리자 로그인 성공');
        isAdmin = true;
        isGuest = false;
        currentUser = 'EASY TALK';
        
        // 화면 전환
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('adminSection').style.display = 'block';
        document.getElementById('dictionarySection').style.display = 'none';
        document.getElementById('adminStatus').style.display = 'block';
        document.getElementById('guestStatus').style.display = 'none';
        
        showAlert('🔴 관리자로 로그인했습니다!', 'success');
        
        setupMainAppEvents();
        loadAllData();
        
    } else {
        console.log('관리자 로그인 실패');
        showAlert('❌ 관리자 정보가 잘못되었습니다.', 'error');
        navigator.vibrate && navigator.vibrate(200);
    }
}

function guestLogin() {
    console.log('게스트 로그인 시도');
    
    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('입력된 ID:', id);
    console.log('입력된 Password:', password);
    
    if (id === 'guest' && password === 'guest123') {
        console.log('게스트 로그
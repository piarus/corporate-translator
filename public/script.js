feather.replace();

let currentLang = "indonesia";
let currentOption = 1;
let apiData = null;
let isGenerating = false;

const generateBtn = document.getElementById("generateBtn");
const loadingIcon = document.getElementById("loadingIcon");
const magicIcon = document.getElementById("magicIcon");
const btnText = document.getElementById("btnText");
const outputSection = document.getElementById("outputSection");

async function callBackendAPI(inputText, target) {
    try {
        const response = await fetch('/api/poles', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputText, target }),
        });

        if (!response.ok) {
            throw new Error("Terjadi kesalahan di server.");
        }
        
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}

generateBtn.addEventListener("click", async () => {
    const textarea = document.getElementById("rawInput");
    const rawInput = textarea.value.trim();
    
    if (!rawInput) {
        textarea.classList.add("ring-2", "ring-red-500");
        setTimeout(() => textarea.classList.remove("ring-2", "ring-red-500"), 1000);
        return;
    }

    const target = document.querySelector('input[name="targetAudience"]:checked').value;
    const targetContainer = document.querySelector('input[name="targetAudience"]').closest(".grid");

    // Set Loading UI
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.classList.add("opacity-80", "cursor-not-allowed");
    loadingIcon.classList.remove("hidden");
    magicIcon.classList.add("hidden");

    // Prevent user from changing input while generating
    textarea.disabled = true;
    textarea.classList.add("opacity-50", "cursor-not-allowed");
    targetContainer.classList.add("opacity-50", "pointer-events-none");

    const loadingPhrases = [
        "Lagi mikir kata-katanya...",
        "Meredam emosi bahaya...",
        "Merangkai bahasa korporat...",
        "Bentar, mencari padanan kata...",
        "Sabar, biar karir tetep aman...",
    ];
    let phraseIndex = 0;
    btnText.innerText = loadingPhrases[phraseIndex];

    const loadingInterval = setInterval(() => {
        phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
        btnText.innerText = loadingPhrases[phraseIndex];
    }, 3000);

    outputSection.classList.add("hidden");

    // Call Backend
    apiData = await callBackendAPI(rawInput, target);

    // Reset Loading UI
    clearInterval(loadingInterval);
    isGenerating = false;
    generateBtn.disabled = false;
    generateBtn.classList.remove("opacity-80", "cursor-not-allowed");
    loadingIcon.classList.add("hidden");
    magicIcon.classList.remove("hidden");

    // Eneble user to change input
    textarea.disabled = false;
    textarea.classList.remove("opacity-50", "cursor-not-allowed");
    targetContainer.classList.remove("opacity-50", "pointer-events-none");

    if (apiData) {
        btnText.innerText = "Poles Bahasanya!";
        currentOption = 1; 
        outputSection.classList.remove("hidden");
        outputSection.classList.add("animate-fade-in-up");
        updateUI();
        setTimeout(() => outputSection.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } else {
        btnText.innerText = "Gagal! Coba Klik Lagi";
        setTimeout(() => { btnText.innerText = "Poles Bahasanya!"; }, 3000);
    }
});

function switchLang(lang) {
    currentLang = lang;
    const tabID = document.getElementById("tabID");
    const tabEN = document.getElementById("tabEN");

    if (lang === "indonesia") {
        tabID.className = "px-4 py-2 text-sm font-semibold rounded-lg tab-active transition";
        tabEN.className = "px-4 py-2 text-sm font-semibold rounded-lg tab-inactive transition hover:text-slate-700";
    } else {
        tabEN.className = "px-4 py-2 text-sm font-semibold rounded-lg tab-active transition";
        tabID.className = "px-4 py-2 text-sm font-semibold rounded-lg tab-inactive transition hover:text-slate-700";
    }
    if (apiData) updateUI();
}

function selectOption(optNumber) {
    currentOption = optNumber;
    updateUI();
}

function updateUI() {
    if (!apiData) return;

    for (let i = 1; i <= 3; i++) {
        const btn = document.getElementById(`btnOpt${i}`);
        const titleLabel = btn.querySelector(".text-xs");
        const titleText = btn.querySelector(".text-sm");

        if (i === currentOption) {
            btn.className = "p-3 rounded-xl border text-left transition-all border-blue-500 bg-blue-50 shadow-sm";
            titleLabel.className = "text-xs font-bold text-blue-600 uppercase tracking-wider mb-1";
            titleText.className = "text-sm font-bold text-blue-900";
        } else {
            btn.className = "p-3 rounded-xl border text-left transition-all border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800";
            titleLabel.className = "text-xs font-bold uppercase tracking-wider mb-1 text-slate-400";
            titleText.className = "text-sm font-medium";
        }
    }

    document.getElementById("opt1Title").innerText = apiData.opsi1.title;
    document.getElementById("opt2Title").innerText = apiData.opsi2.title;
    document.getElementById("opt3Title").innerText = apiData.opsi3.title;

    const selectedData = apiData[`opsi${currentOption}`];

    const resultElement = document.getElementById("resultText");
    resultElement.style.opacity = "0";
    setTimeout(() => {
        resultElement.innerText = currentLang === "indonesia" ? selectedData.indonesia : selectedData.en;
        resultElement.style.opacity = "1";
        resultElement.style.transition = "opacity 0.2s ease-in-out";
    }, 150);

    document.getElementById("analysisText").innerText = selectedData.analisis;
}

function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand("copy");
        showToast();
    } catch (err) {
        console.error("Unable to copy", err);
    }

    document.body.removeChild(textArea);
}

function showToast() {
    const toast = document.getElementById("toast");
    toast.classList.remove("opacity-0");
    setTimeout(() => {
        toast.classList.add("opacity-0");
    }, 2000);
}
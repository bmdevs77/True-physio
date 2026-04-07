const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const revealElements = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav-link");
const trackedSections = document.querySelectorAll(".section-track");

const videoModal = document.getElementById("videoModal");
const videoBackdrop = document.getElementById("videoBackdrop");
const videoClose = document.getElementById("videoClose");
const videoModalTitle = document.getElementById("videoModalTitle");
const videoOpenButtons = document.querySelectorAll(".video-open");

const chatMessages = document.getElementById("chatMessages");
const chatbotForm = document.getElementById("chatbotForm");
const chatInput = document.getElementById("chatInput");
const sendReportBtn = document.getElementById("sendReportBtn");

const doctorNumber = "201124160463";

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.14 }
);

revealElements.forEach((el) => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute("data-section");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
        });
      }
    });
  },
  { threshold: 0.45 }
);

trackedSections.forEach((section) => sectionObserver.observe(section));

videoOpenButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const title = btn.getAttribute("data-video-title") || "معاينة الفيديو";
    videoModalTitle.textContent = title;
    videoModal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
});

function closeVideoModal() {
  videoModal.classList.remove("open");
  document.body.style.overflow = "";
}

videoBackdrop.addEventListener("click", closeVideoModal);
videoClose.addEventListener("click", closeVideoModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeVideoModal();
});

/* CHATBOT */
const chatState = {
  step: 0,
  answers: {
    name: "",
    phone: "",
    age: "",
    issue: "",
    duration: "",
    severity: "",
    notes: "",
  },
};

const questions = [
  {
    key: "name",
    question: " اسمك إيه؟",
  },
  {
    key: "phone",
    question: "رقم موبايلك كام؟",
  },
  {
    key: "age",
    question: "سنك كام؟",
  },
  {
    key: "issue",
    question: "بتحس بإيه بالظبط؟ اشرحلي الشكوى الأساسية.",
  },
  {
    key: "duration",
    question: "بقالها قد إيه؟",
  },
  {
    key: "severity",
    question: "لو من 1 لـ 10، الألم شدته كام؟",
  },
  {
    key: "notes",
    question: "هل في أي تفاصيل إضافية مهمة؟ لو مفيش اكتب: لا",
  },
];

function addMessage(type, text) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function askNextQuestion() {
  if (chatState.step < questions.length) {
    typingEffect(questions[chatState.step].question);
  } else {
    addMessage("bot", "تم تجهيز التقرير. اضغط على زر إرسال التقرير للدكتور.");
    sendReportBtn.disabled = false;
  }
}

chatbotForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const value = chatInput.value.trim();
  if (!value) return;

  addMessage("user", value);

  if (chatState.step < questions.length) {
    const currentKey = questions[chatState.step].key;
    chatState.answers[currentKey] = value;
    chatState.step++;
  }

  chatInput.value = "";

  setTimeout(() => {
    askNextQuestion();
  }, 500);
});

function buildReport() {
  const a = chatState.answers;

  return (
    `مرحباً دكتور سيف الشيخ\n\n` +
    `تقرير جديد من المساعد الذكي True physio:\n\n` +
    `الاسم: ${a.name}\n` +
    `رقم الهاتف: ${a.phone}\n` +
    `السن: ${a.age}\n` +
    `الشكوى الأساسية: ${a.issue}\n` +
    `مدة الشكوى: ${a.duration}\n` +
    `شدة الألم: ${a.severity}/10\n` +
    `ملاحظات إضافية: ${a.notes}\n`
  );
}

sendReportBtn.addEventListener("click", () => {
  const report = buildReport();
  const whatsappURL = `https://wa.me/${doctorNumber}?text=${encodeURIComponent(report)}`;
  window.open(whatsappURL, "_blank");
});

/* start first real question after intro */
setTimeout(() => {
  askNextQuestion();
}, 500);

function typingEffect(text) {
  let i = 0;
  const div = document.createElement("div");
  div.className = "msg bot";
  chatMessages.appendChild(div);

  const interval = setInterval(() => {
    div.textContent += text[i];
    i++;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (i >= text.length) clearInterval(interval);
  }, 20);
}
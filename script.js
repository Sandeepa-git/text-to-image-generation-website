const form = document.querySelector(".prompt-form");
const gallery = document.getElementById("gallery-grid");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = themeToggleBtn.querySelector("i");
const promptInput = form.querySelector(".prompt-input");
const diceBtn = form.querySelector(".prompt-button");

const API_TOKEN = "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";

const modelMap = {
  model1: "black-forest-labs/FLUX.1-dev",
  model2: "black-forest-labs/FLUX.1-schnell",
  model3: "stabilityai/stable-diffusion-xl-base-1.0",
  model4: "runwayml/stable-diffusion-v1-5",
  model5: "prompthero/openjourney"
};

const randomPrompts = [
  "A serene mountain landscape at sunrise",
  "Futuristic city with flying cars",
  "A cute robot reading a book in a garden",
  "Mystical forest glowing with bioluminescent plants",
  "An astronaut surfing a giant wave on an alien planet",
  "Vintage steam train traveling through snowy mountains",
  "Cyberpunk warrior standing on neon-lit rooftop",
  "A magical library floating in the clouds",
  "A dragon curled around an ancient castle tower",
  "Underwater scene with colorful coral reefs and fish"
];

diceBtn.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * randomPrompts.length);
  promptInput.value = randomPrompts[randomIndex];
});

async function generateImage(prompt, modelId) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      options: { wait_for_model: true },
      parameters: {
        guidance_scale: 7.5,
        num_inference_steps: 30
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selects = form.querySelectorAll("select");
  for (const select of selects) {
    if (!select.value) {
      alert("Please select all options.");
      return;
    }
  }

  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("Please enter a prompt.");
    return;
  }

  const modelSelect = selects[0].value;
  const imageCount = parseInt(selects[1].value);

  gallery.style.display = "grid";
  gallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    const spinnerCard = document.createElement("div");
    spinnerCard.className = "img-card";
    spinnerCard.innerHTML = `<div class="spinner"></div>`;
    gallery.appendChild(spinnerCard);
  }

  try {
    const images = [];
    for (let i = 0; i < imageCount; i++) {
      const imgSrc = await generateImage(prompt, modelMap[modelSelect]);
      images.push(imgSrc);
    }

    gallery.innerHTML = "";

    images.forEach((imgSrc, i) => {
      const imgCard = document.createElement("div");
      imgCard.className = "img-card";

      if (!imgSrc) {
        imgCard.innerHTML = `<p style="color: red;">Image not available</p>`;
      } else {
        imgCard.innerHTML = `
          <img src="${imgSrc}" alt="Generated Image" class="result-img" />
          <div class="image-overlay">
            <button class="img-download-btn" title="Download Image">
              <i class="fa-solid fa-download"></i>
            </button>
          </div>
        `;

        imgCard.querySelector(".img-download-btn").addEventListener("click", () => {
          const link = document.createElement("a");
          link.href = imgSrc;
          link.download = `generated_image_${i + 1}.png`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        });
      }

      gallery.appendChild(imgCard);
    });
  } catch (error) {
    console.error("Image generation failed:", error);
    gallery.innerHTML = `<p style="color: red; text-align: center;">Failed to generate images: ${error.message}</p>`;
  }
});

themeToggleBtn.addEventListener("click", () => {
  const body = document.body;
  const isDark = body.classList.contains("dark-theme");

  if (isDark) {
    body.classList.replace("dark-theme", "light-theme");
    themeIcon.classList.replace("fa-moon", "fa-sun");
  } else {
    body.classList.replace("light-theme", "dark-theme");
    themeIcon.classList.replace("fa-sun", "fa-moon");
  }
});

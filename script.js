document.addEventListener("DOMContentLoaded", () => {
  setupPasswordGate();
  const usernameInput = document.getElementById("username");
  const searchBtn = document.getElementById("search-btn"); // assuming you have a button

  usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      getUser();
    }
  });
});
function setupPasswordGate() {
  const overlay = document.getElementById("pw-overlay");
  const input = document.getElementById("pw-input");
  const submit = document.getElementById("pw-submit");
  const error = document.getElementById("pw-error");

  setTimeout(() => input.focus(), 100);

  submit.addEventListener("click", tryPassword);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryPassword();
  });

  async function tryPassword() {
    const val = input.value.trim();
    if (!val) {
      showError("Please enter the password.");
      return;
    }
    const hash = await sha256(val);
    const STORED_HASH = "92f0d53bff1dce7dc31c0f9108362641e592868fdd5b127f45aad9471e3a0342";
    if (hash === STORED_HASH) {
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden", "true");
      input.value = "";
      showToast("Access granted");
    } else {
      showError("Incorrect password.");
      showToast('Access Denied');
      input.value = "";
      input.style.borderColor = 'red'
      
      input.focus();
      setTimeout(() => {
        input.style.borderColor = "";
        error.textContent = "";
      }, 5000);

    }
  }

  function showError(msg) {
    error.textContent = msg;
  }
}

async function sha256(message) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getUser() {
  const username = document.getElementById("username").value.trim();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  if (!username) return;
  try {
    const userRes = await fetch(`https://roblox.tasg12.workers.dev/?target=${encodeURIComponent(username)}`);
    const userData = await userRes.json();
    if (!userData.data || userData.data.length === 0) {
      resultsDiv.innerHTML = "<p>User not found.</p>";
      return;
    }
    const user = userData.data[0];
    const userId = user.id;
    const displayName = user.displayName;
    const avatarRes = await fetch(`https://roblox.tasg12.workers.dev/?avatar=${userId}`);
    const avatarData = await avatarRes.json();
    const avatarUrl = avatarData.data[0].imageUrl;
    resultsDiv.innerHTML = `
      <div class="results-card">
        <div class="avatar">
          <img src="${avatarUrl}" alt="Avatar"/>
          <button class="copy-btn" onclick="copyImage('${avatarUrl}')">
            <span class="iconify" data-icon="ic:round-content-copy"></span>
          </button>
        </div>
        <div class="info">
          <p>ID: ${userId} 
            <button class="copy-btn" onclick="copyText('${userId}')">
              <span class="iconify" data-icon="ic:round-content-copy"></span>
            </button>
          </p>
          <p>Username: ${username} 
            <button class="copy-btn" onclick="copyText('${username}')">
              <span class="iconify" data-icon="ic:round-content-copy"></span>
            </button>
          </p>
          <p>Display Name: ${displayName} 
            <button class="copy-btn" onclick="copyText('${displayName}')">
              <span class="iconify" data-icon="ic:round-content-copy"></span>
            </button>
          </p>
        </div>
      </div>
    `;
  } catch (e) {
    resultsDiv.innerHTML = "<p>Error fetching data.</p>";
    console.error(e);
  }
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
  showToast("Copied: " + text);
}

async function copyImage(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  const item = new ClipboardItem({ "image/png": blob });
  await navigator.clipboard.write([item]);
  showToast("Avatar image copied!");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
}

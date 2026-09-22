import { $ } from "./html.js";

export function confirmDialog({ message, yes, no }) {
  const dialog = $("#confirm");
  $("#confirm-message").textContent = message;
  $("#confirm-yes").textContent = yes;
  $("#confirm-no").textContent = no;
  return new Promise((resolve) => {
    const answer = (event) => {
      const choice = event.target.dataset.answer;
      if (!choice) return;
      dialog.removeEventListener("click", answer);
      dialog.close();
      resolve(choice === "yes");
    };
    dialog.addEventListener("click", answer);
    dialog.addEventListener("cancel", () => resolve(false), { once: true });
    dialog.showModal();
  });
}

let toastTimer;
export function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    element.hidden = true;
  }, 5000);
}

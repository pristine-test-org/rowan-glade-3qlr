import "./style.css";
import { type Role, roleOf, supabase } from "./supabase";

// /login, /admin and /manager: each signs in one role, then goes to the landing page.
const pageRole = document.body.dataset.role as Role;
const form = document.querySelector<HTMLFormElement>("#signin")!;
const error = document.querySelector<HTMLParagraphElement>("#error")!;

function fail(message: string) {
  error.textContent = message;
  error.hidden = false;
}

const {
  data: { session },
} = await supabase.auth.getSession();
if (session && roleOf(session.user) === pageRole) location.replace("/");
else document.body.hidden = false;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.hidden = true;
  const fields = new FormData(form);
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: String(fields.get("email")),
    password: String(fields.get("password")),
  });
  if (signInError) return fail(signInError.message === "Invalid login credentials" ? "Wrong email or password." : signInError.message);
  if (roleOf(data.user) !== pageRole) {
    await supabase.auth.signOut();
    return fail(`That isn't ${pageRole === "admin" ? "an" : "a"} ${pageRole} account.`);
  }
  location.replace("/");
});

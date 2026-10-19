import "./style.css";
import type { Session } from "@supabase/supabase-js";
import { roleLabel, roleOf, supabase } from "./supabase";

const list = document.querySelector<HTMLUListElement>("#todos")!;

function show(items: string[], muted = false) {
  list.replaceChildren(
    ...items.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      if (muted) li.className = "muted";
      return li;
    }),
  );
}

async function open(session: Session) {
  const role = roleOf(session.user);
  document.querySelector("#who")!.textContent = `${session.user.email} · ${role ? roleLabel[role] : "No role"}`;
  document.querySelector("#signout")!.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.replace(role === "admin" || role === "manager" ? `/${role}` : "/login");
  });
  document.body.hidden = false;

  const { data, error } = await supabase
    .from("todos")
    .select("title, done")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) show([`Couldn't reach the list: ${error.message}`], true);
  else if (!data.length) show(["The list is empty."], true);
  else show(data.map((t) => (t.done ? `✓ ${t.title}` : t.title)));
}

// The whole page sits behind a sign-in: a signed-out visitor goes to the customer login.
const {
  data: { session },
} = await supabase.auth.getSession();
if (session) await open(session);
else location.replace("/login");

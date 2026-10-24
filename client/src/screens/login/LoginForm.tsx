import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const { signIn } = useAuth();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true);
    setMessage("");
    try {
      const result = await signIn({
        email: String(values.get("email") ?? "").trim(),
        password: String(values.get("password") ?? ""),
        remember: values.get("remember") === "on",
      });
      if (!result.data) setMessage(result.response?.status === 401 ? "Email o contraseña incorrectos." : "No pudimos iniciar sesión. Intentá de nuevo.");
    } catch {
      setMessage("No pudimos conectar con el servidor. Intentá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-16 flex flex-1 flex-col lg:mt-16 lg:flex-none">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="Ingresá tu email" className="w-full rounded-xl bg-white px-4 py-3.5 text-[#293446] outline-none placeholder:text-[#939ba5] focus-visible:ring-2 focus-visible:ring-[#791a30]" />
      </div>
      <div className="mt-5">
        <label htmlFor="password" className="mb-2 block text-sm font-medium">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Ingresá tu contraseña" className="w-full rounded-xl bg-white px-4 py-3.5 text-[#293446] outline-none placeholder:text-[#939ba5] focus-visible:ring-2 focus-visible:ring-[#791a30]" />
      </div>
      <label className="mt-5 flex w-fit cursor-pointer items-center gap-2 text-sm text-[#617083]">
        <input type="checkbox" name="remember" className="size-4 accent-[#791a30]" /> Recordarme durante 7 días
      </label>
      {message && <p role="alert" className="mt-5 text-sm text-[#9b203d]">{message}</p>}
      <button type="submit" disabled={pending} className="mt-auto w-full rounded-xl bg-[#791a30] px-5 py-4 font-semibold text-white transition-colors hover:bg-[#641426] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30] disabled:opacity-60 lg:mt-14">
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

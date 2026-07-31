import { Router } from "express";
import { supabase } from "../lib/supabase";

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body ?? {};
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return res.status(401).json({ error: error.message });
  res.json(data.session);
});

authRouter.post("/logout", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) await supabase.auth.admin.signOut(token);
  res.status(204).end();
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  try {
    if (req.method === 'GET') {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json(tasks || []);
    }

    if (req.method === 'POST') {
      const { title, description, status, priority, assignee, due_date, estimated_hours } = req.body;
      
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: title || '',
          description: description || '',
          status: status || 'todo',
          priority: priority || 'medium',
          assignee: assignee || '',
          due_date: due_date || null,
          estimated_hours: estimated_hours || null
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(task);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { content, user_name } = req.body;
      
      const { data: note, error } = await supabase
        .from('notes')
        .insert({
          task_id: id,
          content: content || '',
          user_name: user_name || 'Anonymous'
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(note);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
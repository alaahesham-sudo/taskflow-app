import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { content, author } = req.body;

      const { data: note, error } = await supabase
        .from('notes')
        .insert({
          task_id: id,
          content,
          author: author || 'Manager'
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activity_log').insert({
        task_id: id,
        action: 'note_added',
        details: `Note added: ${content.substring(0, 50)}...`,
        user_name: author || 'Manager'
      });

      return res.status(201).json(note);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

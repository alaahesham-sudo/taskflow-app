import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const { id } = req.query;

  try {
    if (req.method === 'POST') {
      const { depends_on_id } = req.body;
      
      const { data: dep, error } = await supabase
        .from('dependencies')
        .insert({
          task_id: id,
          depends_on_id: depends_on_id
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(dep);
    }

    if (req.method === 'DELETE') {
      const { depends_on_id } = req.body;
      
      const { error } = await supabase
        .from('dependencies')
        .delete()
        .eq('task_id', id)
        .eq('depends_on_id', depends_on_id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
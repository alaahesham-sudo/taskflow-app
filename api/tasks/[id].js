import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .eq('task_id', id)
        .order('created_at', { ascending: false });

      const { data: deps } = await supabase
        .from('dependencies')
        .select('depends_on_id')
        .eq('task_id', id);

      const { data: blockers } = await supabase
        .from('dependencies')
        .select('task_id')
        .eq('depends_on_id', id);

      return res.status(200).json({
        ...task,
        notes: notes || [],
        dependencies: deps ? deps.map(d => d.depends_on_id) : [],
        blockers: blockers ? blockers.map(b => b.task_id) : []
      });
    }

    if (req.method === 'PUT') {
      const { data: task, error } = await supabase
        .from('tasks')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(task);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
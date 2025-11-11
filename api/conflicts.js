import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  if (req.method === 'GET') {
    try {
      const { data: dependencies, error } = await supabase
        .from('dependencies')
        .select('*, task1:tasks!dependencies_task_id_fkey(id, title, status), task2:tasks!dependencies_depends_on_task_id_fkey(id, title, status)')
        .eq('type', 'blocks');

      if (error) throw error;

      const conflicts = dependencies
        .filter(d => 
          d.task1 && 
          ['in_progress', 'done'].includes(d.task1.status) && 
          d.task2 && 
          d.task2.status !== 'done'
        )
        .map(d => ({
          task1_id: d.task1.id,
          task1_title: d.task1.title,
          task1_status: d.task1.status,
          task2_id: d.task2.id,
          task2_title: d.task2.title,
          task2_status: d.task2.status,
          type: d.type
        }));

      return res.status(200).json(conflicts);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

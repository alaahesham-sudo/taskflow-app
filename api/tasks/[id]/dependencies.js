import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'POST') {
      const { depends_on_task_id, type } = req.body;

      if (id === depends_on_task_id) {
        return res.status(400).json({ error: 'Task cannot depend on itself' });
      }

      const { data: dependency, error } = await supabase
        .from('dependencies')
        .insert({
          task_id: id,
          depends_on_task_id,
          type: type || 'blocks'
        })
        .select('*, depends_on_task:tasks!dependencies_depends_on_task_id_fkey(title)')
        .single();

      if (error) throw error;

      await supabase.from('activity_log').insert({
        task_id: id,
        action: 'dependency_added',
        details: 'Dependency added',
        user_name: 'Manager'
      });

      return res.status(201).json({
        ...dependency,
        depends_on_title: dependency.depends_on_task?.title
      });
    }

    if (req.method === 'DELETE') {
      const { depId } = req.query;
      const { error } = await supabase
        .from('dependencies')
        .delete()
        .eq('id', depId);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

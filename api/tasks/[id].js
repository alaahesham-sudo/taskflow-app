import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
      if (!task) return res.status(404).json({ error: 'Task not found' });

      const [notesRes, depsRes, blockersRes] = await Promise.all([
        supabase.from('notes').select('*').eq('task_id', id).order('created_at', { ascending: false }),
        supabase.from('dependencies').select('*, depends_on_task:tasks!dependencies_depends_on_task_id_fkey(title)').eq('task_id', id),
        supabase.from('dependencies').select('*, blocking_task:tasks!dependencies_task_id_fkey(title)').eq('depends_on_task_id', id).eq('type', 'blocks')
      ]);

      return res.status(200).json({
        ...task,
        notes: notesRes.data || [],
        dependencies: (depsRes.data || []).map(d => ({
          ...d,
          depends_on_title: d.depends_on_task?.title
        })),
        blockers: (blockersRes.data || []).map(b => ({
          ...b,
          blocking_title: b.blocking_task?.title
        }))
      });
    }

    if (req.method === 'PUT') {
      const { title, description, status, priority, assignee, progress, due_date, estimated_hours, actual_hours } = req.body;

      const { data: oldTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      const { data: task, error } = await supabase
        .from('tasks')
        .update({
          title: title ?? oldTask?.title,
          description: description ?? oldTask?.description,
          status: status ?? oldTask?.status,
          priority: priority ?? oldTask?.priority,
          assignee: assignee ?? oldTask?.assignee,
          progress: progress ?? oldTask?.progress,
          due_date: due_date ?? oldTask?.due_date,
          estimated_hours: estimated_hours ?? oldTask?.estimated_hours,
          actual_hours: actual_hours ?? oldTask?.actual_hours,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (status && oldTask && status !== oldTask.status) {
        await supabase.from('activity_log').insert({
          task_id: id,
          action: 'status_changed',
          details: `Status changed from ${oldTask.status} to ${status}`,
          user_name: assignee || 'Manager'
        });
      }

      const [notesRes, depsRes, blockersRes] = await Promise.all([
        supabase.from('notes').select('*').eq('task_id', id).order('created_at', { ascending: false }),
        supabase.from('dependencies').select('*, depends_on_task:tasks!dependencies_depends_on_task_id_fkey(title)').eq('task_id', id),
        supabase.from('dependencies').select('*, blocking_task:tasks!dependencies_task_id_fkey(title)').eq('depends_on_task_id', id).eq('type', 'blocks')
      ]);

      return res.status(200).json({
        ...task,
        notes: notesRes.data || [],
        dependencies: (depsRes.data || []).map(d => ({
          ...d,
          depends_on_title: d.depends_on_task?.title
        })),
        blockers: (blockersRes.data || []).map(b => ({
          ...b,
          blocking_title: b.blocking_task?.title
        }))
      });
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
    return res.status(500).json({ error: error.message });
  }
}

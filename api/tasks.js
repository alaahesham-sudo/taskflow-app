import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

      const tasksWithDetails = await Promise.all(tasks.map(async (task) => {
        const notesRes = await supabase.from('notes').select('*').eq('task_id', task.id).order('created_at', { ascending: false });
        const depsRes = await supabase.from('dependencies').select('*').eq('task_id', task.id);
        const blockersRes = await supabase.from('dependencies').select('*').eq('depends_on_task_id', task.id).eq('type', 'blocks');

        const dependencies = [];
        if (depsRes.data) {
          for (const dep of depsRes.data) {
            const taskRes = await supabase.from('tasks').select('title').eq('id', dep.depends_on_task_id).single();
            dependencies.push({
              ...dep,
              depends_on_title: taskRes.data?.title || 'Unknown'
            });
          }
        }

        const blockers = [];
        if (blockersRes.data) {
          for (const blocker of blockersRes.data) {
            const taskRes = await supabase.from('tasks').select('title').eq('id', blocker.task_id).single();
            blockers.push({
              ...blocker,
              blocking_title: taskRes.data?.title || 'Unknown'
            });
          }
        }

        return {
          ...task,
          notes: notesRes.data || [],
          dependencies: dependencies,
          blockers: blockers
        };
      }));

      return res.status(200).json(tasksWithDetails);
    }

    if (req.method === 'POST') {
      const { title, description, status, priority, assignee, due_date, estimated_hours } = req.body;
      
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title,
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

      await supabase.from('activity_log').insert({
        task_id: task.id,
        action: 'created',
        details: `Task "${title}" created`,
        user_name: assignee || 'Manager'
      });

      return res.status(201).json({ ...task, notes: [], dependencies: [], blockers: [] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

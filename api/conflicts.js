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
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) throw error;

      const conflicts = [];
      const taskMap = new Map();
      
      tasks.forEach(task => {
        if (task.assignee && task.status !== 'done') {
          if (!taskMap.has(task.assignee)) {
            taskMap.set(task.assignee, []);
          }
          taskMap.get(task.assignee).push(task);
        }
      });

      taskMap.forEach((userTasks, assignee) => {
        if (userTasks.length > 3) {
          conflicts.push({
            type: 'overload',
            assignee: assignee,
            count: userTasks.length,
            tasks: userTasks.map(t => t.id)
          });
        }
      });

      return res.status(200).json(conflicts);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
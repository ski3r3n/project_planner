// app/api/dev/seed/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const today = new Date(now).toISOString().split('T')[0];
  const tomorrow = new Date(now + oneDay).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(now + oneDay * 2).toISOString().split('T')[0];
  const threeDaysLater = new Date(now + oneDay * 3).toISOString().split('T')[0];

  // 1️⃣ Create dummy project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,
      name: 'New Demo Project',
      description: 'A test project for development purposes.',
    })
    .select()
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: projectError?.message ?? 'Failed to create project' }, { status: 500 });
  }

  // 👇 NEW STEP: Add the project creator to project_members
  const { error: memberError } = await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.id,
      role: 'owner', // or 'admin', 'member' - choose an appropriate default role
    });

  if (memberError) {
    return NextResponse.json({ error: memberError.message ?? 'Failed to add project owner as member' }, { status: 500 });
  }
  // 👆 END NEW STEP

  // 2️⃣ Create associated dummy tasks
  const dummyTasks = [
    {
      title: 'Set Up Git Repo',
      description: 'Initialize repo and push starter files.',
      start_time: today,
      end_time: tomorrow,
      status: 'done',
      assigned_to: user.id,
    },
    {
      title: 'Build Login Page',
      description: 'Create login UI and hook it to Supabase Auth.',
      start_time: tomorrow,
      end_time: dayAfterTomorrow,
      status: 'in-progress',
      assigned_to: user.id,
    },
    {
      title: 'Integrate Calendar View',
      description: 'Use FullCalendar or similar to show tasks.',
      start_time: dayAfterTomorrow,
      end_time: threeDaysLater,
      status: 'todo',
      assigned_to: user.id,
    },
  ];

  const { error: taskError } = await supabase.from('tasks').insert(
    dummyTasks.map((task) => ({
      ...task,
      project_id: project.id,
    }))
  );

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Dummy project and tasks created.', projectId: project.id });
}
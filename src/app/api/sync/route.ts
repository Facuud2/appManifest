import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope'); // 'facu' | 'maia' | 'shared' | null

    let whereClause = '';
    const args: string[] = [];

    if (scope) {
      whereClause = 'WHERE user_id = ?';
      args.push(scope);
    }

    const [
      journalsRes,
      goalsRes,
      stepsRes,
      eventsRes,
      signsRes,
      storiesRes,
      futuresRes,
      releasesRes,
      affirmationsRes,
    ] = await Promise.all([
      turso.execute({ sql: `SELECT * FROM journal_entries ${whereClause} ORDER BY created_at DESC;`, args }),
      turso.execute({ sql: `SELECT * FROM goals ${whereClause} ORDER BY created_at DESC;`, args }),
      turso.execute({ sql: `SELECT * FROM goal_steps ${whereClause} ORDER BY created_at ASC;`, args }),
      turso.execute({ sql: `SELECT * FROM agenda_events ${whereClause} ORDER BY date ASC, time ASC;`, args }),
      turso.execute({ sql: `SELECT * FROM manifestation_signs ${whereClause} ORDER BY date DESC;`, args }),
      turso.execute({ sql: `SELECT * FROM success_stories ${whereClause} ORDER BY manifested_date DESC;`, args }),
      turso.execute({ sql: `SELECT * FROM future_manifestations ${whereClause} ORDER BY created_at DESC;`, args }),
      turso.execute({ sql: `SELECT * FROM release_entries ${whereClause} ORDER BY created_at DESC;`, args }),
      turso.execute({ sql: `SELECT * FROM affirmations ${whereClause} ORDER BY repeat_count DESC, created_at DESC;`, args }),
    ]);

    const journalEntries = journalsRes.rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      author: r.author as string,
      title: r.title as string,
      content: r.content as string,
      entryType: r.entry_type as string,
      mood: r.mood ? (r.mood as string) : undefined,
      gratitudeItems: r.gratitude_items ? JSON.parse(r.gratitude_items as string) : undefined,
      affirmations: r.affirmations ? JSON.parse(r.affirmations as string) : undefined,
      tags: r.tags ? JSON.parse(r.tags as string) : [],
      goalReferences: r.goal_references ? JSON.parse(r.goal_references as string) : undefined,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }));

    const goals = goalsRes.rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      author: r.author as string,
      title: r.title as string,
      description: (r.description as string) || '',
      category: r.category as string,
      motivation: r.motivation as string,
      status: r.status as string,
      targetDate: (r.target_date as string) || undefined,
      createdAt: r.created_at as string,
      completedAt: (r.completed_at as string) || undefined,
    }));

    const goalSteps = stepsRes.rows.map((r) => ({
      id: r.id as string,
      goalId: r.goal_id as string,
      userId: r.user_id as string,
      title: r.title as string,
      description: (r.description as string) || undefined,
      completed: Boolean(r.completed),
      completedAt: (r.completed_at as string) || undefined,
      createdAt: r.created_at as string,
    }));

    const agendaEvents = eventsRes.rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      author: r.author as string,
      title: r.title as string,
      description: (r.description as string) || undefined,
      date: r.date as string,
      time: (r.time as string) || undefined,
      completed: Boolean(r.completed),
      goalId: (r.goal_id as string) || undefined,
      createdAt: r.created_at as string,
    }));

    const manifestationSigns = signsRes.rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      author: r.author as string,
      title: r.title as string,
      signType: r.sign_type as string,
      description: (r.description as string) || '',
      date: r.date as string,
      linkedGoalId: (r.linked_goal_id as string) || undefined,
      feeling: (r.feeling as string) || '',
      createdAt: r.created_at as string,
    }));

    const successStories = storiesRes.rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      author: r.author as string,
      title: r.title as string,
      goalId: (r.goal_id as string) || undefined,
      manifestedDate: r.manifested_date as string,
      story: r.story as string,
      signsEncountered: r.signs_encountered ? JSON.parse(r.signs_encountered as string) : [],
      mindsetShift: (r.mindset_shift as string) || '',
      gratitudeNote: (r.gratitude_note as string) || '',
      createdAt: r.created_at as string,
    }));

    const futureManifestations = futuresRes.rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      author: r.author as string,
      title: r.title as string,
      horizon: r.horizon as string,
      targetDate: (r.target_date as string) || undefined,
      visionText: r.vision_text as string,
      letterToFutureSelf: (r.letter_to_future_self as string) || undefined,
      isSealed: Boolean(r.is_sealed),
      createdAt: r.created_at as string,
    }));

    const releaseEntries = releasesRes.rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      content: r.content as string,
      reflection: r.reflection ? JSON.parse(r.reflection as string) : undefined,
      createdAt: r.created_at as string,
      releasedAt: (r.released_at as string) || undefined,
      status: r.status as string,
    }));

    const affirmations = affirmationsRes.rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      author: r.author as string,
      text: r.text as string,
      repeatCount: Number(r.repeat_count || 0),
      category: (r.category as string) || undefined,
      createdAt: r.created_at as string,
      lastRepeatedAt: (r.last_repeated_at as string) || undefined,
      pinned: Boolean(r.pinned),
      order: r.order_index != null ? Number(r.order_index) : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        journalEntries,
        goals,
        goalSteps,
        agendaEvents,
        manifestationSigns,
        successStories,
        futureManifestations,
        releaseEntries,
        affirmations,
      },
    });
  } catch (error) {
    console.error('Error fetching from Turso:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entity, action, data, id } = body;

    if (action === 'delete') {
      const tableMap: Record<string, string> = {
        journal: 'journal_entries',
        goal: 'goals',
        step: 'goal_steps',
        event: 'agenda_events',
        sign: 'manifestation_signs',
        story: 'success_stories',
        future: 'future_manifestations',
        release: 'release_entries',
        affirmation: 'affirmations',
      };

      const table = tableMap[entity];
      if (table && id) {
        await turso.execute({
          sql: `DELETE FROM ${table} WHERE id = ?;`,
          args: [id],
        });
      }

      return NextResponse.json({ success: true });
    }

    // Save / Upsert
    if (entity === 'journal') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO journal_entries (
          id, user_id, author, title, content, entry_type, mood, gratitude_items, affirmations, tags, goal_references, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.userId || 'facu',
          data.author || 'Facu',
          data.title,
          data.content,
          data.entryType,
          data.mood || null,
          data.gratitudeItems ? JSON.stringify(data.gratitudeItems) : null,
          data.affirmations ? JSON.stringify(data.affirmations) : null,
          JSON.stringify(data.tags || []),
          data.goalReferences ? JSON.stringify(data.goalReferences) : null,
          data.createdAt,
          data.updatedAt,
        ],
      });
    } else if (entity === 'goal') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO goals (
          id, user_id, author, title, description, category, motivation, status, target_date, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.userId || 'facu',
          data.author || 'Facu',
          data.title,
          data.description || '',
          data.category,
          data.motivation,
          data.status,
          data.targetDate || null,
          data.createdAt,
          data.completedAt || null,
        ],
      });
    } else if (entity === 'step') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO goal_steps (
          id, goal_id, user_id, title, description, completed, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.goalId,
          data.userId || 'facu',
          data.title,
          data.description || null,
          data.completed ? 1 : 0,
          data.completedAt || null,
          data.createdAt,
        ],
      });
    } else if (entity === 'event') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO agenda_events (
          id, user_id, author, title, description, date, time, completed, goal_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.userId || 'facu',
          data.author || 'Facu',
          data.title,
          data.description || null,
          data.date,
          data.time || null,
          data.completed ? 1 : 0,
          data.goalId || null,
          data.createdAt,
        ],
      });
    } else if (entity === 'sign') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO manifestation_signs (
          id, user_id, author, title, sign_type, description, date, linked_goal_id, feeling, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.userId || 'facu',
          data.author || 'Facu',
          data.title,
          data.signType,
          data.description || '',
          data.date,
          data.linkedGoalId || null,
          data.feeling || '',
          data.createdAt,
        ],
      });
    } else if (entity === 'story') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO success_stories (
          id, user_id, author, title, goal_id, manifested_date, story, signs_encountered, mindset_shift, gratitude_note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.userId || 'facu',
          data.author || 'Facu',
          data.title,
          data.goalId || null,
          data.manifestedDate,
          data.story,
          JSON.stringify(data.signsEncountered || []),
          data.mindsetShift || '',
          data.gratitudeNote || '',
          data.createdAt,
        ],
      });
    } else if (entity === 'future') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO future_manifestations (
          id, user_id, author, title, horizon, target_date, vision_text, letter_to_future_self, is_sealed, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.userId || 'facu',
          data.author || 'Facu',
          data.title,
          data.horizon,
          data.targetDate || null,
          data.visionText,
          data.letterToFutureSelf || null,
          data.isSealed ? 1 : 0,
          data.createdAt,
        ],
      });
    } else if (entity === 'release') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO release_entries (
          id, user_id, content, reflection, created_at, released_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.userId || 'facu',
          data.content,
          data.reflection ? JSON.stringify(data.reflection) : null,
          data.createdAt,
          data.releasedAt || null,
          data.status,
        ],
      });
    } else if (entity === 'affirmation') {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO affirmations (
          id, user_id, author, text, repeat_count, category, created_at, last_repeated_at, pinned, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          data.id,
          data.userId || 'facu',
          data.author || 'Facu',
          data.text,
          Number(data.repeatCount || 0),
          data.category || null,
          data.createdAt,
          data.lastRepeatedAt || null,
          data.pinned ? 1 : 0,
          data.order != null ? Number(data.order) : 0,
        ],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving to Turso:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

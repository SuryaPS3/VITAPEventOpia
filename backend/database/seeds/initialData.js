import sql from 'mssql';
import bcrypt from 'bcryptjs';

// Utilities
async function tableExists(pool, name) {
  const r = await pool.request()
    .input('t', sql.NVarChar, name)
    .query(`SELECT 1 FROM sys.tables WHERE name = @t`);
  return r.recordset.length > 0;
}

async function getTableColumns(pool, tableName) {
  const res = await pool.request()
    .input('t', sql.NVarChar, tableName)
    .query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = @t
    `);
  const map = new Map();
  res.recordset.forEach(c => {
    map.set(c.COLUMN_NAME.toLowerCase(), {
      name: c.COLUMN_NAME,
      type: c.DATA_TYPE,
      nullable: c.IS_NULLABLE === 'YES'
    });
  });
  return map;
}

function inferSqlType(colType) {
  switch ((colType || '').toLowerCase()) {
    case 'int': return sql.Int;
    case 'bigint': return sql.BigInt;
    case 'bit': return sql.Bit;
    case 'date': return sql.Date;
    case 'datetime': return sql.DateTime;
    case 'datetime2': return sql.DateTime2;
    case 'time': return sql.Time;
    case 'decimal': return sql.Decimal(10, 2);
    case 'float': return sql.Float;
    case 'nvarchar': return sql.NVarChar;
    case 'varchar': return sql.VarChar;
    case 'ntext':
    case 'text': return sql.NVarChar(sql.MAX);
    default: return sql.NVarChar;
  }
}

async function insertAdaptive(pool, table, values) {
  const colsMap = await getTableColumns(pool, table);
  const matched = [];
  const request = pool.request();
  let i = 0;

  for (const [key, val] of Object.entries(values)) {
    const col = colsMap.get(key.toLowerCase());
    if (!col) continue;
    const param = `p${i++}`;
    request.input(param, inferSqlType(col.type), val);
    matched.push({ column: col.name, param });
  }

  if (matched.length === 0) {
    console.log(`ℹ️ Skipping insert into ${table}: no matching columns`);
    return;
  }

  const colsSql = matched.map(m => `[${m.column}]`).join(', ');
  const valsSql = matched.map(m => `@${m.param}`).join(', ');
  await request.query(`INSERT INTO dbo.[${table}] (${colsSql}) VALUES (${valsSql})`);
}

async function existsBy(pool, table, whereClause, inputs = []) {
  const req = pool.request();
  inputs.forEach(({ name, type, value }) => req.input(name, type || sql.NVarChar, value));
  const res = await req.query(`SELECT 1 FROM dbo.[${table}] WHERE ${whereClause}`);
  return res.recordset.length > 0;
}

async function getIdBy(pool, table, whereClause, inputs = []) {
  const req = pool.request();
  inputs.forEach(({ name, type, value }) => req.input(name, type || sql.NVarChar, value));
  const res = await req.query(`SELECT TOP 1 id FROM dbo.[${table}] WHERE ${whereClause}`);
  return res.recordset.length ? res.recordset[0].id : null;
}

// Seeders
async function seedUsers(pool) {
  console.log('👤 Seeding Users...');
  const upsertUser = async ({ email, password, first, last, role }) => {
    if (await existsBy(pool, 'Users', 'email = @email', [{ name: 'email', value: email }])) {
      console.log(`ℹ️ User exists: ${email}`);
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    await insertAdaptive(pool, 'Users', {
      email,
      password_hash: hash,
      first_name: first,
      last_name: last,
      role,
      is_active: 1
    });
    console.log(`✅ User added: ${email}`);
  };

  await upsertUser({ email: 'admin@vitap.ac.in', password: 'admin123', first: 'System', last: 'Admin', role: 'admin' });
  await upsertUser({ email: 'head@vitap.ac.in', password: 'head123', first: 'Assistant', last: 'Director', role: 'department_head' });
  await upsertUser({ email: 'faculty@vitap.ac.in', password: 'faculty123', first: 'Club', last: 'Faculty', role: 'club_faculty' });
  await upsertUser({ email: 'student@vitap.ac.in', password: 'student123', first: 'Student', last: 'Member', role: 'club_member' });
  
}

async function seedClubs(pool) {
  if (!(await tableExists(pool, 'Clubs'))) return;
  console.log('🏷️ Seeding Clubs...');

  const cols = await getTableColumns(pool, 'Clubs');
  const nameCol = cols.has('club_name') ? 'club_name'
                : cols.has('name') ? 'name'
                : cols.has('title') ? 'title'
                : null;
  const descCol = cols.has('description') ? 'description'
                : cols.has('details') ? 'details'
                : cols.has('about') ? 'about'
                : null;
  const statusCol = cols.has('status') ? 'status'
                  : cols.has('is_active') ? 'is_active'
                  : null;
  const emailCol = cols.has('club_email') ? 'club_email' : null; // ← Added this

  if (!nameCol) {
    console.log('ℹ️ Skipping Clubs seed: no name/title column');
    return;
  }

  const clubName = 'Tech Club';
  const exists = await existsBy(pool, 'Clubs', `[${nameCol}] = @club`, [{ name: 'club', value: clubName }]);
  if (exists) {
    console.log('ℹ️ Club exists: Tech Club');
    return;
  }

  const row = { [nameCol]: clubName };
  if (descCol) row[descCol] = 'Technology enthusiasts club';
  if (statusCol) row[statusCol] = statusCol === 'is_active' ? 1 : 'active';
  if (emailCol) row[emailCol] = 'tech@vitap.ac.in'; // ← Added this line

  await insertAdaptive(pool, 'Clubs', row);
  console.log('✅ Club added: Tech Club');
}


async function seedClubMembers(pool) {
  if (!(await tableExists(pool, 'ClubMembers'))) return;
  console.log('👥 Seeding ClubMembers...');

  const clubId = await getIdBy(pool, 'Clubs', '1=1 ORDER BY id');
  const facultyId = await getIdBy(pool, 'Users', 'email = @e', [{ name: 'e', value: 'faculty@vitap.ac.in' }]);
  const studentId = await getIdBy(pool, 'Users', 'email = @e', [{ name: 'e', value: 'student@vitap.ac.in' }]);
  if (!clubId || !facultyId || !studentId) {
    console.log('ℹ️ Skipping ClubMembers: missing club/user ids');
    return;
  }

  const cols = await getTableColumns(pool, 'ClubMembers');
  const roleCol = cols.has('position') ? 'position' : cols.has('role') ? 'role' : null;

  // Faculty coordinator
  if (!(await existsBy(pool, 'ClubMembers', 'club_id=@c AND user_id=@u', [
    { name: 'c', type: sql.Int, value: clubId },
    { name: 'u', type: sql.Int, value: facultyId }
  ]))) {
    await insertAdaptive(pool, 'ClubMembers', {
      club_id: clubId,
      user_id: facultyId,
      [roleCol || '']: roleCol ? 'Coordinator' : undefined
    });
    console.log('✅ ClubMember added: faculty');
  }

  // Student member
  if (!(await existsBy(pool, 'ClubMembers', 'club_id=@c AND user_id=@u', [
    { name: 'c', type: sql.Int, value: clubId },
    { name: 'u', type: sql.Int, value: studentId }
  ]))) {
    await insertAdaptive(pool, 'ClubMembers', {
      club_id: clubId,
      user_id: studentId,
      [roleCol || '']: roleCol ? 'Member' : undefined
    });
    console.log('✅ ClubMember added: student');
  }
}

async function seedEvents(pool) {
  if (!(await tableExists(pool, 'Events'))) return;
  console.log('📅 Seeding Events...');

  // Get the faculty user ID to use as creator
  const facultyId = await getIdBy(pool, 'Users', 'email = @e', [{ name: 'e', value: 'faculty@vitap.ac.in' }]);
  const clubId = await getIdBy(pool, 'Clubs', '1=1 ORDER BY id');
  
  if (!facultyId) {
    console.log('ℹ️ Skipping Events: no faculty user');
    return;
  }

  const samples = [
    {
      title: 'Intro to Web Dev',
      category: 'Workshop',
      description: 'HTML/CSS/JS basics',
      venue: 'Auditorium',
      status: 'approved',
      event_date: '2025-10-20',
      event_time: '10:00:00',
      fee: 'Free',
      expected_attendees: 100
    },
    {
      title: 'Hackathon Night',
      category: 'Competition',
      description: 'Overnight coding challenge',
      venue: 'Lab 1',
      status: 'pending',
      event_date: '2025-11-05',
      event_time: '18:00:00',
      fee: 'Free',
      expected_attendees: 150
    }
  ];

  const cols = await getTableColumns(pool, 'Events');
  const titleCol = cols.has('title') ? 'title' : cols.has('name') ? 'name' : null;
  if (!titleCol) {
    console.log('ℹ️ Skipping Events seed: no title/name column');
    return;
  }

  for (const ev of samples) {
    const exists = await existsBy(pool, 'Events', `[${titleCol}] = @t`, [{ name: 't', value: ev.title }]);
    if (exists) {
      console.log(`ℹ️ Event exists: ${ev.title}`);
      continue;
    }

    const row = {
      [titleCol]: ev.title,
      created_by: facultyId, // ← Added this required field
      club_id: clubId, // ← Added club_id if available
      [cols.has('category') ? 'category' : '']: cols.has('category') ? ev.category : undefined,
      [cols.has('description') ? 'description' : cols.has('details') ? 'details' : '']: cols.has('description') || cols.has('details') ? ev.description : undefined,
      [cols.has('venue') ? 'venue' : cols.has('location') ? 'location' : '']: cols.has('venue') || cols.has('location') ? ev.venue : undefined,
      [cols.has('status') ? 'status' : '']: cols.has('status') ? ev.status : undefined,
      [cols.has('event_date') ? 'event_date' : cols.has('date') ? 'date' : '']: cols.has('event_date') || cols.has('date') ? ev.event_date : undefined,
      [cols.has('event_time') ? 'event_time' : cols.has('time') ? 'time' : '']: cols.has('event_time') || cols.has('time') ? ev.event_time : undefined,
      [cols.has('fee') ? 'fee' : '']: cols.has('fee') ? ev.fee : undefined,
      [cols.has('expected_attendees') ? 'expected_attendees' : '']: cols.has('expected_attendees') ? ev.expected_attendees : undefined
    };

    await insertAdaptive(pool, 'Events', row);
    console.log(`✅ Event added: ${ev.title}`);
  }
}

async function seedEventRegistrations(pool) {
  if (!(await tableExists(pool, 'EventRegistrations'))) return;
  console.log('📝 Seeding EventRegistrations...');

  const eventId = await getIdBy(pool, 'Events', '1=1 ORDER BY id');
  const studentId = await getIdBy(pool, 'Users', 'email = @e', [{ name: 'e', value: 'student@vitap.ac.in' }]);
  if (!eventId || !studentId) {
    console.log('ℹ️ Skipping EventRegistrations: missing ids');
    return;
  }

  if (await existsBy(pool, 'EventRegistrations', 'event_id=@e AND user_id=@u', [
    { name: 'e', type: sql.Int, value: eventId },
    { name: 'u', type: sql.Int, value: studentId }
  ])) {
    console.log('ℹ️ Registration exists');
    return;
  }

  await insertAdaptive(pool, 'EventRegistrations', {
    event_id: eventId,
    user_id: studentId,
    status: 'registered',
    registration_type: 'attendee' // ← Changed to 'attendee' (valid value)
  });
  console.log('✅ Registration added');
}

async function seedEventApprovals(pool) {
  if (!(await tableExists(pool, 'EventApprovals'))) return;
  console.log('✅ Seeding EventApprovals...');

  const eventId = await getIdBy(pool, 'Events', '1=1 ORDER BY id');
  const adminId = await getIdBy(pool, 'Users', 'email = @e', [{ name: 'e', value: 'admin@vitap.ac.in' }]);
  
  if (!eventId || !adminId) {
    console.log('ℹ️ Skipping EventApprovals: no event or admin');
    return;
  }

  // Check if approval already exists
  if (await existsBy(pool, 'EventApprovals', 'event_id = @e', [
    { name: 'e', type: sql.Int, value: eventId }
  ])) {
    console.log('ℹ️ EventApproval already exists');
    return;
  }

  const cols = await getTableColumns(pool, 'EventApprovals');
  await insertAdaptive(pool, 'EventApprovals', {
    event_id: eventId,
    approved_by: adminId, // ← Added required field
    approver_role: cols.has('approver_role') ? 'admin' : undefined,
    approval_status: cols.has('approval_status') ? 'approved' : undefined,
    comments: cols.has('comments') ? 'Initial approval' : undefined
  });
  console.log('✅ EventApproval added');
}

async function seedCirculars(pool) {
  if (!(await tableExists(pool, 'Circulars'))) return;
  console.log('📣 Seeding Circulars...');

  const adminId = await getIdBy(pool, 'Users', 'email = @e', [{ name: 'e', value: 'admin@vitap.ac.in' }]);
  
  if (!adminId) {
    console.log('ℹ️ Skipping Circulars: no admin user');
    return;
  }

  const cols = await getTableColumns(pool, 'Circulars');
  const subjectCol = cols.has('title') ? 'title'
                   : cols.has('subject') ? 'subject'
                   : cols.has('heading') ? 'heading'
                   : null;

  if (!subjectCol) {
    console.log('ℹ️ Skipping Circulars: no title/subject');
    return;
  }

  const subject = 'Welcome to EventOpia';
  if (await existsBy(pool, 'Circulars', `[${subjectCol}] = @s`, [{ name: 's', value: subject }])) {
    console.log('ℹ️ Circular exists');
    return;
  }

  const bodyCol = cols.has('content') ? 'content'
               : cols.has('message') ? 'message'
               : cols.has('body') ? 'body'
               : null;

  await insertAdaptive(pool, 'Circulars', {
    [subjectCol]: subject,
    created_by: adminId, // ← Added required field
    [bodyCol || '']: bodyCol ? 'Platform launched. Explore events and clubs!' : undefined,
    status: cols.has('status') ? 'active' : undefined
  });
  console.log('✅ Circular added');
}

async function seedUserSessions(pool) {
  if (!(await tableExists(pool, 'UserSessions'))) return;
  console.log('🔑 Seeding UserSessions...');

  const userId = await getIdBy(pool, 'Users', 'email = @e', [{ name: 'e', value: 'student@vitap.ac.in' }]);
  if (!userId) {
    console.log('ℹ️ Skipping UserSessions: user missing');
    return;
  }

  // Check if session already exists
  if (await existsBy(pool, 'UserSessions', 'user_id = @u', [
    { name: 'u', type: sql.Int, value: userId }
  ])) {
    console.log('ℹ️ UserSession already exists');
    return;
  }

  // Set expiration to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await insertAdaptive(pool, 'UserSessions', {
    user_id: userId,
    session_token: 'demo-token-' + Date.now(),
    expires_at: expiresAt.toISOString(), // ← Added required field
    is_active: 1
  });
  console.log('✅ UserSession added');
}

export async function seedInitialData(pool) {
  console.log('\n🌱 Seeding initial data...');
  try {
    await seedUsers(pool);
    await seedClubs(pool);
    await seedClubMembers(pool);
    await seedEvents(pool);
    await seedEventRegistrations(pool);
    await seedEventApprovals(pool);
    await seedCirculars(pool);
    await seedUserSessions(pool);
    console.log('🌱 Seeding complete.\n');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    throw err;
  }
}

export default seedInitialData;
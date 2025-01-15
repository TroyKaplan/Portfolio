require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, ensureRole } = require('./src/middlewares/auth');
const WebSocket = require('ws');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const http = require('http');
const { validateEmail } = require('./src/middlewares/validateEmail');
const cron = require('node-cron');

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Add helper function
async function updateSubscriptionStatus(pool, customerId, subscriptionId, status, endDate) {
  try {
    const query = `
      UPDATE users 
      SET subscription_status = $1,
          subscription_id = $2,
          subscription_end_date = $3
      WHERE stripe_customer_id = $4
    `;
    await pool.query(query, [status, subscriptionId, endDate, customerId]);
    console.log(`[updateSubscriptionStatus] Updated subscription status for customer ${customerId} to ${status}`);
  } catch (error) {
    console.error('[updateSubscriptionStatus] Error updating subscription status:', error);
  }
}

// Webhook handler
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const logPrefix = '[Webhook]';
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(`${logPrefix} Received event:`, event.type);

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        const subscription = event.data.object;
        const now = Math.floor(Date.now() / 1000);
        const shouldBeSubscriber = (
          subscription.status === 'active' || 
          (subscription.status === 'canceled' && subscription.current_period_end > now)
        );

        await pool.query(
          `UPDATE users 
           SET subscription_status = $1,
               role = CASE WHEN $5 THEN 'subscriber' ELSE 'user' END,
               subscription_end_date = to_timestamp($2),
               subscription_start_date = to_timestamp($3),
               subscription_id = $4
           WHERE stripe_customer_id = $6`,
          [
            subscription.status,
            subscription.current_period_end,
            subscription.current_period_start,
            subscription.id,
            shouldBeSubscriber,
            subscription.customer
          ]
        );
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        const endTime = deletedSub.current_period_end;
        const hasRemainingTime = endTime > Math.floor(Date.now() / 1000);

        await pool.query(
          `UPDATE users 
           SET subscription_status = $1,
               role = CASE 
                 WHEN $2 > extract(epoch from now()) THEN 'subscriber'
                 ELSE 'user'
               END,
               subscription_end_date = to_timestamp($2),
               subscription_id = CASE 
                 WHEN $2 <= extract(epoch from now()) THEN NULL 
                 ELSE subscription_id 
               END
           WHERE stripe_customer_id = $3`,
          [
            hasRemainingTime ? 'canceled' : 'inactive',
            endTime,
            deletedSub.customer
          ]
        );
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Then your other middleware
app.use(express.json());

// Update CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seahorse-app-thp9i.ondigitalocean.app', 'https://www.troykaplan.dev', 'https://troykaplan.dev'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,  // Important for cookies/sessions
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.post('/run-code', async (req, res) => {
    const { code } = req.body;

    try {
        const response = await axios.post('https://api.jdoodle.com/v1/execute', {
            script: code,
            language: 'cpp',
            versionIndex: '0',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
        });
        res.json({ output: response.data.output });
    } catch (error) {
        res.status(500).json({ output: 'Error executing code. JDoodle Server Not Enabled.' });
    }
});

// Add new endpoint for game status
app.get('/api/game-status', async (req, res) => {
  try {
    let response;
    // Try HTTPS first
    try {
      response = await axios.get('https://status.troykaplan.dev:4351/status', {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 1500 // 1.5 second timeout  MAKE LONGER WHEN YOU HAVE CERTS
      });
    } catch (httpsError) {
      // Fall back to HTTP
      response = await axios.get('http://64.23.147.242:4350/status', {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 15000 // 15 second timeout
      });
    }

    // Validate that we received JSON
    if (typeof response?.data !== 'object') {
      throw new Error('Invalid response format');
    }

    res.json(response.data);
  } catch (error) {
    // Don't change status on timeout, return last known state
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      res.json({ 
        wolfscape: true, 
        rocketGame: true,
        warning: 'Slow response, using last known state' 
      });
    } else {
      console.error('Game status check failed:', error.message);
      res.json({ 
        wolfscape: false, 
        rocketGame: false,
        error: 'Server temporarily unavailable' 
      });
    }
  }
});

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Anonymous visitor tracking middleware
app.use(async (req, res, next) => {
  if (!req.sessionID) {
    next();
    return;
  }

  try {
    // Skip if user is authenticated
    if (req.isAuthenticated()) {
      next();
      return;
    }

    // Track anonymous session
    await pool.query(
      `INSERT INTO anonymous_sessions (session_id, device_info)
       VALUES ($1, $2)
       ON CONFLICT (session_id)
       DO UPDATE SET 
         last_seen = CURRENT_TIMESTAMP,
         page_views = anonymous_sessions.page_views + 1`,
      [req.sessionID, req.headers['user-agent'] ? { 
        browser: req.headers['user-agent'],
        ip: req.ip // Be careful with PII/GDPR compliance
      } : null]
    );
    
    next();
  } catch (error) {
    console.error('Error tracking anonymous visitor:', error);
    next(); // Continue even if tracking fails
  }
});

// Session configuration
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'none',
    domain: process.env.NODE_ENV === 'production' ? '.troykaplan.dev' : undefined
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Registration route
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, role',
      [username, hashedPassword]
    );
    
    res.json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation
      res.status(400).json({ message: 'Username already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }
});

// Login route
app.post('/api/auth/login', passport.authenticate('local'), async (req, res) => {
  const logPrefix = '[Login]';
  try {
    // Update last login time
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [req.user.id]
    );

    // Fetch and verify subscription status
    const result = await pool.query(
      `SELECT subscription_status, subscription_end_date, subscription_id, 
              stripe_customer_id, role
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    
    const userData = result.rows[0];

    if (userData.stripe_customer_id && userData.subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(userData.subscription_id);
        const now = Math.floor(Date.now() / 1000);
        const shouldBeSubscriber = (
          stripeSubscription.status === 'active' || 
          (stripeSubscription.status === 'canceled' && stripeSubscription.current_period_end > now)
        );

        // Update subscription status and role if needed
        if (stripeSubscription.status !== userData.subscription_status || 
            (shouldBeSubscriber && userData.role !== 'subscriber')) {
          console.log(`${logPrefix} Updating subscription status on login`);
          
          const updateResult = await pool.query(
            `UPDATE users 
             SET subscription_status = $1,
                 role = CASE 
                   WHEN $4 THEN 'subscriber'
                   ELSE 'user'
                 END,
                 subscription_end_date = to_timestamp($2)
             WHERE id = $3
             RETURNING role, subscription_status, subscription_end_date`,
            [
              stripeSubscription.status,
              stripeSubscription.current_period_end,
              req.user.id,
              shouldBeSubscriber
            ]
          );

          // Update the user object with new data
          req.user.role = updateResult.rows[0].role;
          req.user.subscription_status = updateResult.rows[0].subscription_status;
          req.user.subscription_end_date = updateResult.rows[0].subscription_end_date;
        }
      } catch (stripeError) {
        console.error(`${logPrefix} Stripe error:`, stripeError);
        if (stripeError.code === 'resource_missing') {
          console.log(`${logPrefix} Subscription not found in Stripe, marking as inactive`);
          await pool.query(
            `UPDATE users 
             SET subscription_status = 'inactive',
                 role = 'user',
                 subscription_id = NULL,
                 subscription_end_date = NULL
             WHERE id = $1`,
            [req.user.id]
          );
          req.user.role = 'user';
          req.user.subscription_status = 'inactive';
        }
      }
    }

    res.json({ 
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        subscription_status: req.user.subscription_status,
        subscription_end_date: req.user.subscription_end_date
      }
    });
  } catch (error) {
    console.error(`${logPrefix} Error during login:`, error);
    res.status(500).json({ message: 'Error during login process' });
  }
});

// Logout route
app.post('/api/auth/logout', async (req, res) => {
  const sessionId = req.sessionID;
  
  try {
    // Update session end time
    await pool.query(
      `UPDATE user_sessions 
       SET session_end = CURRENT_TIMESTAMP 
       WHERE sid = $1`,
      [sessionId]
    );

    // Calculate and update final session time
    if (req.user) {
      await pool.query(
        `UPDATE users 
         SET total_time_spent = total_time_spent + 
           EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - (
             SELECT last_seen 
             FROM active_users 
             WHERE user_id = $1 
             ORDER BY last_seen DESC 
             LIMIT 1
           )))
         WHERE id = $1`,
        [req.user.id]
      );
    }

    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  } catch (err) {
    console.error('Error updating session end:', err);
    res.status(500).json({ message: 'Error during logout' });
  }
});

// Example of a protected route
app.get('/protected', ensureAuthenticated, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// Example of a role-protected route
app.get('/admin-only', ensureRole('admin'), (req, res) => {
  res.json({ message: 'This is an admin-only route' });
});

// Create subscription endpoint
app.post('/api/create-subscription', ensureAuthenticated, async (req, res) => {
  try {
    console.log('[SubscriptionService] Starting subscription creation for user:', req.user.id);
    
    // Get or create customer
    let customer = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
    let stripeCustomerId = customer.rows[0]?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      const userInfo = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
      const stripeCustomer = await stripe.customers.create({
        email: userInfo.rows[0].email,
        metadata: { userId: req.user.id }
      });
      stripeCustomerId = stripeCustomer.id;
      
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [stripeCustomerId, req.user.id]
      );
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set the payment method as the default for the customer
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: { userId: req.user.id }
    });

    console.log('[SubscriptionService] Subscription created:', subscription);

    // Update user record
    await pool.query(
      `UPDATE users 
       SET subscription_id = $1,
           subscription_status = 'incomplete',
           subscription_start_date = NOW()
       WHERE id = $2`,
      [subscription.id, req.user.id]
    );

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('[SubscriptionService] Error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get all users (admin only)
app.get('/api/users', ensureRole('admin'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('Attempting database query...');
    const result = await pool.query(
      `SELECT id, username, role, created_at, last_login, total_time_spent FROM users`
    );
    
    if (!result || !result.rows) {
      console.error('No result or rows from database');
      return res.status(500).json({ message: 'Database query failed' });
    }
    
    console.log('Query successful, row count:', result.rows.length);
    return res.json(result.rows);
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// Update user role (admin only)
app.post('/api/update-role', ensureRole('admin'), async (req, res) => {
  const { userId, role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role',
      [role, userId]
    );
    res.json({ message: 'Role updated successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role' });
  }
});

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

let esp32Socket = null;

wss.on('connection', (ws, request) => {
  const isESP32 = request.url.includes('/esp32');

  if (isESP32) {
    esp32Socket = ws;
    ws.on('message', (message) => {
      console.log('Received from ESP32:', message);
    });
    ws.on('close', () => {
      esp32Socket = null;
    });
  } else {
    // Connections from other clients (e.g., your admin interface)
    ws.on('message', (message) => {
      if (esp32Socket) {
        esp32Socket.send(message);
      } else {
        ws.send('ESP32 is not connected.');
      }
    });
  }
});

// Upgrade HTTP server to handle WebSocket
server.on('upgrade', (request, socket, head) => {
  // Authenticate the request if needed
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Add after the login route
app.get('/api/auth/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Track active users
app.post('/api/auth/heartbeat', ensureAuthenticated, async (req, res) => {
  const logPrefix = '[Heartbeat]';
  try {
    console.log(`${logPrefix} Request:`, {
      user: req.user,
      currentPage: req.body.currentPage,
      sessionId: req.sessionID
    });

    await pool.query(
      `INSERT INTO active_users (session_id, user_id, username, last_seen, current_page) 
       VALUES ($1, $2, $3, NOW(), $4) 
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         last_seen = NOW(),
         session_id = $1,
         current_page = $4`,
      [req.sessionID, req.user.id, req.user.username, req.body.currentPage]
    );

    console.log(`${logPrefix} Success for user:`, req.user.username);
    res.json({ success: true });
  } catch (error) {
    console.error(`${logPrefix} Error:`, {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ message: 'Error updating activity' });
  }
});

// Get active users (admin only)
app.get('/api/active-users', ensureRole('admin'), async (req, res) => {
  try {
    console.log('Fetching active users...');
    
    // Get authenticated active users
    const authenticatedUsers = await pool.query(
      `SELECT 
        u.id, 
        u.username, 
        u.role, 
        u.email, 
        au.last_seen,
        COALESCE(au.current_page, 'browsing') as current_page
       FROM users u
       INNER JOIN active_users au ON u.id = au.user_id
       WHERE au.last_seen > NOW() - INTERVAL '5 minutes'
       ORDER BY au.last_seen DESC`
    );
    console.log('Authenticated users found:', authenticatedUsers.rows.length);
    
    // Get anonymous users with better error handling
    const anonymousStats = await pool.query(
      `SELECT 
        COUNT(*) as count,
        array_remove(array_agg(DISTINCT current_page), NULL) as current_pages
       FROM anonymous_sessions
       WHERE last_seen > NOW() - INTERVAL '5 minutes'`
    );
    console.log('Anonymous stats:', anonymousStats.rows[0]);

    const response = {
      authenticated: authenticatedUsers.rows,
      anonymous: {
        count: parseInt(anonymousStats.rows[0].count) || 0,
        currentPages: anonymousStats.rows[0].current_pages || []
      },
      totalActive: authenticatedUsers.rows.length + (parseInt(anonymousStats.rows[0].count) || 0)
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Detailed error in /api/active-users:', {
      message: error.message,
      stack: error.stack,
      query: error.query
    });
    res.status(500).json({ 
      message: 'Error fetching active users',
      details: error.message
    });
  }
});

// Track anonymous sessions
app.post('/api/anonymous-heartbeat', async (req, res) => {
  try {
    const { currentPage } = req.body;
    
    await pool.query(
      `INSERT INTO anonymous_sessions (session_id, last_seen, current_page) 
       VALUES ($1, NOW(), $2)
       ON CONFLICT (session_id) 
       DO UPDATE SET 
         last_seen = NOW(),
         current_page = $2`,
      [req.sessionID, currentPage]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating anonymous activity:', error);
    res.status(500).json({ message: 'Error updating anonymous activity' });
  }
});

app.get('/api/users/:userId', ensureRole('admin'), async (req, res) => {
  try {
    console.log('Fetching details for user ID:', req.params.userId);
    const userResult = await pool.query(
      `SELECT 
        u.*,
        s.device_info,
        s.expire as session_expire,
        COALESCE(json_agg(DISTINCT g.*) FILTER (WHERE g.id IS NOT NULL), '[]') as games,
        COALESCE(json_agg(DISTINCT a.*) FILTER (WHERE a.id IS NOT NULL), '[]') as achievements,
        u.subscription_status,
        u.subscription_id,
        u.subscription_end_date,
        u.stripe_customer_id,
        u.created_at as member_since,
        u.role,
        u.email,
        u.username
      FROM users u
      LEFT JOIN (
        SELECT DISTINCT ON (user_id) *
        FROM user_sessions
        WHERE device_info IS NOT NULL
        ORDER BY user_id, expire DESC
      ) s ON u.id = s.user_id
      LEFT JOIN game_stats g ON u.id = g.user_id
      LEFT JOIN achievements a ON u.id = a.user_id
      WHERE u.id = $1
      GROUP BY u.id, s.device_info, s.expire`,
      [req.params.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Query result:', userResult.rows[0]);
    return res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

// Add this before any catch-all routes
const apiRouter = express.Router();

// Move the profile endpoint to use the router
apiRouter.get('/user/profile', ensureAuthenticated, async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT 
        username, email, role, subscription_status,
        subscription_start_date, subscription_end_date,
        total_time_spent
      FROM users 
      WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Fallback check: If subscription is active but role isn't subscriber
    if (user.subscription_status === 'active' && user.role !== 'subscriber') {
      await pool.query(
        `UPDATE users SET role = 'subscriber' WHERE id = $1`,
        [req.user.id]
      );
      user.role = 'subscriber';
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile data' });
  }
});

// Use the API router with the /api prefix
app.use('/api', apiRouter);

// Add this before the catch-all route
app.get('/api/visitor-stats', ensureRole('admin'), async (req, res) => {
  try {
    // Get 30-day summary with daily averages
    const monthlyStats = await pool.query(`
      WITH daily_stats AS (
        SELECT 
          date,
          ROUND(AVG(total_users)) as avg_total_users,
          ROUND(AVG(authenticated_users)) as avg_auth_users,
          ROUND(AVG(anonymous_users)) as avg_anon_users,
          MAX(total_users) as peak_users
        FROM visitor_analytics
        WHERE timestamp > NOW() - INTERVAL '30 days'
        GROUP BY date
      )
      SELECT 
        date::TEXT,
        avg_total_users as total_users,
        avg_auth_users as authenticated_users,
        avg_anon_users as anonymous_users,
        peak_users as peak_concurrent
      FROM daily_stats
      ORDER BY date DESC
    `);

    // Calculate overall averages
    const averages = await pool.query(`
      SELECT 
        ROUND(AVG(total_users)) as avg_total_users,
        ROUND(AVG(authenticated_users)) as avg_auth_users,
        ROUND(AVG(anonymous_users)) as avg_anon_users,
        MAX(total_users) as peak_users
      FROM visitor_analytics
      WHERE timestamp > NOW() - INTERVAL '30 days'
    `);

    res.json({
      summary: {
        averageTotal: averages.rows[0].avg_total_users || 0,
        averageAuthenticated: averages.rows[0].avg_auth_users || 0,
        averageAnonymous: averages.rows[0].avg_anon_users || 0,
        peakConcurrent: averages.rows[0].peak_users || 0
      },
      dailyStats: monthlyStats.rows
    });
  } catch (error) {
    console.error('Error fetching visitor statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Your catch-all route should come after all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Add email update endpoint
app.post('/api/user/update-email', ensureAuthenticated, async (req, res) => {
  const { email } = req.body;
  const logPrefix = '[UpdateEmail]';

  if (!email) {
    return res.status(400).json({
      error: 'Email is required',
      code: 'EMAIL_REQUIRED'
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      code: 'INVALID_EMAIL'
    });
  }

  try {
    // Check if email is already in use
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, req.user.id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Email already in use',
        code: 'EMAIL_EXISTS'
      });
    }

    const user = await pool.query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [req.user.id]
    );

    await pool.query('BEGIN');

    await pool.query(
      'UPDATE users SET email = $1 WHERE id = $2',
      [email, req.user.id]
    );

    if (user.rows[0].stripe_customer_id) {
      await stripe.customers.update(
        user.rows[0].stripe_customer_id,
        { email: email }
      );
    }

    await pool.query('COMMIT');
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({ 
      error: 'Failed to update email',
      code: 'UPDATE_FAILED',
      message: error.message 
    });
  }
});

// Add password change endpoint
app.post('/api/user/change-password', ensureAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const logPrefix = '[ChangePassword]';

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: 'Both current and new passwords are required',
      code: 'MISSING_FIELDS'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      error: 'New password must be at least 8 characters long',
      code: 'PASSWORD_TOO_SHORT'
    });
  }

  try {
    const user = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    
    if (!user.rows.length) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.rows[0].password);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({
      error: 'Failed to change password',
      code: 'UPDATE_FAILED',
      message: error.message
    });
  }
});

// Add this near your other endpoints
app.get('/api/health/db', async (req, res) => {
  try {
    // Test query
    await pool.query('SELECT NOW()');
    res.json({ status: 'healthy', message: 'Database connection successful' });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Add this after your route definitions
// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    // Get current active users count
    const activeStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT au.user_id) as authenticated_users,
        (
          SELECT COUNT(DISTINCT session_id) 
          FROM anonymous_sessions 
          WHERE last_seen > NOW() - INTERVAL '5 minutes'
        ) as anonymous_users
      FROM active_users au 
      WHERE au.last_seen > NOW() - INTERVAL '5 minutes'
    `);

    // Store the statistics
    await pool.query(`
      INSERT INTO visitor_analytics
        (timestamp, total_users, authenticated_users, anonymous_users)
      VALUES 
        (NOW(), $1, $2, $3)`,
      [
        activeStats.rows[0].authenticated_users + activeStats.rows[0].anonymous_users,
        activeStats.rows[0].authenticated_users,
        activeStats.rows[0].anonymous_users
      ]
    );
  } catch (error) {
    console.error('Error collecting visitor analytics:', error);
  }
});

app.delete('/api/users/:userId', ensureRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Start a transaction
    await pool.query('BEGIN');
    
    // Delete from all related tables
    await pool.query('DELETE FROM active_users WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM game_stats WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM achievements WHERE user_id = $1', [userId]);
    
    // Finally delete the user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    await pool.query('COMMIT');
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});
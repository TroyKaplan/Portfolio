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
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log(`${logPrefix} Processing payment success for customer:`, invoice.customer);
        
        // Update user role and subscription status immediately
        await pool.query(
          `UPDATE users 
           SET subscription_status = 'active',
               role = 'subscriber',
               subscription_end_date = to_timestamp($1),
               subscription_start_date = to_timestamp($2)
           WHERE stripe_customer_id = $3`,
          [
            invoice.lines.data[0].period.end,
            invoice.lines.data[0].period.start,
            invoice.customer
          ]
        );
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        console.log(`${logPrefix} Processing subscription deletion for:`, subscription.customer);
        
        // Calculate remaining time and update user status
        const now = Math.floor(Date.now() / 1000);
        const endTime = subscription.current_period_end;
        const hasRemainingTime = endTime > now;

        await pool.query(
          `UPDATE users 
           SET subscription_status = $1,
               role = CASE 
                 WHEN $2 > extract(epoch from now()) THEN 'subscriber'
                 ELSE 'user'
               END,
               subscription_end_date = to_timestamp($2)
           WHERE stripe_customer_id = $3`,
          [
            hasRemainingTime ? 'canceled' : 'inactive',
            endTime,
            subscription.customer
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
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
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
  try {
    const { deviceInfo } = req.body;
    // Update user's last login and device info
    await pool.query(
      `UPDATE users 
       SET last_login = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [req.user.id]
    );

    // Track session with device info
    await pool.query(
      `INSERT INTO user_sessions (sid, user_id, device_info, expire, sess)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (sid) 
       DO UPDATE SET 
         user_id = $2,
         device_info = $3,
         expire = $4,
         sess = $5`,
      [
        req.sessionID, 
        req.user.id, 
        deviceInfo, 
        req.session.cookie.expires,
        JSON.stringify(req.session)
      ]
    );

    res.json({ message: 'Logged in successfully', user: req.user });
  } catch (error) {
    console.error('Session tracking error:', error);
    res.json({ message: 'Logged in successfully', user: req.user });
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
  try {
    // Update active users
    await pool.query(
      `INSERT INTO active_users (session_id, user_id, username) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (session_id) 
       DO UPDATE SET last_seen = CURRENT_TIMESTAMP`,
      [req.sessionID, req.user.id, req.user.username]
    );

    // Update total time spent (increment by heartbeat interval - typically 30 seconds)
    await pool.query(
      `UPDATE users 
       SET total_time_spent = COALESCE(total_time_spent, 0) + 30
       WHERE id = $1`,
      [req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Error updating activity' });
  }
});

// Get active users (admin only)
app.get('/api/active-users', ensureRole('admin'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const result = await pool.query(
      `SELECT username, last_seen 
       FROM active_users 
       WHERE last_seen > NOW() - INTERVAL '10 minutes'`
    );
    
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching active users:', error);
    return res.status(500).json({ 
      message: 'Error fetching active users',
      error: error.message 
    });
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

// Your catch-all route should come after all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/api/visitor-stats', ensureRole('admin'), async (req, res) => {
  try {
    // Get current active sessions
    const currentStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT session_id) as total_anonymous,
        COUNT(DISTINCT CASE WHEN last_seen > NOW() - INTERVAL '10 minutes' 
              THEN session_id END) as active_anonymous,
        SUM(page_views) as total_page_views
      FROM anonymous_sessions
      WHERE last_seen > NOW() - INTERVAL '24 hours'
    `);

    // Get historical stats
    const historicalStats = await pool.query(`
      SELECT 
        date,
        anonymous_visitors,
        registered_visitors,
        total_page_views,
        peak_concurrent_users,
        average_session_duration
      FROM visitor_analytics
      WHERE date > CURRENT_DATE - INTERVAL '30 days'
      ORDER BY date DESC
    `);

    // Calculate weekly and monthly aggregates
    const aggregateStats = await pool.query(`
      SELECT 
        CASE 
          WHEN date > CURRENT_DATE - INTERVAL '7 days' THEN 'weekly'
          ELSE 'monthly'
        END as period,
        SUM(anonymous_visitors) as total_anonymous,
        SUM(registered_visitors) as total_registered,
        SUM(total_page_views) as total_views,
        MAX(peak_concurrent_users) as peak_users,
        AVG(EXTRACT(EPOCH FROM average_session_duration))::INTEGER as avg_duration
      FROM visitor_analytics
      WHERE date > CURRENT_DATE - INTERVAL '30 days'
      GROUP BY 
        CASE 
          WHEN date > CURRENT_DATE - INTERVAL '7 days' THEN 'weekly'
          ELSE 'monthly'
        END
    `);

    res.json({
      current: currentStats.rows[0],
      historical: historicalStats.rows,
      aggregates: aggregateStats.rows
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({ message: 'Error fetching visitor stats' });
  }
});

// Add this after your database configuration
async function scheduleAnalytics() {
    try {
        await pool.query('SELECT manage_anonymous_sessions()');
        console.log('Analytics aggregation completed successfully');
    } catch (error) {
        console.error('Error running analytics aggregation:', error);
    }
}

// Run once at startup
scheduleAnalytics();

// Run daily at 3 AM
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 3 && now.getMinutes() === 0) {
        scheduleAnalytics();
    }
}, 60000); // Check every minute

app.get('/api/subscription/status', ensureAuthenticated, async (req, res) => {
  const logPrefix = '[SubscriptionStatus]';
  try {
    const result = await pool.query(
      `SELECT subscription_status, subscription_end_date, subscription_id, 
              stripe_customer_id, role
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    
    const userData = result.rows[0];
    console.log(`${logPrefix} Database subscription data:`, userData);

    if (userData.stripe_customer_id && userData.subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(userData.subscription_id);
        console.log(`${logPrefix} Stripe subscription data:`, stripeSubscription);
        
        const now = Math.floor(Date.now() / 1000);
        const shouldBeSubscriber = (
          stripeSubscription.status === 'active' || 
          (stripeSubscription.status === 'canceled' && stripeSubscription.current_period_end > now)
        );

        if (stripeSubscription.status !== userData.subscription_status || 
            (shouldBeSubscriber && userData.role !== 'subscriber')) {
          console.log(`${logPrefix} Updating subscription status and role`);
          
          await pool.query(
            `UPDATE users 
             SET subscription_status = $1,
                 role = CASE 
                   WHEN $4 THEN 'subscriber'
                   ELSE 'user'
                 END,
                 subscription_end_date = to_timestamp($2)
             WHERE stripe_customer_id = $3
             RETURNING role, subscription_status`,
            [
              stripeSubscription.status,
              stripeSubscription.current_period_end,
              userData.stripe_customer_id,
              shouldBeSubscriber
            ]
          );

          userData.subscription_status = stripeSubscription.status;
          userData.role = shouldBeSubscriber ? 'subscriber' : 'user';
          userData.subscription_end_date = new Date(stripeSubscription.current_period_end * 1000);
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
             WHERE stripe_customer_id = $1`,
            [userData.stripe_customer_id]
          );
          userData.subscription_status = 'inactive';
          userData.role = 'user';
        }
      }
    }

    res.json(userData);
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
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

  try {
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

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
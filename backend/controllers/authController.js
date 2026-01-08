import { supabase } from '../utils/supabase.js';

export const register = async (req, res) => {
  try {
    console.log('📝 Register request received:', { email: req.body.email });
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    console.log('✅ User created in Supabase Auth');

    // Use upsert to handle cases where user already exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          id: authData.user.id,
          name,
          email,
          role,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (userError) {
      console.error('❌ User insert error:', userError);
      return res.status(400).json({ error: userError.message });
    }

    console.log('✅ Registration successful');
    res.status(201).json({
      user: userData,
      session: authData.session,
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: userData,
      session: authData.session,
      token: authData.session.access_token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

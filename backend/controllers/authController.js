import { supabase } from '../utils/supabase.js';

export const register = async (req, res) => {
  try {
<<<<<<< HEAD
    console.log('📝 Register request received:', { email: req.body.email });
=======
>>>>>>> b2682ac6e781bf09ca869f12e70fbc2bbffda57c
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
<<<<<<< HEAD
      console.error('❌ Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    console.log('✅ User created in Supabase Auth');

    // Use upsert to handle cases where user already exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(
=======
      return res.status(400).json({ error: authError.message });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
>>>>>>> b2682ac6e781bf09ca869f12e70fbc2bbffda57c
        {
          id: authData.user.id,
          name,
          email,
          role,
        },
<<<<<<< HEAD
        { onConflict: 'id' }
      )
=======
      ])
>>>>>>> b2682ac6e781bf09ca869f12e70fbc2bbffda57c
      .select()
      .single();

    if (userError) {
<<<<<<< HEAD
      console.error('❌ User insert error:', userError);
      return res.status(400).json({ error: userError.message });
    }

    console.log('✅ Registration successful');
=======
      return res.status(400).json({ error: userError.message });
    }

>>>>>>> b2682ac6e781bf09ca869f12e70fbc2bbffda57c
    res.status(201).json({
      user: userData,
      session: authData.session,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('❌ Registration error:', error);
=======
    console.error('Registration error:', error);
>>>>>>> b2682ac6e781bf09ca869f12e70fbc2bbffda57c
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

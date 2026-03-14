const { Authority } = require('../database/models');

// Get all authorities
exports.getAllAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find({ isActive: true });
    
    // For compatibility with frontend expectations
    const emails = authorities.map(a => a.email);
    
    res.json({
      success: true,
      data: authorities,
      authorities: emails
    });
  } catch (error) {
    console.error('Error fetching authorities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add or update authorities (Single or Bulk)
exports.saveAuthorities = async (req, res) => {
  try {
    const { authorities, name, email, role } = req.body;
    
    // Handle Bulk Update format
    if (authorities && Array.isArray(authorities)) {
      console.log('📝 Bulk individual email update logic restricted, using findOrCreate for each');
      
      const results = [];
      for (const emailStr of authorities) {
        let auth = await Authority.findOne({ email: emailStr.toLowerCase() });
        if (!auth) {
          auth = await Authority.create({
            name: emailStr.split('@')[0],
            email: emailStr,
            role: 'Secondary'
          });
        }
        results.push(auth);
      }
      
      const allEmails = results.map(r => r.email);
      return res.json({
        success: true,
        message: `${results.length} authorities processed`,
        authorities: allEmails
      });
    }
    
    // Handle Single format
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    let authority = await Authority.findOne({ email: email.toLowerCase() });
    
    if (authority) {
      authority.name = name || authority.name;
      authority.role = role || authority.role;
      await authority.save();
    } else {
      authority = await Authority.create({ name, email, role });
    }
    
    const allAuths = await Authority.find({ isActive: true });
    const allEmails = allAuths.map(a => a.email);
    
    res.json({
      success: true,
      message: 'Authority saved successfully',
      data: authority,
      authorities: allEmails
    });
  } catch (error) {
    console.error('Error saving authority:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete authority
exports.deleteAuthority = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support either email or ID deletion
    let result;
    if (id.includes('@')) {
      result = await Authority.findOneAndDelete({ email: id.toLowerCase() });
    } else {
      result = await Authority.findByIdAndDelete(id);
    }
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Authority not found' });
    }
    
    res.json({
      success: true,
      message: 'Authority deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting authority:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

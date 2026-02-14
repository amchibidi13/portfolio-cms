const bcrypt = require('bcrypt');
const { executeQuery, safeJsonParse, executeTransaction } = require('../config/database');

/**
 * Show login page
 */
function showLogin(req, res) {
  res.render('admin/login', {
    error: null,
    layout: false
  });
}

/**
 * Handle login
 */
async function handleLogin(req, res) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.render('admin/login', {
        error: 'Username and password are required',
        layout: false
      });
    }
    
    // Get user from database
    const result = await executeQuery(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.render('admin/login', {
        error: 'Invalid username or password',
        layout: false
      });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.render('admin/login', {
        error: 'Invalid username or password',
        layout: false
      });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    // Redirect to dashboard or return URL
    const returnTo = req.session.returnTo || '/admin/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.render('admin/login', {
      error: 'An error occurred during login',
      layout: false
    });
  }
}

/**
 * Handle logout
 */
function handleLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
}

/**
 * Show dashboard
 */
async function showDashboard(req, res) {
  try {
    // Get statistics
    const stats = {
      pages: 0,
      sections: 0,
      components: 0,
      projects: 0,
      articles: 0
    };
    
    const pagesResult = await executeQuery('SELECT COUNT(*) as count FROM pages');
    stats.pages = pagesResult.rows[0].count;
    
    const sectionsResult = await executeQuery('SELECT COUNT(*) as count FROM sections');
    stats.sections = sectionsResult.rows[0].count;
    
    const componentsResult = await executeQuery('SELECT COUNT(*) as count FROM components');
    stats.components = componentsResult.rows[0].count;
    
    const projectsResult = await executeQuery('SELECT COUNT(*) as count FROM projects');
    stats.projects = projectsResult.rows[0].count;
    
    const articlesResult = await executeQuery('SELECT COUNT(*) as count FROM articles');
    stats.articles = articlesResult.rows[0].count;
    
    res.render('admin/dashboard', {
      stats,
      layout: 'admin/layout'
    });
    
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).render('admin/error', {
      message: 'Error loading dashboard',
      layout: 'admin/layout'
    });
  }
}

/**
 * Show pages management
 */
async function showPages(req, res) {
  try {
    const result = await executeQuery(
      'SELECT * FROM pages ORDER BY nav_order ASC'
    );
    
    res.render('admin/pages', {
      pages: result.rows,
      layout: 'admin/layout'
    });
    
  } catch (error) {
    console.error('Error loading pages:', error.message);
    res.status(500).render('admin/error', {
      message: 'Error loading pages',
      layout: 'admin/layout'
    });
  }
}

/**
 * Show sections management
 */
async function showSections(req, res) {
  try {
    const sectionsResult = await executeQuery(`
      SELECT s.*, p.title as page_title, p.slug as page_slug
      FROM sections s
      JOIN pages p ON s.page_id = p.id
      ORDER BY p.nav_order ASC, s.display_order ASC
    `);
    
    const pagesResult = await executeQuery('SELECT * FROM pages ORDER BY nav_order ASC');
    
    res.render('admin/sections', {
      sections: sectionsResult.rows,
      pages: pagesResult.rows,
      layout: 'admin/layout'
    });
    
  } catch (error) {
    console.error('Error loading sections:', error.message);
    res.status(500).render('admin/error', {
      message: 'Error loading sections',
      layout: 'admin/layout'
    });
  }
}

/**
 * Show components management
 */
async function showComponents(req, res) {
  try {
    const componentsResult = await executeQuery(`
      SELECT c.*, s.section_key, p.title as page_title, p.slug as page_slug
      FROM components c
      JOIN sections s ON c.section_id = s.id
      JOIN pages p ON s.page_id = p.id
      ORDER BY p.nav_order ASC, s.display_order ASC, c.display_order ASC
    `);
    
    const sectionsResult = await executeQuery(`
      SELECT s.*, p.title as page_title
      FROM sections s
      JOIN pages p ON s.page_id = p.id
      ORDER BY p.nav_order ASC, s.display_order ASC
    `);
    
    const componentTypesResult = await executeQuery(
      'SELECT * FROM component_types ORDER BY type_name ASC'
    );
    
    const components = componentsResult.rows.map(c => ({
      ...c,
      config: safeJsonParse(c.config, {}),
      styles: safeJsonParse(c.styles, {})
    }));
    
    res.render('admin/components', {
      components,
      sections: sectionsResult.rows,
      componentTypes: componentTypesResult.rows,
      layout: 'admin/layout'
    });
    
  } catch (error) {
    console.error('Error loading components:', error.message);
    res.status(500).render('admin/error', {
      message: 'Error loading components',
      layout: 'admin/layout'
    });
  }
}

/**
 * Show site configuration
 */
async function showConfig(req, res) {
  try {
    const configResult = await executeQuery(
      'SELECT * FROM site_config ORDER BY config_key ASC'
    );
    
    const textContentResult = await executeQuery(
      'SELECT * FROM text_content ORDER BY content_key ASC'
    );
    
    res.render('admin/config', {
      config: configResult.rows,
      textContent: textContentResult.rows,
      layout: 'admin/layout'
    });
    
  } catch (error) {
    console.error('Error loading config:', error.message);
    res.status(500).render('admin/error', {
      message: 'Error loading configuration',
      layout: 'admin/layout'
    });
  }
}

/**
 * Update site configuration
 */
async function updateConfig(req, res) {
  try {
    const { config_key, config_value } = req.body;
    
    if (!config_key || !config_value) {
      return res.status(400).json({
        success: false,
        message: 'Config key and value are required'
      });
    }
    
    await executeQuery(
      `INSERT INTO site_config (config_key, config_value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(config_key) DO UPDATE SET 
       config_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [config_key, config_value, config_value]
    );
    
    res.json({
      success: true,
      message: 'Configuration updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating config:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating configuration'
    });
  }
}

/**
 * Update text content
 */
async function updateTextContent(req, res) {
  try {
    const { content_key, content_value } = req.body;
    
    if (!content_key || content_value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Content key and value are required'
      });
    }
    
    await executeQuery(
      `INSERT INTO text_content (content_key, content_value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(content_key) DO UPDATE SET 
       content_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [content_key, content_value, content_value]
    );
    
    res.json({
      success: true,
      message: 'Text content updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating text content:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating text content'
    });
  }
}

/**
 * Update component
 */
async function updateComponent(req, res) {
  try {
    const { id } = req.params;
    const { config, styles, is_visible, display_order } = req.body;
    
    const updates = [];
    const params = [];
    
    if (config !== undefined) {
      updates.push('config = ?');
      params.push(JSON.stringify(config));
    }
    
    if (styles !== undefined) {
      updates.push('styles = ?');
      params.push(JSON.stringify(styles));
    }
    
    if (is_visible !== undefined) {
      updates.push('is_visible = ?');
      params.push(is_visible ? 1 : 0);
    }
    
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(display_order);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await executeQuery(
      `UPDATE components SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({
      success: true,
      message: 'Component updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating component:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating component'
    });
  }
}

/**
 * Create new page
 */
async function createPage(req, res) {
  try {
    const { slug, title, meta_description, show_in_nav, nav_order } = req.body;
    
    if (!slug || !title) {
      return res.status(400).json({
        success: false,
        message: 'Slug and title are required'
      });
    }
    
    // Check if slug already exists
    const existing = await executeQuery(
      'SELECT id FROM pages WHERE slug = ?',
      [slug]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A page with this slug already exists'
      });
    }
    
    await executeQuery(
      `INSERT INTO pages (slug, title, meta_description, show_in_nav, nav_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [slug, title, meta_description || '', show_in_nav ? 1 : 0, nav_order || 0]
    );
    
    res.json({
      success: true,
      message: 'Page created successfully'
    });
    
  } catch (error) {
    console.error('Error creating page:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating page'
    });
  }
}

/**
 * Create new section
 */
async function createSection(req, res) {
  try {
    const { page_id, section_key, display_order, background_color, padding } = req.body;
    
    if (!page_id || !section_key) {
      return res.status(400).json({
        success: false,
        message: 'Page ID and section key are required'
      });
    }
    
    await executeQuery(
      `INSERT INTO sections (page_id, section_key, display_order, background_color, padding) 
       VALUES (?, ?, ?, ?, ?)`,
      [page_id, section_key, display_order || 0, background_color || '', padding || '']
    );
    
    res.json({
      success: true,
      message: 'Section created successfully'
    });
    
  } catch (error) {
    console.error('Error creating section:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating section'
    });
  }
}

/**
 * Create new component
 */
async function createComponent(req, res) {
  try {
    const { section_id, component_type, display_order, config, styles } = req.body;
    
    if (!section_id || !component_type) {
      return res.status(400).json({
        success: false,
        message: 'Section ID and component type are required'
      });
    }
    
    await executeQuery(
      `INSERT INTO components (section_id, component_type, display_order, config, styles) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        section_id,
        component_type,
        display_order || 0,
        JSON.stringify(config || {}),
        JSON.stringify(styles || {})
      ]
    );
    
    res.json({
      success: true,
      message: 'Component created successfully'
    });
    
  } catch (error) {
    console.error('Error creating component:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating component'
    });
  }
}

/**
 * Delete page
 */
async function deletePage(req, res) {
  try {
    const { id } = req.params;
    
    await executeQuery('DELETE FROM pages WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting page:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting page'
    });
  }
}

/**
 * Delete section
 */
async function deleteSection(req, res) {
  try {
    const { id } = req.params;
    
    await executeQuery('DELETE FROM sections WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting section:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting section'
    });
  }
}

/**
 * Delete component
 */
async function deleteComponent(req, res) {
  try {
    const { id } = req.params;
    
    await executeQuery('DELETE FROM components WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Component deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting component:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting component'
    });
  }
}

module.exports = {
  showLogin,
  handleLogin,
  handleLogout,
  showDashboard,
  showPages,
  showSections,
  showComponents,
  showConfig,
  updateConfig,
  updateTextContent,
  updateComponent,
  createPage,
  createSection,
  createComponent,
  deletePage,
  deleteSection,
  deleteComponent
};

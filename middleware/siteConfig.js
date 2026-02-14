const { executeQuery, safeJsonParse } = require('../config/database');

/**
 * Load site configuration and make it available in all views
 */
async function loadSiteConfig(req, res, next) {
  try {
    // Load site configuration
    const configResult = await executeQuery('SELECT config_key, config_value FROM site_config');
    const siteConfig = {};
    
    configResult.rows.forEach(row => {
      siteConfig[row.config_key] = row.config_value;
    });

    // Load navigation items
    const navResult = await executeQuery(
      'SELECT slug, title, nav_order FROM pages WHERE is_published = 1 AND show_in_nav = 1 ORDER BY nav_order ASC'
    );
    
    const navigation = navResult.rows.map(row => ({
      slug: row.slug,
      title: row.title,
      url: row.slug === 'home' ? '/' : `/${row.slug}`
    }));

    // Make data available in all views
    res.locals.siteConfig = siteConfig;
    res.locals.navigation = navigation;
    res.locals.currentPath = req.path;

    next();
  } catch (error) {
    console.error('Error loading site config:', error.message);
    // Provide defaults if config load fails
    res.locals.siteConfig = {
      site_title: 'Portfolio',
      primary_color: '#2563eb'
    };
    res.locals.navigation = [];
    next();
  }
}

/**
 * Load text content helper function
 */
async function getTextContent(contentKey, fallback = '') {
  try {
    const result = await executeQuery(
      'SELECT content_value FROM text_content WHERE content_key = ?',
      [contentKey]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].content_value;
    }
    return fallback;
  } catch (error) {
    console.error(`Error loading text content for ${contentKey}:`, error.message);
    return fallback;
  }
}

/**
 * Load multiple text content items
 */
async function getTextContents(contentKeys) {
  try {
    const placeholders = contentKeys.map(() => '?').join(',');
    const result = await executeQuery(
      `SELECT content_key, content_value FROM text_content WHERE content_key IN (${placeholders})`,
      contentKeys
    );
    
    const contents = {};
    result.rows.forEach(row => {
      contents[row.content_key] = row.content_value;
    });
    
    // Add fallbacks for missing keys
    contentKeys.forEach(key => {
      if (!contents[key]) {
        contents[key] = '';
      }
    });
    
    return contents;
  } catch (error) {
    console.error('Error loading text contents:', error.message);
    const fallback = {};
    contentKeys.forEach(key => {
      fallback[key] = '';
    });
    return fallback;
  }
}

module.exports = {
  loadSiteConfig,
  getTextContent,
  getTextContents
};

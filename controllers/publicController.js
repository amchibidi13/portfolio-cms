const { executeQuery, safeJsonParse } = require('../config/database');
const { getTextContents } = require('../middleware/siteConfig');

/**
 * Render a page dynamically from database
 */
async function renderPage(req, res) {
  try {
    const slug = req.params.slug || 'home';
    
    // Get page data
    const pageResult = await executeQuery(
      'SELECT * FROM pages WHERE slug = ? AND is_published = 1',
      [slug]
    );
    
    if (pageResult.rows.length === 0) {
      return res.status(404).render('error', {
        statusCode: 404,
        message: 'Page Not Found',
        description: 'The page you are looking for does not exist.'
      });
    }
    
    const page = pageResult.rows[0];
    
    // Get sections for this page
    const sectionsResult = await executeQuery(
      'SELECT * FROM sections WHERE page_id = ? AND is_visible = 1 ORDER BY display_order ASC',
      [page.id]
    );
    
    const sections = await Promise.all(sectionsResult.rows.map(async (section) => {
      // Get components for this section
      const componentsResult = await executeQuery(
        'SELECT * FROM components WHERE section_id = ? AND is_visible = 1 ORDER BY display_order ASC',
        [section.id]
      );
      
      const components = componentsResult.rows.map(component => ({
        ...component,
        config: safeJsonParse(component.config, {}),
        styles: safeJsonParse(component.styles, {})
      }));
      
      return {
        ...section,
        components
      };
    }));
    
    // Collect all text content keys needed
    const textKeys = new Set();
    sections.forEach(section => {
      section.components.forEach(component => {
        if (component.config.text_key) {
          textKeys.add(component.config.text_key);
        }
        if (component.config.title_key) {
          textKeys.add(component.config.title_key);
        }
        if (component.config.subtitle_key) {
          textKeys.add(component.config.subtitle_key);
        }
        if (component.config.cta_key) {
          textKeys.add(component.config.cta_key);
        }
        // Form field labels
        if (component.config.fields) {
          component.config.fields.forEach(field => {
            if (field.label_key) {
              textKeys.add(field.label_key);
            }
          });
        }
        if (component.config.submit_button_key) {
          textKeys.add(component.config.submit_button_key);
        }
      });
    });
    
    // Load all text content
    const textContent = await getTextContents(Array.from(textKeys));
    
    // Get additional data based on component types
    let projects = [];
    let articles = [];
    
    const hasProjectsGrid = sections.some(s => 
      s.components.some(c => c.component_type === 'projects_grid')
    );
    
    const hasArticlesList = sections.some(s => 
      s.components.some(c => c.component_type === 'articles_list')
    );
    
    if (hasProjectsGrid) {
      const projectsResult = await executeQuery(
        'SELECT * FROM projects WHERE is_published = 1 ORDER BY display_order ASC'
      );
      projects = projectsResult.rows;
    }
    
    if (hasArticlesList) {
      const articlesResult = await executeQuery(
        'SELECT * FROM articles WHERE is_published = 1 ORDER BY published_at DESC'
      );
      articles = articlesResult.rows;
    }
    
    res.render('page', {
      page,
      sections,
      textContent,
      projects,
      articles
    });
    
  } catch (error) {
    console.error('Error rendering page:', error.message);
    res.status(500).render('error', {
      statusCode: 500,
      message: 'Error Loading Page',
      description: 'There was an error loading this page. Please try again later.'
    });
  }
}

/**
 * Handle contact form submission
 */
async function submitContactForm(req, res) {
  try {
    const { name, email, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }
    
    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Send confirmation email to user
    
    console.log('Contact form submission:', { name, email, message });
    
    res.json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.'
    });
    
  } catch (error) {
    console.error('Error submitting contact form:', error.message);
    res.status(500).json({
      success: false,
      message: 'There was an error sending your message. Please try again.'
    });
  }
}

/**
 * View single project
 */
async function viewProject(req, res) {
  try {
    const { slug } = req.params;
    
    const result = await executeQuery(
      'SELECT * FROM projects WHERE slug = ? AND is_published = 1',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).render('error', {
        statusCode: 404,
        message: 'Project Not Found',
        description: 'The project you are looking for does not exist.'
      });
    }
    
    const project = result.rows[0];
    
    res.render('project-detail', {
      project
    });
    
  } catch (error) {
    console.error('Error viewing project:', error.message);
    res.status(500).render('error', {
      statusCode: 500,
      message: 'Error Loading Project',
      description: 'There was an error loading this project.'
    });
  }
}

/**
 * View single article
 */
async function viewArticle(req, res) {
  try {
    const { slug } = req.params;
    
    const result = await executeQuery(
      'SELECT * FROM articles WHERE slug = ? AND is_published = 1',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).render('error', {
        statusCode: 404,
        message: 'Article Not Found',
        description: 'The article you are looking for does not exist.'
      });
    }
    
    const article = result.rows[0];
    
    res.render('article-detail', {
      article
    });
    
  } catch (error) {
    console.error('Error viewing article:', error.message);
    res.status(500).render('error', {
      statusCode: 500,
      message: 'Error Loading Article',
      description: 'There was an error loading this article.'
    });
  }
}

module.exports = {
  renderPage,
  submitContactForm,
  viewProject,
  viewArticle
};

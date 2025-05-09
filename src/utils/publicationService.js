/**
 * Publication Service
 * 
 * Handles interactions with NIH RePORTER API for retrieving publication data
 * related to HVP grants and projects.
 */

/**
 * Configuration for the NIH RePORTER API
 */
const REPORTER_API_CONFIG = {
  baseUrl: 'https://api.reporter.nih.gov/v2',
  endpoints: {
    projects: '/projects/search',
    publications: '/publications/search'
  },
  // List of HVP-related grant IDs to search for
  // These should be updated as new grants are added to the program
  hvpGrantIds: [
    'U19AI142733',
    'U19AI110818',
    'U01AI151698',
    'R01DE029992',
    'U01AI141990'
  ],
  // Request delay to comply with API rate limiting (1 request per second)
  requestDelay: 1000
};

/**
 * Load publications from local JSON file
 * Serves as a fallback when API is unavailable
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const loadLocalPublications = async () => {
  try {
    const response = await fetch('/data/hvp-publications.json');
    if (!response.ok) {
      throw new Error(`Failed to load publication data: ${response.status}`);
    }
    const data = await response.json();
    return data.publications || [];
  } catch (error) {
    console.error('Error loading local publication data:', error);
    return [];
  }
};

/**
 * Search for HVP-related grants in NIH RePORTER
 * 
 * @param {Object} options - Search options
 * @param {Number} options.limit - Maximum number of results to return
 * @param {Number} options.offset - Results offset for pagination
 * @returns {Promise<Array>} Array of grant objects
 */
export const searchHvpGrants = async (options = {}) => {
  const defaultOptions = {
    limit: 50,
    offset: 0
  };

  const searchOptions = { ...defaultOptions, ...options };

  try {
    const payload = {
      criteria: {
        project_nums: REPORTER_API_CONFIG.hvpGrantIds
      },
      limit: searchOptions.limit,
      offset: searchOptions.offset
    };

    const response = await fetch(`${REPORTER_API_CONFIG.baseUrl}${REPORTER_API_CONFIG.endpoints.projects}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`RePORTER API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching HVP grants:', error);
    return [];
  }
};

/**
 * Search for publications related to specific project IDs
 * 
 * @param {Array} projectIds - Array of project IDs to search for
 * @param {Object} options - Search options
 * @param {Number} options.limit - Maximum number of results to return
 * @param {Number} options.offset - Results offset for pagination
 * @returns {Promise<Array>} Array of publication objects
 */
export const searchPublicationsByProjects = async (projectIds = [], options = {}) => {
  const defaultOptions = {
    limit: 100,
    offset: 0
  };

  const searchOptions = { ...defaultOptions, ...options };

  if (!projectIds.length) {
    return [];
  }

  try {
    const payload = {
      criteria: {
        project_nums: projectIds
      },
      limit: searchOptions.limit,
      offset: searchOptions.offset
    };

    const response = await fetch(`${REPORTER_API_CONFIG.baseUrl}${REPORTER_API_CONFIG.endpoints.publications}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`RePORTER API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching publications by projects:', error);
    return [];
  }
};

/**
 * Throttle function to ensure we don't exceed API rate limits
 * 
 * @param {Function} func - Function to throttle
 * @param {Number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, delay) => {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall < delay) {
      const wait = delay - (now - lastCall);
      return new Promise(resolve => {
        setTimeout(() => {
          lastCall = Date.now();
          resolve(func(...args));
        }, wait);
      });
    }
    lastCall = now;
    return func(...args);
  };
};

// Throttled versions of API functions to prevent rate limit issues
export const throttledSearchHvpGrants = throttle(searchHvpGrants, REPORTER_API_CONFIG.requestDelay);
export const throttledSearchPublicationsByProjects = throttle(searchPublicationsByProjects, REPORTER_API_CONFIG.requestDelay);

/**
 * Transform API publication data to match our internal format
 * 
 * @param {Array} apiPublications - Publications from NIH RePORTER API
 * @returns {Array} Transformed publications in our internal format
 */
export const transformPublicationData = (apiPublications = []) => {
  return apiPublications.map((pub, index) => {
    // Extract author information
    const authors = (pub.authors || []).map(author => ({
      name: author.author_name || 'Unknown',
      affiliation: author.affiliation || ''
    }));

    // Extract grant information
    const grants = (pub.projects || []).map(project => ({
      grantId: project.project_num || '',
      grantTitle: project.project_title || '',
      institutionName: project.organization_name || '',
      principalInvestigator: project.contact_pi_name || ''
    }));

    return {
      id: `pub${(index + 1).toString().padStart(3, '0')}`,
      pmid: pub.pmid || '',
      title: pub.title || 'Untitled Publication',
      authors: authors,
      journal: pub.journal_title || '',
      publicationDate: pub.publication_date || '',
      volume: pub.volume || '',
      issue: pub.issue || '',
      pages: pub.pages || '',
      doi: pub.doi || '',
      abstract: pub.abstract_text || '',
      keywords: (pub.keywords || []),
      pubType: pub.publication_type || 'unknown',
      grants: grants,
      url: pub.full_text_url || `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`
    };
  });
};

/**
 * Fetch all HVP-related publications
 * First tries the NIH RePORTER API, falls back to local data if needed
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const fetchAllHvpPublications = async () => {
  try {
    // Step 1: Get all HVP-related grants
    const grants = await throttledSearchHvpGrants({ limit: 100 });
    
    if (!grants.length) {
      console.warn('No HVP grants found, falling back to local data');
      return loadLocalPublications();
    }
    
    // Step 2: Extract project IDs from grants
    const projectIds = grants.map(grant => grant.project_num);
    
    // Step 3: Get publications for these projects
    const publications = await throttledSearchPublicationsByProjects(projectIds, { limit: 200 });
    
    if (!publications.length) {
      console.warn('No publications found for HVP grants, falling back to local data');
      return loadLocalPublications();
    }
    
    // Step 4: Transform to our internal format
    return transformPublicationData(publications);
  } catch (error) {
    console.error('Error fetching HVP publications:', error);
    console.log('Falling back to local publication data');
    return loadLocalPublications();
  }
};

// Create a named object for the service
const publicationService = {
  loadLocalPublications,
  searchHvpGrants,
  searchPublicationsByProjects,
  fetchAllHvpPublications,
  transformPublicationData
};

export default publicationService;
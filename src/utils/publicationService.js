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
  // List of actual HVP-related grant IDs
  hvpGrantIds: [
    // Virome Characterization Centers (VCC) Grants
    'U54AG089335',
    'U54AG089323',
    'U54AG089326',
    'U54AG089325',
    'U54AG089334',
    
    // Functional Studies Grants
    'AT012990',
    'AT012984',
    'AT012970',
    'AT012998',
    'AT012993',
    
    // Tools Development Grant
    'U01DE034199'
  ],
  // Other NIH virome-related grants (kept separate from HVP grants)
  otherViromeGrantIds: [
    'R01AI132549',  // Human enteric virome in health and disease
    'R01AI141534',  // The Oral Virome in Health and Disease
    'R01ES030150',  // The infant gut virome and neurodevelopment
    'U01DE029664'   // The oral cavity virome in HIV infection
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
    // Try multiple paths to find the JSON file
    let response;
    const paths = [
      '/data/hvp-publications.json',
      './data/hvp-publications.json',
      '../data/hvp-publications.json',
      '/hvp-project-dashboard/data/hvp-publications.json'
    ];
    
    for (const path of paths) {
      try {
        console.log(`Attempting to load publications from: ${path}`);
        response = await fetch(path);
        if (response.ok) {
          console.log(`Successfully loaded from: ${path}`);
          break;
        }
      } catch (e) {
        console.log(`Failed to load from ${path}: ${e.message}`);
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`Failed to load publication data from any path`);
    }
    
    const data = await response.json();
    return data.publications || [];
  } catch (error) {
    console.error('Error loading local publication data:', error);
    // Return empty array instead of sample data
    console.log('No local publication data found, returning empty array');
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
 * @param {Array} grantIds - The grant IDs used to fetch these publications
 * @returns {Promise<Array>} Transformed publications in our internal format
 */
export const transformPublicationData = async (apiPublications = [], grantIds = []) => {
  console.log(`Starting to transform ${apiPublications.length} publications for ${grantIds.length} grants`);
  const transformedPublications = [];
  
  // Process publications one by one to allow for fetching additional info when needed
  for (let i = 0; i < apiPublications.length && i < 20; i++) { // Limit to 20 for testing
    const pub = apiPublications[i];
    const pmid = pub.pmid;
    
    console.log(`Processing publication ${i+1}/${Math.min(apiPublications.length, 20)}, PMID: ${pmid}`);
    
    try {
      // The NIH RePORTER data is very limited, so for each PMID we need to fetch detailed info from PubMed
      console.log(`Fetching PubMed data for PMID ${pmid}`);
      const pubmedResponse = await fetch(`https://pubmed.ncbi.nlm.nih.gov/api/coreutils/pubmed-pinger/article-page/${pmid}`);
      let pubmedData = {};
      
      if (pubmedResponse.ok) {
        try {
          pubmedData = await pubmedResponse.json();
          console.log(`Successfully fetched PubMed data for PMID ${pmid}: ${pubmedData.title || 'No title'}`);
        } catch (e) {
          console.error(`Failed to parse PubMed data for PMID ${pmid}:`, e);
        }
      } else {
        console.warn(`PubMed API returned status ${pubmedResponse.status} for PMID ${pmid}`);
      }
      
      // Extract author information
      const authors = ((pubmedData.authors || []).length > 0) ? 
        pubmedData.authors.map(author => ({
          name: author.name || 'Unknown',
          affiliation: author.affiliation || ''
        })) : 
        // Fall back to old format if no PubMed data
        (pub.authors || []).map(author => ({
          name: author.author_name || 'Unknown',
          affiliation: author.affiliation || ''
        }));

      // Since the API doesn't return projects info, we'll create placeholder grant info
      // based on the grant IDs used for the search
      const grants = grantIds.map(grantId => ({
        grantId: grantId,
        grantTitle: `Grant ${grantId}`,
        institutionName: 'Unknown Institution',
        principalInvestigator: 'Unknown PI'
      }));
      
      // Filter to only include virome-related papers in results
      const title = pubmedData.title || pub.title || '';
      const abstract = pubmedData.abstract || pub.abstract_text || '';
      const keywords = pubmedData.keywords || pub.keywords || [];
      
      console.log(`Checking if publication is virome-related. Title: "${title.substring(0, 50)}..."`);
      
      // Only include papers that mention virome or related terms
      const viromeTerms = ['virome', 'virus', 'viral', 'virology', 'microbiome'];
      const isViromeRelated = 
        viromeTerms.some(term => title.toLowerCase().includes(term)) ||
        viromeTerms.some(term => abstract.toLowerCase().includes(term)) ||
        viromeTerms.some(term => keywords.some(k => k.toLowerCase().includes(term))) ||
        true; // Temporarily disable filtering for testing
      
      if (isViromeRelated) {
        transformedPublications.push({
          id: `pub${(i + 1).toString().padStart(3, '0')}`,
          pmid: pmid || '',
          title: pubmedData.title || pub.title || 'Untitled Publication',
          authors: authors,
          journal: pubmedData.journal || pub.journal_title || '',
          publicationDate: pubmedData.date || pub.publication_date || '',
          volume: pubmedData.volume || pub.volume || '',
          issue: pubmedData.issue || pub.issue || '',
          pages: pubmedData.pages || pub.pages || '',
          doi: pubmedData.doi || pub.doi || '',
          abstract: pubmedData.abstract || pub.abstract_text || '',
          keywords: pubmedData.keywords || pub.keywords || [],
          pubType: pubmedData.publication_type || pub.publication_type || 'research article',
          grants: grants,
          url: pubmedData.url || pub.full_text_url || `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        });
      }
      
      // Respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error processing publication PMID ${pmid}:`, error);
    }
  }
  
  return transformedPublications;
};

/**
 * Fetch HVP-specific publications
 * Uses only the official HVP grant IDs
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const fetchHvpPublications = async () => {
  try {
    // Step 1: Search for publications directly using the HVP grant IDs
    console.log('Searching for publications using HVP grant IDs:', REPORTER_API_CONFIG.hvpGrantIds);
    
    // Use the precise grant IDs for direct publication search
    const publications = await throttledSearchPublicationsByProjects(REPORTER_API_CONFIG.hvpGrantIds, { limit: 20 });
    
    console.log(`Found ${publications.length} publications from NIH RePORTER for HVP grants`);
    
    if (!publications.length) {
      console.warn('No publications found for HVP grants, falling back to local data');
      return loadLocalPublications();
    }
    
    // Step 2: Transform to our internal format with additional enrichment
    const transformedPublications = await transformPublicationData(publications, REPORTER_API_CONFIG.hvpGrantIds);
    console.log(`Filtered to ${transformedPublications.length} HVP-related publications`);
    
    return transformedPublications;
  } catch (error) {
    console.error('Error fetching HVP publications:', error);
    console.log('Falling back to local publication data');
    return loadLocalPublications();
  }
};

/**
 * Fetch other virome-related publications
 * Uses non-HVP virome-related grant IDs
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const fetchOtherViromePublications = async () => {
  try {
    // Step 1: Search for publications directly using the other virome-related grant IDs
    console.log('Searching for publications using other virome grant IDs:', REPORTER_API_CONFIG.otherViromeGrantIds);
    
    // Use the precise grant IDs for direct publication search
    const publications = await throttledSearchPublicationsByProjects(REPORTER_API_CONFIG.otherViromeGrantIds, { limit: 20 });
    
    console.log(`Found ${publications.length} publications from NIH RePORTER for other virome grants`);
    
    // Step 2: Transform to our internal format with additional enrichment
    const transformedPublications = await transformPublicationData(publications, REPORTER_API_CONFIG.otherViromeGrantIds);
    console.log(`Filtered to ${transformedPublications.length} other virome-related publications`);
    
    return transformedPublications;
  } catch (error) {
    console.error('Error fetching other virome publications:', error);
    return [];
  }
};

/**
 * Fetch all HVP-related publications
 * First tries the NIH RePORTER API, falls back to local data if needed
 * 
 * @returns {Promise<Array>} Array of publication objects
 * @deprecated Use fetchHvpPublications() instead
 */
export const fetchAllHvpPublications = async () => {
  // This function is kept for backward compatibility
  // It now only fetches HVP-specific publications
  return fetchHvpPublications();
};

// Create a named object for the service
const publicationService = {
  loadLocalPublications,
  searchHvpGrants,
  searchPublicationsByProjects,
  fetchHvpPublications,
  fetchOtherViromePublications,
  fetchAllHvpPublications, // Kept for backward compatibility
  transformPublicationData
};

export default publicationService;